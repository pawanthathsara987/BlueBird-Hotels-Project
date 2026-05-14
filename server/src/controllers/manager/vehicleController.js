// controllers/vehicleController.js
import { Op } from 'sequelize';
import Vehicle from '../../models/vehicle/vehicleModel.js';

// ── Helper ────────────────────────────────────────────────────────────────────
const calcDays = (pickupDate, returnDate) => {
  const ms = new Date(returnDate) - new Date(pickupDate);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
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

    // Handle image upload (if using multer / cloudinary)
    if (req.file) req.body.imageUrl = req.file.path;

    const vehicle = await Vehicle.create(req.body);
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

    if (req.file) req.body.imageUrl = req.file.path;

    await vehicle.update(req.body);
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

    await vehicle.destroy();
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};