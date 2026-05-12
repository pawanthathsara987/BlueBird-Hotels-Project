// controllers/vehicleController.js
import { Op } from 'sequelize';
import Vehicle from '../models/Vehicle.js';
import VehicleBooking from '../models/VehicleBooking.js';
import VehiclePayment from '../models/VehiclePayment.js';

// ── Helper ────────────────────────────────────────────────────────────────────
const calcDays = (pickupDate, returnDate) => {
  const ms = new Date(returnDate) - new Date(pickupDate);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// ═════════════════════════════════════════════════════════════════════════════
// VEHICLE CRUD  —  manager only (except GET)
// ═════════════════════════════════════════════════════════════════════════════

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

    // Check for overlapping confirmed/pending bookings
    const conflict = await VehicleBooking.findOne({
      where: {
        vehicleId:  vehicle.id,
        status:     { [Op.notIn]: ['cancelled'] },
        pickupDate: { [Op.lt]: new Date(returnDate) },
        returnDate: { [Op.gt]: new Date(pickup) },
      },
    });

    const available  = !conflict;
    const totalPrice = available
      ? (days * parseFloat(vehicle.pricePerDay)).toFixed(2)
      : null;

    res.json({
      success: true,
      data: {
        available,
        days,
        pricePerDay: vehicle.pricePerDay,
        totalPrice,
        ...(conflict && { reason: 'Already booked for selected dates' }),
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

    // Block delete if there are active bookings
    const activeBooking = await VehicleBooking.findOne({
      where: {
        vehicleId: vehicle.id,
        status:    { [Op.in]: ['pending', 'confirmed'] },
      },
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete a vehicle with active bookings. Set status to "retired" instead.',
      });
    }

    await vehicle.destroy();
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/vehicles/bookings
// Authenticated user — create a booking
export const createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupLocation, dropoffLocation, notes } = req.body;
    const userId = req.user.id; // from your auth middleware

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'vehicleId, pickupDate and returnDate are required',
      });
    }

    const days = calcDays(pickupDate, returnDate);
    if (days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date',
      });
    }

    // Validate vehicle exists and is bookable
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (vehicle.status !== 'available') {
      return res.status(409).json({
        success: false,
        message: `Vehicle is currently ${vehicle.status}`,
      });
    }

    // Check for date conflicts
    const conflict = await VehicleBooking.findOne({
      where: {
        vehicleId,
        status:     { [Op.notIn]: ['cancelled'] },
        pickupDate: { [Op.lt]: new Date(returnDate) },
        returnDate: { [Op.gt]: new Date(pickupDate) },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle is already booked for the selected dates',
      });
    }

    const totalPrice = (days * parseFloat(vehicle.pricePerDay)).toFixed(2);

    // Create booking
    const booking = await VehicleBooking.create({
      userId,
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      dropoffLocation,
      totalDays:  days,
      totalPrice,
      notes,
      status: 'pending',
    });

    // Auto-create a pending payment record
    await VehiclePayment.create({
      bookingId: booking.id,
      amount:    totalPrice,
      currency:  'LKR',
      status:    'pending',
    });

    // Return with vehicle info attached
    const result = await VehicleBooking.findByPk(booking.id, {
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'brand', 'model', 'vehicleType', 'plateNumber', 'imageUrl', 'pricePerDay'],
        },
        {
          model: VehiclePayment,
          as: 'payment',
        },
      ],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vehicles/bookings/my
