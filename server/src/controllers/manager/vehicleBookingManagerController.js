import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import Driver from '../../models/vehicle/driverModel.js';
import Customer from '../../models/User/Customer.js';
import Payment from '../../models/vehicle/paymentModel.js';
import StaffMember from '../../models/User/StaffMember.js';
import VehicleRentalPolicy from '../../models/vehicle/vehicleRentalPolicyModel.js';
import VehicleChecklist from '../../models/vehicle/vehicleChecklistModel.js';
import VehicleFinalBill from '../../models/vehicle/vehicleFinalBillModel.js';
import sequelize from '../../config/database.js';
import { Op } from 'sequelize';

// ── Valid status transitions (state machine) ──────────────────────────────────
// Each key maps to the list of statuses it can transition TO.
// Terminal states (completed, cancelled, expired) have no outbound transitions
// except expired → pending_payment (allow retry).
const VALID_TRANSITIONS = {
  pending_payment: ['confirmed', 'payment_failed', 'cancelled', 'expired'],
  confirmed:       ['driver_assigned', 'balance_paid', 'ongoing', 'cancelled'],
  payment_failed:  ['pending_payment', 'cancelled', 'expired'],
  driver_assigned: ['confirmed', 'balance_paid', 'ongoing', 'cancelled'],
  balance_paid:    ['ongoing', 'cancelled'],
  ongoing:         ['returned', 'cancelled'],
  returned:        ['completed'],  // ideally only via generateBill, but allow manual
  completed:       [],             // terminal
  cancelled:       [],             // terminal
  expired:         ['pending_payment'], // allow retry
};

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
        { association: 'finalBill' },
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
        { association: 'finalBill' },
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



