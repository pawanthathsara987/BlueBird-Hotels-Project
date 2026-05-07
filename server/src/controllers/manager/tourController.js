import sequelize from "../../config/database.js";
import supabase from "../../config/supabaseClient.js";
import { Tour, TourItem } from "../../models/index.js";
import multer from "multer";

const TOUR_IMAGE_BUCKET = "Blue-Bird";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const parseJsonField = (value, fallback = []) => {
  if (value == null || value === "") return fallback;
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const parseNumberField = (value, fallback = null) => {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const uploadImageToSupabase = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage.from(TOUR_IMAGE_BUCKET).upload(
    `images/${fileName}`,
    file.buffer,
    {
      contentType: file.mimetype,
      upsert: false,
    }
  );

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(TOUR_IMAGE_BUCKET).getPublicUrl(`images/${fileName}`);
  return data.publicUrl;
};

const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes(`/${TOUR_IMAGE_BUCKET}/`)) return;

  const oldPath = imageUrl.split(`/${TOUR_IMAGE_BUCKET}/`)[1];
  if (!oldPath) return;

  await supabase.storage.from(TOUR_IMAGE_BUCKET).remove([oldPath]);
};

const resolveTourItems = async (includedItems, transaction) => {
  const itemsArray = parseJsonField(includedItems, []);

  if (!itemsArray.length) return [];

  const resolvedItems = await Promise.all(
    itemsArray.map(async (item) => {
      if (item == null || item === "") return null;

      if (typeof item === "number" || /^\d+$/.test(String(item))) {
        return TourItem.findByPk(item, { transaction });
      }

      const name = String(item).trim();
      if (!name) return null;

      const [tourItem] = await TourItem.findOrCreate({
        where: { name },
        defaults: { name },
        transaction,
      });

      return tourItem;
    })
  );

  return resolvedItems.filter(Boolean);
};

const buildTourData = (body, existingTour = null) => ({
  packageName: (body.packageName ?? existingTour?.packageName ?? "").trim(),
  overview: (body.overview ?? existingTour?.overview ?? "").trim() || null,
  duration: parseNumberField(body.duration, existingTour?.duration ?? null),
    durationType: body.durationType || existingTour?.durationType || 'days',
  location: (body.location ?? existingTour?.location ?? "").trim() || null,
  price: parseNumberField(body.price, existingTour?.price ?? null),
  discount: parseNumberField(body.discount, existingTour?.discount ?? 0) ?? 0,
  termsConditions: (body.termsConditions ?? existingTour?.termsConditions ?? "").trim() || null,
  itinerary: parseJsonField(body.itinerary, existingTour?.itinerary ?? []),
  groupSize: parseNumberField(body.groupSize, existingTour?.groupSize ?? null),
  status: body.status || existingTour?.status || "active",
});

const validateTour = (payload, options = {}) => {
  const { hasImage = false, hasItems = false, hasItinerary = false, isNew = false } = options;
  
  // Required fields
  if (!payload.packageName?.trim()) return "Tour package name is required";
  if (!payload.overview?.trim()) return "Overview is required";
  if (!payload.termsConditions?.trim()) return "Terms and conditions are required";
  if (!payload.location?.trim()) return "Location is required";
  
  // Price validation
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return "Tour price must be a positive number";
  }
  
  // Discount validation (0-100)
  if (payload.discount !== null && payload.discount !== undefined) {
    const discount = Number(payload.discount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return "Discount must be between 0 and 100";
    }
  }
  
  // Group size validation (if provided, must be positive integer)
  if (payload.groupSize !== null && payload.groupSize !== undefined) {
    if (!Number.isInteger(payload.groupSize) || payload.groupSize <= 0) {
      return "Group size must be a positive whole number";
    }
  }
  
  // Image requirement for new tours
  if (isNew && !hasImage) {
    return "Tour image is required";
  }
  
  // Items validation (at least one)
  if (!hasItems) {
    return "Add at least one inclusion";
  }
  
  // Itinerary validation (at least one day)
  if (!hasItinerary) {
    return "Add at least one day with activity description";
  }

  
  return null;
};