// Authenticated user — their own bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await VehicleBooking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'brand', 'model', 'vehicleType', 'plateNumber', 'imageUrl'],
        },
        {
          model: VehiclePayment,
          as: 'payment',
          attributes: ['status', 'paymentMethod', 'paidAt', 'amount'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vehicles/bookings/:id
// Authenticated — user sees own booking, manager sees any
export const getBooking = async (req, res) => {
  try {
    const booking = await VehicleBooking.findByPk(req.params.id, {
      include: [
        { model: Vehicle,        as: 'vehicle' },
        { model: VehiclePayment, as: 'payment' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'manager' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/vehicles/bookings
// Manager only — all bookings with optional filters
export const getAllBookings = async (req, res) => {
  try {
    const { status, userId, vehicleId, from, to } = req.query;
    const where = {};

    if (status)    where.status    = status;
    if (userId)    where.userId    = userId;
    if (vehicleId) where.vehicleId = vehicleId;

    if (from || to) {
      where.pickupDate = {};
      if (from) where.pickupDate[Op.gte] = new Date(from);
      if (to)   where.pickupDate[Op.lte] = new Date(to);
    }

    const bookings = await VehicleBooking.findAll({
      where,
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'brand', 'model', 'plateNumber', 'vehicleType'],
        },
        {
          model: VehiclePayment,
          as: 'payment',
          attributes: ['status', 'paymentMethod', 'paidAt', 'amount'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/vehicles/bookings/:id/status
// Manager only — change booking status manually
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const booking = await VehicleBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.update({ status });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vehicles/bookings/:id/cancel
// Authenticated user — cancel their own booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await VehicleBooking.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not yours' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}`,
      });
    }

    await booking.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENTS  —  gateway-agnostic, plug in Stripe / PayHere later
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/vehicles/bookings/:id/payment
// Authenticated — user sees own, manager sees all
export const getPayment = async (req, res) => {
  try {
    const booking = await VehicleBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'manager' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = await VehiclePayment.findOne({ where: { bookingId: req.params.id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vehicles/bookings/:id/pay
// Authenticated user — process payment for a booking
//
// ── GATEWAY HOOK ──────────────────────────────────────────────────────────────
//  When you pick a gateway, replace the manual block below:
//
//  Stripe:
//    const intent = await stripe.paymentIntents.create({
//      amount: Math.round(booking.totalPrice * 100),
//      currency: 'lkr',
//      payment_method: req.body.stripePaymentMethodId,
//      confirm: true,
//    });
//    transactionRef  = intent.id;
//    gatewayResponse = intent;
//
//  PayHere (Sri Lanka):
//    1. Generate hash here, return it to the frontend
//    2. Frontend redirects user to PayHere checkout page
//    3. PayHere POSTs to your /webhook/payhere → verify hash → call payment.update()
//
// ─────────────────────────────────────────────────────────────────────────────
export const processPayment = async (req, res) => {
  try {
    const booking = await VehicleBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = await VehiclePayment.findOne({ where: { bookingId: booking.id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status === 'paid') {
      return res.status(409).json({ success: false, message: 'This booking is already paid' });
    }

    const { paymentMethod, transactionRef, gatewayResponse } = req.body;

    await payment.update({
      paymentMethod:   paymentMethod  || 'manual',
      transactionRef:  transactionRef || `MANUAL-${Date.now()}`,
      gatewayResponse: gatewayResponse || null,
      status:          'paid',
      paidAt:          new Date(),
    });

    // Auto-confirm booking once paid
    await booking.update({ status: 'confirmed' });

    res.json({ success: true, message: 'Payment successful', data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/vehicles/bookings/:id/refund
// Manager only — mark payment as refunded + cancel the booking
export const refundPayment = async (req, res) => {
  try {
    const payment = await VehiclePayment.findOne({ where: { bookingId: req.params.id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'paid') {
      return res.status(409).json({
        success: false,
        message: `Cannot refund a payment with status: ${payment.status}`,
      });
    }

    await payment.update({
      status:          'refunded',
      gatewayResponse: req.body.reason
        ? { ...(payment.gatewayResponse || {}), refundReason: req.body.reason }
        : payment.gatewayResponse,
    });

    await VehicleBooking.update(
      { status: 'cancelled' },
      { where: { id: req.params.id } }
    );

    res.json({ success: true, message: 'Payment refunded and booking cancelled', data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};