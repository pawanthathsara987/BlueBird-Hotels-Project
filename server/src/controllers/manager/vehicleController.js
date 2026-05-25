// controllers/vehicleController.js
import { Op } from 'sequelize';
import multer from 'multer';
import sequelize from '../../config/database.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import supabase from '../../config/supabaseClient.js';
import DriverPricingSetting from '../../models/vehicle/driverPricingModel.js';

const BLOCKING_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'driver_assigned',
  'balance_paid',
  'ongoing',
];

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

const ALLOWED_FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const ALLOWED_TRANSMISSIONS = ['automatic', 'manual'];
const ALLOWED_STATUSES = ['available', 'booked', 'maintenance', 'retired'];

const getVehicleTableColumns = async () => {
  try {
    const tableDescription = await sequelize.getQueryInterface().describeTable('vehicles');
    return new Set(Object.keys(tableDescription));
  } catch {
    return null;
  }
};

const sanitizeVehiclePayload = (payload, tableColumns) => {
  if (!tableColumns) {
    return payload;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => tableColumns.has(key))
  );
};

const buildVehicleValidationErrors = (body, { requireImage = false, imageFile = null } = {}) => {
  const errors = {};
  const features = parseFeatures(body.features);

  if (!String(body.plateNumber || '').trim()) errors.plateNumber = 'Plate number is required.';
  if (!String(body.brand || '').trim()) errors.brand = 'Brand is required.';
  if (!String(body.vehicleTypeId || '').trim()) errors.vehicleTypeId = 'Vehicle type is required.';
  if (!String(body.model || '').trim()) errors.model = 'Model is required.';

  if (!String(body.year || '').trim()) {
    errors.year = 'Year is required.';
  } else if (Number.isNaN(Number(body.year))) {
    errors.year = 'Year must be a number.';
  } else if (Number(body.year) < 1900) {
    errors.year = 'Year must be 1900 or later.';
  }

  if (!String(body.capacity || '').trim()) {
    errors.capacity = 'Capacity is required.';
  } else if (Number.isNaN(Number(body.capacity))) {
    errors.capacity = 'Capacity must be a number.';
  } else if (Number(body.capacity) <= 0) {
    errors.capacity = 'Capacity must be greater than zero.';
  }

  if (!String(body.pricePerDay || '').trim()) {
    errors.pricePerDay = 'Price per day is required.';
  } else if (Number.isNaN(Number(body.pricePerDay))) {
    errors.pricePerDay = 'Price per day must be a number.';
  } else if (Number(body.pricePerDay) <= 0) {
    errors.pricePerDay = 'Price per day must be greater than zero.';
  }

  if (!String(body.fuelType || '').trim()) {
    errors.fuelType = 'Fuel type is required.';
  } else if (!ALLOWED_FUEL_TYPES.includes(body.fuelType)) {
    errors.fuelType = 'Select a valid fuel type.';
  }

  if (!String(body.transmission || '').trim()) {
    errors.transmission = 'Transmission is required.';
  } else if (!ALLOWED_TRANSMISSIONS.includes(body.transmission)) {
    errors.transmission = 'Select a valid transmission.';
  }

  if (!String(body.color || '').trim()) errors.color = 'Color is required.';

  if (!String(body.status || '').trim()) {
    errors.status = 'Status is required.';
  } else if (!ALLOWED_STATUSES.includes(body.status)) {
    errors.status = 'Select a valid status.';
  }

  if (!String(body.insuranceNo || '').trim()) errors.insuranceNo = 'Insurance number is required.';
  if (!String(body.insuranceExpiry || '').trim()) errors.insuranceExpiry = 'Insurance expiry is required.';
  if (!String(body.revenueLicenseExpiry || '').trim()) {
    errors.revenueLicenseExpiry = 'Revenue license expiry is required.';
  }

  if (!String(body.description || '').trim()) errors.description = 'Description is required.';
  if (!features.length) errors.features = 'Add at least one feature.';

  if (requireImage && !imageFile) {
    errors.image = 'Vehicle image is required.';
  }

  if (imageFile) {
    if (!imageFile.mimetype?.startsWith('image/')) {
      errors.image = 'Only image files are allowed.';
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      errors.image = 'Image must be 5MB or smaller.';
    }
  }

  return errors;
};

// VEHICLE CRUD  —  manager only (except GET)

// GET /api/vehicles
// Public — list all vehicles with optional filters
export const getVehicles = async (req, res) => {
  try {
    const { status, vehicleType, minPrice, maxPrice, capacity, fuelType, transmission } = req.query;

    const where = {};

    if (status)        where.status       = status;
    if (vehicleType)   where.vehicleTypeId = vehicleType;
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

// GET /api/vehicles/:id/availability?pickup=YYYY-MM-DD&return=YYYY-MM-DD&withDriver=true
// Public — check if vehicle is free for a date range + return total price
export const checkAvailability = async (req, res) => {
  try {
    const { pickup, return: returnDate, withDriver } = req.query;

    if (!pickup || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'pickup and return query params are required',
      });
    }

    const pickupDate = new Date(pickup);
    const returnDateObj = new Date(returnDate);

    if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'pickup and return must be valid dates',
      });
    }

    const days = calcDays(pickupDate, returnDateObj);
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

    const overlappingBooking = await VehicleBooking.findOne({
      where: {
        vehicleId: Number(req.params.id),
        status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
        pickupDatetime: { [Op.lt]: returnDateObj },
        returnDatetime: { [Op.gt]: pickupDate },
      },
      attributes: ['bookingNo'],
    });

    if (overlappingBooking) {
      return res.json({
        success: true,
        data: {
          available: false,
          reason: 'Vehicle already has a booking for the selected date range',
          conflictingBookingNo: overlappingBooking.bookingNo,
          days,
          totalPrice: null,
        },
      });
    }

    let driverFee = 0;
    if (withDriver === 'true' || withDriver === true) {
      const driverSetting = await DriverPricingSetting.findByPk(1);
      driverFee = driverSetting ? parseFloat(driverSetting.driverPricePerDay || 0) : 0;
    }

    const vehicleRate = parseFloat(vehicle.pricePerDay || 0);
    const subtotal = (vehicleRate + driverFee) * days;
    const totalPrice = parseFloat(subtotal.toFixed(2));

    const depositPercentage = 30;
    const depositAmount = parseFloat(((totalPrice * depositPercentage) / 100).toFixed(2));
    const balanceAmount = parseFloat((totalPrice - depositAmount).toFixed(2));

    res.json({
      success: true,
      data: {
        available: true,
        days,
        pricePerDay: vehicleRate.toFixed(2),
        driverFee: driverFee > 0 ? (driverFee * days).toFixed(2) : null,
        totalPrice: totalPrice.toFixed(2),
        depositPercentage,
        depositAmount: depositAmount.toFixed(2),
        balanceAmount: balanceAmount.toFixed(2),
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
    const tableColumns = await getVehicleTableColumns();
    const validationErrors = buildVehicleValidationErrors(req.body, { requireImage: true, imageFile: req.file });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
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
      ...sanitizeVehiclePayload(req.body, tableColumns),
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
    const tableColumns = await getVehicleTableColumns();
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const validationErrors = buildVehicleValidationErrors(req.body, { requireImage: false, imageFile: req.file });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
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
      ...sanitizeVehiclePayload(req.body, tableColumns),
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

    const activeBooking = await VehicleBooking.findOne({
      where: {
        vehicleId: vehicle.id,
        status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
      },
      attributes: ['id', 'bookingNo'],
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete vehicle with active booking ${activeBooking.bookingNo || activeBooking.id}`,
      });
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