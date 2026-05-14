// controllers/vehicleController.js
import { Op } from 'sequelize';
import multer from 'multer';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import supabase from '../../config/supabaseClient.js';

// ── Helper ────────────────────────────────────────────────────────────────────
const calcDays = (pickupDate, returnDate) => {
  const ms = new Date(returnDate) - new Date(pickupDate);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// Configure multer to store uploads in memory (required for Supabase)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Use the same Supabase bucket as tours
const VEHICLE_IMAGE_BUCKET = 'Blue-Bird';

const uploadImageToSupabase = async (file) => {
  if (!file) return null;
  const fileName = `${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage.from(VEHICLE_IMAGE_BUCKET).upload(
    `images/${fileName}`,
    file.buffer,
    { contentType: file.mimetype, upsert: false }
  );

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(VEHICLE_IMAGE_BUCKET).getPublicUrl(`images/${fileName}`);
  return data.publicUrl;
};

const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes(`/${VEHICLE_IMAGE_BUCKET}/`)) return;

  const oldPath = imageUrl.split(`/${VEHICLE_IMAGE_BUCKET}/`)[1];
  if (!oldPath) return;

  await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove([oldPath]);
};

const parseFeatures = (features) => {
  if (features == null || features === '') return [];

  if (Array.isArray(features)) {
    return features.map((feature) => String(feature).trim()).filter(Boolean);
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed.map((feature) => String(feature).trim()).filter(Boolean);
      }
    } catch {
      // Fallback for comma-separated values
      return features
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean);
    }
  }

  return [];
};

// VEHICLE CRUD  —  manager only (except GET)

// GET /api/vehicles
// Public — list all vehicles with optional filters
export const getVehicles = async (req, res) => {
  try {
    const { status, vehicleType, minPrice, maxPrice, capacity, fuelType, transmission } = req.query;

    const where = {};

    if (status)        where.status       = status;
    if (vehicleType)   where.vehicleType  = vehicleType;
    if (fuelType)      where.fuelType     = fuelType;
    if (transmission)  where.transmission = transmission;
    if (capacity)      where.capacity     = { [Op.gte]: Number(capacity) };

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay[Op.gte] = Number(minPrice);
      if (maxPrice) where.pricePerDay[Op.lte] = Number(maxPrice);
    }

    const vehicles = await Vehicle.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vehicles/:id
// Public — single vehicle detail
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vehicles/:id/availability?pickup=YYYY-MM-DD&return=YYYY-MM-DD
// Public — check if vehicle is free for a date range + return total price
export const checkAvailability = async (req, res) => {
  try {
    const { pickup, return: returnDate } = req.query;

    if (!pickup || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'pickup and return query params are required',
      });
    }

    const days = calcDays(pickup, returnDate);
    if (days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date',
      });
    }

    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.json({
        success: true,
        data: {
          available: false,
          reason: `Vehicle is ${vehicle.status}`,
          days,
          totalPrice: null,
        },
      });
    }

    const available = vehicle.status === 'available';
    const totalPrice = available ? (days * parseFloat(vehicle.pricePerDay)).toFixed(2) : null;

    res.json({
      success: true,
      data: {
        available,
        days,
        pricePerDay: vehicle.pricePerDay,
        totalPrice,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vehicles
// Manager only — add a new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { plateNumber, vehicleType, model, capacity, pricePerDay } = req.body;

    if (!plateNumber || !vehicleType || !model || !capacity || !pricePerDay) {
      return res.status(400).json({
        success: false,
        message: 'plateNumber, vehicleType, model, capacity and pricePerDay are required',
      });
    }

    // Upload image to Supabase if provided
    let image = null;
    if (req.file) {
      try {
        image = await uploadImageToSupabase(req.file);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      features: parseFeatures(req.body.features),
      image,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Plate number already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/vehicles/:id
// Manager only — update vehicle details
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // If new image uploaded, delete old and upload new to Supabase
    let image = vehicle.image;
    if (req.file) {
      try {
        await deleteImageFromSupabase(vehicle.image);
      } catch (err) {
        console.error('Error deleting old vehicle image:', err);
      }

      try {
        image = await uploadImageToSupabase(req.file);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const payload = {
      ...req.body,
      image,
    };

    if (Object.prototype.hasOwnProperty.call(req.body, 'features')) {
      payload.features = parseFeatures(req.body.features);
    }

    await vehicle.update(payload);
    res.json({ success: true, data: vehicle });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Plate number already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/vehicles/:id
// Manager only — hard delete (blocked if active bookings exist)
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Delete image from Supabase if exists
    try {
      await deleteImageFromSupabase(vehicle.image);
    } catch (err) {
      console.error('Error deleting vehicle image from Supabase:', err);
    }

    await vehicle.destroy();
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};