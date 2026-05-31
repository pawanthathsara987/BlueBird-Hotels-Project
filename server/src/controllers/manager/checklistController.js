import { Op } from 'sequelize';
import VehicleChecklist from '../../models/vehicle/vehicleChecklistModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';

// ── GET /api/manager/checklists ────────────────────────────────────────────────
// Get checklists, optionally filtered by bookingId or vehicleId
export const getChecklists = async (req, res) => {
  try {
    const { bookingId, vehicleId, type } = req.query;

    const where = {};
    if (bookingId) where.bookingId = Number(bookingId);
    if (vehicleId) where.vehicleId = Number(vehicleId);
    if (type) where.type = type;

    const checklists = await VehicleChecklist.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'brand', 'model'] },
        { model: VehicleBooking, as: 'booking', attributes: ['id', 'pickupDatetime', 'returnDatetime', 'status'] },
      ],
      order: [['inspectedAt', 'DESC']],
    });

    res.json({ success: true, count: checklists.length, data: checklists });
  } catch (err) {
    console.error('getChecklists error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/manager/checklists/:id ────────────────────────────────────────────
export const getChecklist = async (req, res) => {
  try {
    const checklist = await VehicleChecklist.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'brand', 'model'] },
        { model: VehicleBooking, as: 'booking', attributes: ['id', 'pickupDatetime', 'returnDatetime', 'status'] },
      ],
    });

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    res.json({ success: true, data: checklist });
  } catch (err) {
    console.error('getChecklist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/manager/checklists ───────────────────────────────────────────────
export const createChecklist = async (req, res) => {
  try {
    const { bookingId, vehicleId, type, inspectedBy, inspectedAt, fuelLevel, mileage, ...conditions } = req.body;

    if (!bookingId || !vehicleId || !type || !inspectedBy || !inspectedAt || !fuelLevel || !mileage) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Ensure booking exists
    const booking = await VehicleBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if checklist of this type already exists for this booking
    const existing = await VehicleChecklist.findOne({ where: { bookingId, type } });
    if (existing) {
      return res.status(400).json({ success: false, message: `A ${type} checklist already exists for this booking.` });
    }

    const checklist = await VehicleChecklist.create({
      bookingId,
      vehicleId,
      type,
      inspectedBy,
      inspectedAt,
      fuelLevel,
      mileage,
      exteriorBody: conditions.exteriorBody || 'ok',
      tires: conditions.tires || 'ok',
      windshield: conditions.windshield || 'ok',
      lights: conditions.lights || 'ok',
      mirrors: conditions.mirrors || 'ok',
      interior: conditions.interior || 'ok',
      ac: conditions.ac || 'ok',
      damageNotes: conditions.damageNotes || null,
      customerSignature: conditions.customerSignature ? true : false,
    });

    // Auto-update vehicle mileage on return checklist
    if (type === 'return' && mileage) {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (vehicle && Number(mileage) > vehicle.currentMileage) {
        await vehicle.update({ currentMileage: Number(mileage) });
      }
    }

    res.status(201).json({ success: true, data: checklist });
  } catch (err) {
    console.error('createChecklist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/manager/checklists/:id ────────────────────────────────────────────
export const updateChecklist = async (req, res) => {
  try {
    const checklist = await VehicleChecklist.findByPk(req.params.id);
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    await checklist.update(req.body);

    // If mileage is updated on a return checklist, update vehicle
    if (checklist.type === 'return' && req.body.mileage) {
      const vehicle = await Vehicle.findByPk(checklist.vehicleId);
      if (vehicle && Number(req.body.mileage) > vehicle.currentMileage) {
        await vehicle.update({ currentMileage: Number(req.body.mileage) });
      }
    }

    res.json({ success: true, data: checklist });
  } catch (err) {
    console.error('updateChecklist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/manager/checklists/:id ─────────────────────────────────────────
export const deleteChecklist = async (req, res) => {
  try {
    const checklist = await VehicleChecklist.findByPk(req.params.id);
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    await checklist.destroy();
    res.json({ success: true, message: 'Checklist deleted' });
  } catch (err) {
    console.error('deleteChecklist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getChecklists, getChecklist, createChecklist, updateChecklist, deleteChecklist };
