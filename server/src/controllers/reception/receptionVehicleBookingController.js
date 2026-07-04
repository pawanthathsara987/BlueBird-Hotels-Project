import { Op } from "sequelize";
import sequelize from "../../config/database.js";
import VehicleBooking from "../../models/vehicle/VehicleBookingModel.js";
import Vehicle from "../../models/vehicle/vehicleModel.js";
import Customer from "../../models/User/Customer.js";
import DriverPricingSetting from "../../models/vehicle/driverPricingModel.js";
import StaffMember from "../../models/User/StaffMember.js";
import VehicleRentalPolicy from "../../models/vehicle/vehicleRentalPolicyModel.js";

const BLOCKING_BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "driver_assigned",
  "balance_paid",
  "ongoing",
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

// 1. Get all vehicle bookings for reception
export const getReceptionVehicleBookings = async (req, res) => {
  try {
    const bookings = await VehicleBooking.findAll({
      include: [
        { association: "vehicle" },
        { association: "customer" }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching vehicle bookings for reception:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle bookings",
      error: error.message,
    });
  }
};

// 2. Create vehicle booking on reception side (overriding online restrictions)
export const createReceptionVehicleBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      vehicleId,
      fullName,
      email,
      phone,
      pickupDatetime,
      returnDatetime,
      pickupLocation,
      dropoffLocation,
      hireType, // 'with_driver' or 'without_driver'
      customerLicenseNo,
      customerLicenseExpiry,
      specialRequirements,
      isFullyPaid = false,
      paymentMethod = 'cash'
    } = req.body;

    if (!vehicleId) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Vehicle selection is required" });
    }
    if (!fullName || !email || !phone) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Guest name, email and phone number are required" });
    }
    if (!pickupDatetime || !returnDatetime) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Pickup and return date/times are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    const pickupDate = new Date(pickupDatetime);
    const returnDate = new Date(returnDatetime);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Pickup and return datetimes must be valid dates" });
    }

    if (returnDate <= pickupDate) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Return datetime must be after pickup datetime" });
    }

    const withDriver = hireType === "with_driver";

    if (!withDriver) {
      if (!customerLicenseNo || !customerLicenseExpiry) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "License details are required for self-drive bookings" });
      }

      const licenseExpiry = new Date(customerLicenseExpiry);
      if (isNaN(licenseExpiry.getTime())) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Customer license expiry must be a valid date" });
      }
      if (licenseExpiry < returnDate) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Customer driving license expires before the return date" });
      }
    }

    const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!vehicle) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    if (!["available", "booked"].includes(vehicle.status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Vehicle is currently ${vehicle.status}` });
    }

    // Check overlaps
    const pickupDateWithBuffer = new Date(pickupDate.getTime() - 24 * 60 * 60 * 1000);
    const overlappingBooking = await VehicleBooking.findOne({
      where: {
        vehicleId,
        status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
        pickupDatetime: { [Op.lt]: returnDate },
        returnDatetime: { [Op.gt]: pickupDateWithBuffer },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (overlappingBooking) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "Vehicle is no longer available for the selected date range",
      });
    }

    const numDays = calcDays(pickupDatetime, returnDatetime);
    const vehicleRatePerDay = parseFloat(vehicle.pricePerDay || 0);

    const driverSetting = await DriverPricingSetting.findByPk(1, { transaction: t });
    const driverRatePerDay = withDriver ? parseFloat(driverSetting?.driverPricePerDay || 0) : null;

    const [policy] = await VehicleRentalPolicy.findOrCreate({
      where: { id: 1 },
      defaults: { id: 1 },
      transaction: t
    });
    const securityDepositAmount = parseFloat(policy?.securityDepositAmount || 0);

    const subtotal = (vehicleRatePerDay + (driverRatePerDay || 0)) * numDays;
    const discount = 0.0;
    const totalPayable = subtotal - discount + securityDepositAmount;
    const depositPercentage = 100;
    const depositAmount = totalPayable;
    const balanceAmount = 0.00;

    // Handle Customer lookup or create
    let customerObj = await Customer.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phoneNumber: phone }
        ]
      },
      transaction: t
    });

    if (!customerObj) {
      const names = fullName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "Guest";

      customerObj = await Customer.create({
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        country: "Unknown"
      }, { transaction: t });
    }

    const depositPaidAt = new Date();
    const balancePaidAt = new Date();

    let balanceCollectedBy = null;
    if (req.user?.id) {
      const staffObj = await StaffMember.findOne({
        where: {
          [Op.or]: [
            { userId: req.user.id },
            { email: req.user.email }
          ]
        },
        transaction: t
      });
      if (staffObj) {
        balanceCollectedBy = staffObj.userId;
      }
    }

    const status = "balance_paid";

    const booking = await VehicleBooking.create({
      bookingNo: generateBookingNo(),
      customerId: customerObj.id,
      vehicleId,
      driverId: null,
      hireType: withDriver ? "with_driver" : "without_driver",
      pickupDatetime: pickupDate,
      returnDatetime: returnDate,
      numDays,
      pickupLocation: pickupLocation || "Hotel Lobby",
      dropoffLocation: dropoffLocation || "Hotel Lobby",
      customerLicenseNo: customerLicenseNo || null,
      customerLicenseExpiry: customerLicenseExpiry || null,
      vehicleRatePerDay,
      driverRatePerDay,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      depositPercentage,
      depositAmount: depositAmount.toFixed(2),
      depositPaidAt,
      balanceAmount: balanceAmount.toFixed(2),
      balancePaidAt,
      balancePaymentMethod: paymentMethod || "cash",
      balanceCollectedBy,
      securityDepositCollected: securityDepositAmount,
      securityDepositPaidAt: new Date(),
      status,
      specialRequirements
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Vehicle rental booking created successfully",
      data: booking
    });

  } catch (error) {
    await t.rollback();
    console.error("Error creating vehicle booking in reception:", error);
    try {
      const fs = await import("fs");
      fs.appendFileSync("error_debug.log", `${new Date().toISOString()} - ERROR: ${error.message}\nSTACK: ${error.stack}\n\n`);
    } catch (e) {
      console.error("Failed to write to error_debug.log:", e);
    }
    res.status(500).json({
      success: false,
      message: "Error creating vehicle booking",
      error: error.message
    });
  }
};

// 3. Cancel vehicle booking on reception side
export const cancelReceptionVehicleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await VehicleBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Vehicle booking not found" });
    }

    if (["cancelled", "returned", "completed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a booking that is already ${booking.status}` });
    }

    await booking.update({
      status: "cancelled",
      cancelledBy: req.user?.id || null,
      cancelledAt: new Date(),
      cancellationReason: cancellationReason || "Cancelled by receptionist"
    });

    res.status(200).json({
      success: true,
      message: "Vehicle booking cancelled successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error cancelling vehicle booking in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling vehicle booking",
      error: error.message
    });
  }
};

