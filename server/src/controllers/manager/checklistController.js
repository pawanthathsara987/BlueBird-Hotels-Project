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

    // Fix #10: Validate booking status before allowing checklist creation
    if (type === 'pickup' && !['balance_paid'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A pickup checklist can only be created when the booking status is balance_paid.' 
      });
    }

    if (type === 'return' && !['ongoing'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A return checklist can only be created when the booking status is ongoing.' 
      });
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

    // Auto-update vehicle mileage and status on return checklist
    if (type === 'return') {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (vehicle) {
        const updates = {};
        if (mileage && Number(mileage) > vehicle.currentMileage) {
          updates.currentMileage = Number(mileage);
        }
        
        // Auto status transition from pending_inspection
        const needsMaintenance = (
          conditions.exteriorBody !== 'ok' ||
          conditions.tires !== 'ok' ||
          conditions.windshield !== 'ok' ||
          conditions.lights !== 'ok' ||
          conditions.mirrors !== 'ok' ||
          conditions.interior !== 'ok' ||
          conditions.ac !== 'ok' ||
          conditions.damageNotes
        );

        if (needsMaintenance) {
          updates.status = 'maintenance';
        } else if (vehicle.status === 'pending_inspection') {
          updates.status = 'available';
        }

        if (Object.keys(updates).length > 0) {
          await vehicle.update(updates);
        }
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

    // Extract only the allowed fields to prevent overriding bookingId, vehicleId, type, etc.
    const safeUpdates = {};
    const allowedFields = [
      'inspectedBy', 'inspectedAt', 'fuelLevel', 'mileage',
      'exteriorBody', 'tires', 'windshield', 'lights', 'mirrors',
      'interior', 'ac', 'damageNotes', 'customerSignature'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        safeUpdates[field] = req.body[field];
      }
    });

    await checklist.update(safeUpdates);

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
