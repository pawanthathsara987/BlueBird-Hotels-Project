import Checklist from '../../models/vehicle/checklistModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import StaffMember from '../../models/User/StaffMember.js';

// Create a new checklist (pickup or return)
export const createChecklist = async (req, res) => {
  try {
    const {
      bookingId,
      doneBy,
      type,
      conditionKm,
      fuelLevel,
      damages = null,
      photos = [],
      accessories = [],
      signedByCustomer = false,
      signedByStaff = false,
    } = req.body;

    if (!bookingId || !type || typeof conditionKm === 'undefined' || !fuelLevel) {
      return res.status(400).json({ success: false, message: 'bookingId, type, conditionKm and fuelLevel are required' });
    }

    const booking = await VehicleBooking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    let finalDoneBy = doneBy || req.user?.id || null;
    if (!finalDoneBy) {
      const firstStaff = await StaffMember.findOne();
      finalDoneBy = firstStaff ? firstStaff.userId : 1;
    }

    const checklist = await Checklist.create({
      bookingId,
      doneBy: finalDoneBy,
      type,
      conditionKm,
      fuelLevel,
      damages,
      photos,
      accessories,
      signedByCustomer,
      signedByStaff,
    });

    return res.json({ success: true, data: checklist });
  } catch (err) {
    console.error('createChecklist error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findByPk(id);
    if (!checklist) return res.status(404).json({ success: false, message: 'Checklist not found' });
    return res.json({ success: true, data: checklist });
  } catch (err) {
    console.error('getChecklist error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getChecklistsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const items = await Checklist.findAll({ where: { bookingId }, order: [['createdAt', 'ASC']] });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getChecklistsByBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findByPk(id);
    if (!checklist) return res.status(404).json({ success: false, message: 'Checklist not found' });

    const updatable = [
      'conditionKm',
      'fuelLevel',
      'damages',
      'photos',
      'accessories',
      'signedByCustomer',
      'signedByStaff',
      'doneAt',
      'type',
      'doneBy',
    ];

    const payload = {};
    updatable.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
    });

    await checklist.update(payload);
    return res.json({ success: true, data: checklist });
  } catch (err) {
    console.error('updateChecklist error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findByPk(id);
    if (!checklist) return res.status(404).json({ success: false, message: 'Checklist not found' });
    await checklist.destroy();
    return res.json({ success: true, message: 'Checklist deleted' });
  } catch (err) {
    console.error('deleteChecklist error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { createChecklist, getChecklist, getChecklistsByBooking, updateChecklist, deleteChecklist };