// 4. Get driver pricing setting for reception forms
export const getDriverPricing = async (req, res) => {
  try {
    const setting = await DriverPricingSetting.findByPk(1);
    res.status(200).json({
      success: true,
      data: setting || { driverPricePerDay: 1500.00 }
    });
  } catch (error) {
    console.error("Error fetching driver pricing setting in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching driver pricing setting"
    });
  }
};

// 5. Check vehicle availability (real-time check)
export const checkVehicleAvailability = async (req, res) => {
  try {
    const { vehicleId, pickupDatetime, returnDatetime } = req.query;

    if (!vehicleId || !pickupDatetime || !returnDatetime) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, pickupDatetime, and returnDatetime are required"
      });
    }

    const pickupDate = new Date(pickupDatetime);
    const returnDate = new Date(returnDatetime);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates provided"
      });
    }

    if (returnDate <= pickupDate) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date"
      });
    }

    const pickupDateWithBuffer = new Date(pickupDate.getTime() - 24 * 60 * 60 * 1000);

    const overlappingBooking = await VehicleBooking.findOne({
      where: {
        vehicleId,
        status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
        pickupDatetime: { [Op.lt]: returnDate },
        returnDatetime: { [Op.gt]: pickupDateWithBuffer },
      }
    });

    if (overlappingBooking) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Vehicle is no longer available for the selected date range"
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: "Vehicle is available"
    });

  } catch (error) {
    console.error("Error checking vehicle availability:", error);
    res.status(500).json({
      success: false,
      message: "Error checking vehicle availability",
      error: error.message
    });
  }
};

// 6. Get vehicle rental policy for reception forms
export const getReceptionVehiclePolicy = async (req, res) => {
  try {
    const [policy] = await VehicleRentalPolicy.findOrCreate({
      where: { id: 1 },
      defaults: {
        id: 1,
        lateReturnGraceHours: 4,
        lateReturnFeePerHour: 4.0,
        lateReturnFullDayAfterHours: 4,
        securityDepositAmount: 200.0,
        includedKilometersPerDay: 100,
        extraMileageFee: 120.0,
        extraMileageCurrency: 'LKR'
      }
    });
    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error("Error fetching vehicle rental policy in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle rental policy"
    });
  }
};

// 7. Collect balance payment for an existing vehicle booking
export const collectVehicleBalancePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "paymentMethod is required"
      });
    }

    const booking = await VehicleBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Vehicle booking not found"
      });
    }

    if (booking.status === "pending_payment") {
      return res.status(400).json({
        success: false,
        message: "Cannot collect balance payment for an unpaid booking. The customer must pay the advance deposit first."
      });
    }

    if (booking.balancePaidAt) {
      return res.status(400).json({
        success: false,
        message: "Balance payment has already been collected for this booking"
      });
    }

    let balanceCollectedBy = null;
    if (req.user?.id) {
      const staffObj = await StaffMember.findOne({
        where: {
          [Op.or]: [
            { userId: req.user.id },
            { email: req.user.email }
          ]
        }
      });
      if (staffObj) {
        balanceCollectedBy = staffObj.userId;
      }
    }

    // Update status and payment details
    booking.balancePaidAt = new Date();
    booking.balancePaymentMethod = paymentMethod;
    booking.balanceCollectedBy = balanceCollectedBy;
    booking.status = "balance_paid";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Balance payment collected successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error collecting vehicle balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while collecting balance payment"
    });
  }
};