const includeTourItems = [
  {
    model: TourItem,
    through: { attributes: [] },
  },
];

const buildTourResponse = async (tour) => {
  const fullTour = await Tour.findByPk(tour.id, { include: includeTourItems });
  return fullTour || tour;
};

// POST /api/manager/tours
export const createTour = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const payload = buildTourData(req.body);
    
    // Check for items and itinerary before full validation
    const itemsArray = parseJsonField(req.body.includedItems, []);
    const hasItems = itemsArray.filter(i => i && String(i).trim()).length > 0;
    
    const itineraryArray = parseJsonField(req.body.itinerary, []);
    const hasItinerary = itineraryArray.some(entry => 
      entry && entry.description && String(entry.description).trim()
    );
    
    const hasImage = !!req.file;
    
    // Validate with all options
    const validationError = validateTour(payload, {
      hasImage,
      hasItems,
      hasItinerary,
      isNew: true,
    });

    if (validationError) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: validationError });
    }

    const image = req.file ? await uploadImageToSupabase(req.file) : null;

    // If the DB table lacks the durationType column, don't include it in the payload
    try {
      const tableDesc = await sequelize.getQueryInterface().describeTable('tours');
      if (tableDesc && !Object.prototype.hasOwnProperty.call(tableDesc, 'durationType')) {
        delete payload.durationType;
      }
    } catch (err) {
      // ignore - if describeTable fails, proceed without modifying payload
    }

    const tour = await Tour.create(
      {
        ...payload,
        image,
      },
      { transaction }
    );

    const tourItems = await resolveTourItems(req.body.includedItems, transaction);
    if (tourItems.length > 0) {
      await tour.setTourItems(tourItems, { transaction });
    }

    await transaction.commit();

    const data = await buildTourResponse(tour);
    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/manager/tours
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: includeTourItems,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/manager/tours/:id
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      include: includeTourItems,
    });

    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    return res.status(200).json({ success: true, data: tour });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/manager/tours/:id
export const updateTour = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const tour = await Tour.findByPk(req.params.id, { include: includeTourItems, transaction });

    if (!tour) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    const payload = buildTourData(req.body, tour);
    
    // Check for items (use provided or existing)
    const itemsArray = parseJsonField(
      req.body.includedItems,
      tour.TourItems?.map(item => item.id) || []
    );
    const hasItems = itemsArray.filter(i => i && String(i).trim()).length > 0;
    
    // Check for itinerary (use provided or existing)
    const itineraryArray = parseJsonField(
      req.body.itinerary,
      tour.itinerary || []
    );
    const hasItinerary = itineraryArray.some(entry => 
      entry && entry.description && String(entry.description).trim()
    );
    
    const hasImage = !!req.file || !!tour.image;
    
    // Validate with all options (isNew: false for updates)
    const validationError = validateTour(payload, {
      hasImage,
      hasItems,
      hasItinerary,
      isNew: false,
    });

    if (validationError) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: validationError });
    }

    let image = tour.image;
    if (req.file) {
      await deleteImageFromSupabase(tour.image);
      image = await uploadImageToSupabase(req.file);
    }

    // If the DB table lacks the durationType column, don't include it in the update payload
    try {
      const tableDesc = await sequelize.getQueryInterface().describeTable('tours');
      if (tableDesc && !Object.prototype.hasOwnProperty.call(tableDesc, 'durationType')) {
        delete payload.durationType;
      }
    } catch (err) {
      // ignore and proceed
    }

    await tour.update(
      {
        ...payload,
        image,
      },
      { transaction }
    );

    if (Object.prototype.hasOwnProperty.call(req.body, "includedItems")) {
      const tourItems = await resolveTourItems(req.body.includedItems, transaction);
      await tour.setTourItems(tourItems, { transaction });
    }

    await transaction.commit();

    const data = await buildTourResponse(tour);
    return res.status(200).json({
      success: true,
      message: "Tour updated successfully",
      data,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/manager/tours/:id
export const deleteTour = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const tour = await Tour.findByPk(req.params.id, { transaction });

    if (!tour) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    await deleteImageFromSupabase(tour.image);
    await tour.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};