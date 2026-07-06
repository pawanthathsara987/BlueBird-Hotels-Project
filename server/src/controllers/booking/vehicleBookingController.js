import sequelize from '../../config/database.js';
import { Op } from 'sequelize';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Customer from '../../models/User/Customer.js';
import DriverPricingSetting from '../../models/vehicle/driverPricingModel.js';
import { sendVehicleBookingConfirmationEmail } from '../../services/emailService.js';

const BLOCKING_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'driver_assigned',
  'balance_paid',
  'ongoing',
];

const generateBookingNo = () => {
  const timePart = Date.now().toString(36).toUpperCase().slice(-6);
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VB-${timePart}-${randPart}`;
};

const calcDays = (pickup, ret) => {
  const ms = new Date(ret) - new Date(pickup);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const createVehicleBooking = async (req, res) => {
  try {
    const vehicleId = Number(req.params.id);
    const { name, email, phone, pickupDatetime, returnDatetime, pickupLocation, dropoffLocation, withDriver = false, specialRequirements, customerLicenseNo, customerLicenseExpiry } = req.body;

    if (!vehicleId) return res.status(400).json({ success: false, message: 'vehicle id required' });
    if (!name || !email || !phone) return res.status(400).json({ success: false, message: 'customer name, email and phone are required' });
    if (!pickupDatetime || !returnDatetime) return res.status(400).json({ success: false, message: 'pickup and return datetimes are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const phoneDigits = phone.replace(/[\s\-()+ ]/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (7–15 digits)' });
    }

    const pickupDate = new Date(pickupDatetime);
    const returnDate = new Date(returnDatetime);

    if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
      return res.status(400).json({ success: false, message: 'pickup and return datetimes must be valid dates' });
    }

    const today = new Date();
    today.setDate(today.getDate() + 7);
    const minPickupDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const pickupDateStr = pickupDatetime.split("T")[0]; // works with "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"

    if (pickupDateStr < minPickupDateStr) {
      return res.status(400).json({ success: false, message: 'Pickup datetime must be at least 1 week (7 days) in advance' });
    }

    if (returnDate <= pickupDate) {
      return res.status(400).json({ success: false, message: 'return datetime must be after pickup datetime' });
    }

    const MAX_BOOKING_DAYS = 30;
    const bookingDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    if (bookingDays > MAX_BOOKING_DAYS) {
      return res.status(400).json({ success: false, message: `Booking duration cannot exceed ${MAX_BOOKING_DAYS} days` });
    }

    if (!withDriver) {
      if (!customerLicenseNo || !customerLicenseExpiry) {
        return res.status(400).json({ success: false, message: 'License details are required for self-drive bookings' });
      }

      const licenseExpiry = new Date(customerLicenseExpiry);
      if (Number.isNaN(licenseExpiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Customer license expiry must be a valid date' });
      }
      if (licenseExpiry < new Date()) {
        return res.status(400).json({ success: false, message: 'Customer driving license has already expired' });
      }
      if (licenseExpiry < returnDate) {
        return res.status(400).json({ success: false, message: 'Customer driving license expires before the return date' });
      }
    }

    const t = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!vehicle) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      // Allow booking if vehicle is available or already booked (for future dates)
      // The date-overlap query below handles actual conflicts
      if (!['available', 'booked'].includes(vehicle.status)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Vehicle is ${vehicle.status}` });
      }



      if (vehicle.insuranceExpiry && returnDate > new Date(vehicle.insuranceExpiry)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Vehicle insurance expires before the requested return date' });
      }

      if (vehicle.revenueLicenseExpiry && returnDate > new Date(vehicle.revenueLicenseExpiry)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Vehicle revenue license expires before the requested return date' });
      }

      // Same-day return check: return date of existing booking must not be on or after the day of pickup
      const pickupDateWithBuffer = new Date(pickupDate);
      pickupDateWithBuffer.setHours(0, 0, 0, 0);

      const overlappingBooking = await VehicleBooking.findOne({
        where: {
          vehicleId,
          status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
          pickupDatetime: { [Op.lt]: returnDate },
          returnDatetime: { [Op.gt]: pickupDateWithBuffer },
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
      const depositPercentage = 50;
      const depositAmount = parseFloat(((totalPayable * depositPercentage) / 100).toFixed(2));
      const balanceAmount = parseFloat((totalPayable - depositAmount).toFixed(2));

      const customerId = req.user?.id;
      if (!customerId) {
        await t.rollback();
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login to book a vehicle.' });
      }

      // create booking
      const booking = await VehicleBooking.create({
        bookingNo: generateBookingNo(),
        customerId: customerId,
        vehicleId,
        driverId: null,
        hireType: withDriver ? 'with_driver' : 'without_driver',
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        numDays,
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        customerLicenseNo: customerLicenseNo || null,
        customerLicenseExpiry: customerLicenseExpiry || null,
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

      // Send confirmation email (fire-and-forget — don't block the response)
      sendVehicleBookingConfirmationEmail({
        email,
        name,
        bookingNo: booking.bookingNo,
        vehicleName: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim(),
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        numDays,
        hireType: withDriver ? 'with_driver' : 'without_driver',
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        totalPayable,
        depositAmount,
        balanceAmount,
      }).catch((emailErr) => console.error('[EMAIL] Vehicle booking email failed:', emailErr));

      // Return deposit amount and booking details
      return res.status(201).json({ success: true, data: { bookingId: booking.id, bookingNo: booking.bookingNo, depositAmount, balanceAmount, payLink: `/pay/vehicle/${booking.id}` } });
    } catch (dbErr) {
      await t.rollback();
      throw dbErr;
    }
  } catch (err) {
    console.error('createVehicleBooking error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerVehicleBookings = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookings = await VehicleBooking.findAll({
      where: { customerId },
      include: [
        { association: 'vehicle' },
        { association: 'driver' },
        { association: 'payments' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('getCustomerVehicleBookings error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { createVehicleBooking, getCustomerVehicleBookings };
