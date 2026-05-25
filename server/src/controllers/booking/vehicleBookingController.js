import sequelize from '../../config/database.js';
import { Op } from 'sequelize';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Customer from '../../models/User/Customer.js';
import DriverPricingSetting from '../../models/vehicle/driverPricingModel.js';

const BLOCKING_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'driver_assigned',
  'balance_paid',
  'ongoing',
];

const generateBookingNo = () => {
  return `VB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
};

const calcDays = (pickup, ret) => {
  const ms = new Date(ret) - new Date(pickup);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const createVehicleBooking = async (req, res) => {
  try {
    const vehicleId = Number(req.params.id);
    const { name, email, phone, pickupDatetime, returnDatetime, pickupLocation, dropoffLocation, withDriver = false, specialRequirements } = req.body;

    if (!vehicleId) return res.status(400).json({ success: false, message: 'vehicle id required' });
    if (!name || !email || !phone) return res.status(400).json({ success: false, message: 'customer name, email and phone are required' });
    if (!pickupDatetime || !returnDatetime) return res.status(400).json({ success: false, message: 'pickup and return datetimes are required' });

    const pickupDate = new Date(pickupDatetime);
    const returnDate = new Date(returnDatetime);

    if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
      return res.status(400).json({ success: false, message: 'pickup and return datetimes must be valid dates' });
    }

    if (returnDate <= pickupDate) {
      return res.status(400).json({ success: false, message: 'return datetime must be after pickup datetime' });
    }

    const t = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!vehicle) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      if (vehicle.status !== 'available') {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Vehicle is ${vehicle.status}` });
      }

      const overlappingBooking = await VehicleBooking.findOne({
        where: {
          vehicleId,
          status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
          pickupDatetime: { [Op.lt]: returnDate },
          returnDatetime: { [Op.gt]: pickupDate },
        },
        attributes: ['id', 'bookingNo', 'pickupDatetime', 'returnDatetime'],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (overlappingBooking) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: 'Vehicle is no longer available for the selected date range',
          data: {
            available: false,
            conflictingBookingNo: overlappingBooking.bookingNo,
          },
        });
      }

      const numDays = calcDays(pickupDatetime, returnDatetime);
      const vehicleRatePerDay = parseFloat(vehicle.pricePerDay || 0);

      const driverSetting = await DriverPricingSetting.findByPk(1, { transaction: t });
      const driverRatePerDay = withDriver ? parseFloat(driverSetting?.driverPricePerDay || 0) : null;

      const subtotal = (vehicleRatePerDay + (driverRatePerDay || 0)) * numDays;
      const discount = 0.0;
      const totalPayable = subtotal - discount;
      const depositPercentage = 30;
      const depositAmount = parseFloat(((totalPayable * depositPercentage) / 100).toFixed(2));
      const balanceAmount = parseFloat((totalPayable - depositAmount).toFixed(2));

      // find or create customer
      const [customer] = await Customer.findOrCreate({ 
        where: { email }, 
        defaults: { 
          firstName: name.split(' ')[0] || name, 
          lastName: name.split(' ').slice(1).join(' '), 
          email, 
          phoneNumber: phone 
        }, 
        transaction: t 
      });

      // create booking
      const booking = await VehicleBooking.create({
        bookingNo: generateBookingNo(),
        customerId: customer.id,
        vehicleId,
        driverId: null,
        hireType: withDriver ? 'with_driver' : 'without_driver',
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        numDays,
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        customerLicenseNo: null,
        customerLicenseExpiry: null,
        vehicleRatePerDay: vehicleRatePerDay,
        driverRatePerDay: driverRatePerDay,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        totalPayable: totalPayable.toFixed(2),
        depositPercentage,
        depositAmount: depositAmount.toFixed(2),
        depositPaidAt: null,
        balanceAmount: balanceAmount.toFixed(2),
        status: 'pending_payment',
        specialRequirements: specialRequirements || null,
      }, { transaction: t });

      await t.commit();

      // Return deposit amount and booking details
      return res.status(201).json({ success: true, data: { bookingId: booking.id, bookingNo: booking.bookingNo, depositAmount, payLink: `/pay/vehicle/${booking.id}` } });
    } catch (dbErr) {
      await t.rollback();
      throw dbErr;
    }
  } catch (err) {
    console.error('createVehicleBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { createVehicleBooking };
