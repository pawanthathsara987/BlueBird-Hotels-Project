import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import Driver from '../../models/vehicle/driverModel.js';
import Customer from '../../models/User/Customer.js';
import Payment from '../../models/vehicle/paymentModel.js';
import StaffMember from '../../models/User/StaffMember.js';
import sequelize from '../../config/database.js';
import { Op } from 'sequelize';

// Get all vehicle bookings
export const getVehicleBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.pickupDatetime = {};
      if (startDate) where.pickupDatetime[Op.gte] = new Date(startDate);
      if (endDate) where.pickupDatetime[Op.lte] = new Date(endDate);
    }

    const bookings = await VehicleBooking.findAll({
      where,
      include: [
        { association: 'vehicle' },
        { association: 'customer' },
        { association: 'driver' },
        { association: 'payments' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('getVehicleBookings error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single vehicle booking with all associations
export const getVehicleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await VehicleBooking.findByPk(id, {
      include: [
        { association: 'vehicle' },
        { association: 'customer' },
        { association: 'driver' },
        { association: 'payments' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Vehicle booking not found' });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    console.error('getVehicleBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Sync vehicle status based on booking status
const syncVehicleStatus = async (vehicleId, bookingStatus, transaction) => {
  const activeStatuses = ['confirmed', 'driver_assigned', 'balance_paid', 'ongoing'];
  const terminalStatuses = ['completed', 'cancelled', 'expired'];

  let vehicleStatus = null;
  if (activeStatuses.includes(bookingStatus)) {
    vehicleStatus = 'booked';
  } else if (terminalStatuses.includes(bookingStatus)) {
    vehicleStatus = 'available';
  }

  if (vehicleStatus && vehicleId) {
    const vehicle = await Vehicle.findByPk(vehicleId, { transaction });
    if (vehicle && vehicle.status !== 'maintenance' && vehicle.status !== 'retired') {
      await vehicle.update({ status: vehicleStatus }, { transaction });
    }
  }
};

// Update booking status manually
export const updateBookingStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'pending_payment',
      'confirmed',
      'payment_failed',
      'driver_assigned',
      'balance_paid',
      'ongoing',
      'completed',
      'cancelled',
      'expired',
    ];

    if (!allowedStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await VehicleBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.update({ status }, { transaction: t });
    await syncVehicleStatus(booking.vehicleId, status, t);

    await t.commit();
    return res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (err) {
    await t.rollback();
    console.error('updateBookingStatus error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Assign driver to a booking
export const assignDriver = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { driverId } = req.body; // can be null to unassign

    const booking = await VehicleBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.hireType !== 'with_driver') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cannot assign a driver to a without-driver booking' });
    }

    if (driverId) {
      const driver = await Driver.findByPk(driverId, { transaction: t });
      if (!driver) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }
      if (driver.status !== 'active') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Selected driver is not active' });
      }

      // Check driver is not already assigned to an overlapping booking
      const overlappingDriverBooking = await VehicleBooking.findOne({
        where: {
          driverId,
          id: { [Op.ne]: booking.id },
          status: { [Op.in]: ['confirmed', 'driver_assigned', 'balance_paid', 'ongoing'] },
          pickupDatetime: { [Op.lt]: booking.returnDatetime },
          returnDatetime: { [Op.gt]: booking.pickupDatetime },
        },
        attributes: ['id', 'bookingNo', 'pickupDatetime', 'returnDatetime'],
        transaction: t,
      });

      if (overlappingDriverBooking) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: `Driver is already assigned to booking ${overlappingDriverBooking.bookingNo} for overlapping dates`,
        });
      }
    }

    const updates = { driverId };
    // If status is currently confirmed, auto-transition to driver_assigned
    if (driverId && booking.status === 'confirmed') {
      updates.status = 'driver_assigned';
    } else if (!driverId && booking.status === 'driver_assigned') {
      updates.status = 'confirmed';
    }

    await booking.update(updates, { transaction: t });
    if (updates.status) {
      await syncVehicleStatus(booking.vehicleId, updates.status, t);
    }

    await t.commit();
    return res.json({ success: true, message: 'Driver assigned successfully', data: booking });
  } catch (err) {
    await t.rollback();
    console.error('assignDriver error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Record balance payment collected at the hotel
export const collectBalance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { paymentMethod, notes, receiptNo } = req.body;

    const allowedMethods = ['cash', 'card', 'bank_transfer'];
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Valid payment method is required (cash, card, bank_transfer)' });
    }

    const booking = await VehicleBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.balancePaidAt) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Balance has already been collected' });
    }

    let staffId = req.user?.id || null;
    if (!staffId) {
      // Fallback to first manager staff member or ID 1 for robustness
      const firstStaff = await StaffMember.findOne({ transaction: t });
      staffId = firstStaff ? firstStaff.userId : null;
    }

    const balanceAmountVal = parseFloat(booking.balanceAmount || 0);

    // Update booking fields
    await booking.update({
      balancePaidAt: new Date(),
      balancePaymentMethod: paymentMethod,
      balanceCollectedBy: staffId,
      status: 'balance_paid',
    }, { transaction: t });

    // Create payment entry
    const payment = await Payment.create({
      bookingId: booking.id,
      receivedBy: staffId,
      type: 'balance',
      amount: balanceAmountVal,
      method: paymentMethod,
      receiptNo: receiptNo || `REC-${Date.now().toString(36).toUpperCase()}`,
      notes: notes || 'Balance collected manually at hotel',
      receivedAt: new Date(),
    }, { transaction: t });

    await syncVehicleStatus(booking.vehicleId, 'balance_paid', t);

    await t.commit();
    return res.json({ success: true, message: 'Balance payment recorded successfully', data: { booking, payment } });
  } catch (err) {
    await t.rollback();
    console.error('collectBalance error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await VehicleBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Cannot cancel a booking that is already ${booking.status}` });
    }

    let staffId = req.user?.id || null;
    if (!staffId) {
      const firstStaff = await StaffMember.findOne({ transaction: t });
      staffId = firstStaff ? firstStaff.userId : null;
    }

    await booking.update({
      status: 'cancelled',
      cancelledBy: staffId,
      cancelledAt: new Date(),
      cancellationReason: cancellationReason || 'Cancelled by manager',
    }, { transaction: t });

    await syncVehicleStatus(booking.vehicleId, 'cancelled', t);

    await t.commit();
    return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    await t.rollback();
    console.error('cancelBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