// Update booking status manually (with transition enforcement)
export const updateBookingStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the target status is a known status
    if (!VALID_TRANSITIONS.hasOwnProperty(status) && !Object.values(VALID_TRANSITIONS).flat().includes(status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await VehicleBooking.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Enforce valid transitions
    const currentStatus = booking.status;
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${currentStatus}" to "${status}". Allowed transitions: ${allowedNextStatuses.length ? allowedNextStatuses.join(', ') : 'none (terminal state)'}`,
      });
    }

    await booking.update({ status }, { transaction: t });

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

    // Ensure deposit has been paid before collecting balance
    if (!booking.depositPaidAt) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cannot collect balance — the deposit has not been paid yet. The customer must complete the online deposit payment first.' });
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

    const newStatus = ['ongoing', 'returned', 'completed'].includes(booking.status) ? booking.status : 'balance_paid';

    // Update booking fields
    await booking.update({
      balancePaidAt: new Date(),
      balancePaymentMethod: paymentMethod,
      balanceCollectedBy: staffId,
      status: newStatus,
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



    await t.commit();
    return res.json({ success: true, message: 'Balance payment recorded successfully', data: { booking, payment } });
  } catch (err) {
    await t.rollback();
    console.error('collectBalance error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Record final settlement payment (extra charges or remaining balance) after bill generation
export const collectFinalSettlement = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { paymentMethod, notes, receiptNo } = req.body;

    const allowedMethods = ['cash', 'card', 'bank_transfer'];
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Valid payment method is required (cash, card, bank_transfer)' });
    }

    const booking = await VehicleBooking.findByPk(id, { 
      transaction: t,
      include: [{ association: 'payments' }]
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cannot collect final settlement before final bill is generated (status must be completed).' });
    }

    let staffId = req.user?.id || null;
    if (!staffId) {
      const firstStaff = await StaffMember.findOne({ transaction: t });
      staffId = firstStaff ? firstStaff.userId : null;
    }

    // Calculate total paid via balance or extra
    const totalPaidAtHotel = (booking.payments || []).reduce((sum, p) => {
      if (p.type === 'balance' || p.type === 'extra') {
        return sum + parseFloat(p.amount);
      }
      return sum;
    }, 0);

    const totalDue = parseFloat(booking.balanceAmount || 0);
    let remainingBalance = totalDue - totalPaidAtHotel;

    // Small rounding fix
    if (remainingBalance < 0.01) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No remaining balance to collect.' });
    }

    // Create payment entry for the remaining amount
    const payment = await Payment.create({
      bookingId: booking.id,
      receivedBy: staffId,
      type: 'extra', // categorize as extra/final settlement
      amount: remainingBalance,
      method: paymentMethod,
      receiptNo: receiptNo || `REC-F-${Date.now().toString(36).toUpperCase()}`,
      notes: notes || 'Final settlement collected',
      receivedAt: new Date(),
    }, { transaction: t });

    // Ensure balancePaidAt is set if it wasn't already
    if (!booking.balancePaidAt) {
      await booking.update({
        balancePaidAt: new Date(),
        balancePaymentMethod: paymentMethod,
        balanceCollectedBy: staffId,
      }, { transaction: t });
    }

    await t.commit();
    return res.json({ success: true, message: 'Final settlement collected successfully', data: { payment } });
  } catch (err) {
    await t.rollback();
    console.error('collectFinalSettlement error', err);
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



    await t.commit();
    return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    await t.rollback();
    console.error('cancelBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Helper for calculating fees
const calculateExtraFees = async (booking, policy, returnChecklist, pickupChecklist) => {
  let lateFee = 0;
  let extraMileageFee = 0;

  if (returnChecklist && booking.returnDatetime) {
    const returnTime = new Date(returnChecklist.inspectedAt);
    const expectedReturnTime = new Date(booking.returnDatetime);

    // Late return calculation
    if (returnTime > expectedReturnTime) {
      const diffHrs = (returnTime - expectedReturnTime) / (1000 * 60 * 60);
      if (diffHrs > policy.lateReturnGraceHours) {
        if (diffHrs >= policy.lateReturnFullDayAfterHours) {
          lateFee = parseFloat(booking.vehicleRatePerDay);
        } else {
          lateFee = diffHrs * parseFloat(policy.lateReturnFeePerHour);
        }
      }
    }
  }

  // Mileage calculation
  if (returnChecklist && pickupChecklist) {
    const drivenKm = returnChecklist.mileage - pickupChecklist.mileage;
    const allowedKm = policy.includedKilometersPerDay * booking.numDays;

    if (drivenKm > allowedKm) {
      const extraKm = drivenKm - allowedKm;
      extraMileageFee = extraKm * parseFloat(policy.extraMileageFee);
    }
  }

  return { lateFee: Number(lateFee.toFixed(2)), extraMileageFee: Number(extraMileageFee.toFixed(2)) };
};

export const previewBill = async (req, res) => {
  try {
    const booking = await VehicleBooking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const [policy] = await VehicleRentalPolicy.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });

    const returnChecklist = await VehicleChecklist.findOne({ where: { bookingId: booking.id, type: 'return' } });
    if (!returnChecklist) {
      return res.status(400).json({ success: false, message: 'Return checklist missing. Cannot preview bill.' });
    }

    const pickupChecklist = await VehicleChecklist.findOne({ where: { bookingId: booking.id, type: 'pickup' } });

    const { lateFee, extraMileageFee } = await calculateExtraFees(booking, policy, returnChecklist, pickupChecklist);

    return res.json({
      success: true,
      data: {
        lateFee,
        extraMileageFee,
        cleaningFeePolicy: Number(policy.cleaningFee),
        damageLiabilityCap: Number(policy.damageLiabilityCap),
      }
    });
  } catch (err) {
    console.error('previewBill error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateBill = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { applyCleaningFee, manualDamageFee, extraNotes } = req.body;

    const booking = await VehicleBooking.findByPk(id, { transaction: t, include: [{ association: 'finalBill' }] });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.finalBill) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Final bill already generated for this booking' });
    }

    if (booking.status !== 'returned') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Vehicle must be in "returned" state before generating the bill.' });
    }

    const returnChecklist = await VehicleChecklist.findOne({ where: { bookingId: id, type: 'return' }, transaction: t });
    if (!returnChecklist) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Return checklist missing.' });
    }
    const pickupChecklist = await VehicleChecklist.findOne({ where: { bookingId: id, type: 'pickup' }, transaction: t });
    const [policy] = await VehicleRentalPolicy.findOrCreate({ where: { id: 1 }, defaults: { id: 1 }, transaction: t });

    const { lateFee, extraMileageFee } = await calculateExtraFees(booking, policy, returnChecklist, pickupChecklist);

    const cleaningFee = applyCleaningFee ? Number(policy.cleaningFee) : 0;
    const damageFee = Number(manualDamageFee) || 0;

    const totalExtra = lateFee + extraMileageFee + cleaningFee + damageFee;
    const newBalanceAmount = parseFloat(booking.balanceAmount) + totalExtra;

    // Create the final bill record
    const finalBill = await VehicleFinalBill.create({
      bookingId: booking.id,
      lateFee,
      extraMileageFee,
      cleaningFee,
      damageFee,
      totalExtraCharges: totalExtra,
      notes: extraNotes || null,
    }, { transaction: t });

    await booking.update({
      balanceAmount: newBalanceAmount,
      status: 'completed'
    }, { transaction: t });

    await t.commit();

    // Attach for frontend
    booking.dataValues.finalBill = finalBill;

    return res.json({ success: true, message: 'Final bill generated successfully', data: booking });
  } catch (err) {
    await t.rollback();
    console.error('generateBill error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
