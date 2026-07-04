import { TourInquiry, Tour, Customer, StaffMember } from "../../models/index.js";
import { Op } from "sequelize";
import sequelize from "../../config/database.js";
import crypto from "crypto";
import {
  validateEmail,
  validatePhone,
  validateGuestCount,
  validatePickupLocation,
  validateName,
  validateNationality,
} from "../../utils/validationUtils.js";

const buildReferenceCode = (prefix) => {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${year}-${randomPart}`;
};

const generateUniqueReferenceCode = async (model, fieldName, prefix, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const referenceCode = buildReferenceCode(prefix);
    const existingRecord = await model.findOne({
      where: { [fieldName]: referenceCode },
      attributes: ["id"],
    });

    if (!existingRecord) {
      return referenceCode;
    }
  }

  throw new Error(`Unable to generate a unique ${fieldName} after ${maxAttempts} attempts`);
};

// Create new tour inquiry (receptionist side)
export const createTourInquiry = async (req, res) => {
  try {
    const {
      tourId,
      fullName,
      email,
      phone,
      nationality,
      nic,
      passportId,
      numberOfAdults,
      numberOfChildren,
      startDate,
      pickupLocation,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (!tourId) {
      return res.status(400).json({ success: false, message: "Tour selection is required", field: "tourId" });
    }
    if (!fullName) {
      return res.status(400).json({ success: false, message: "Full name is required", field: "fullName" });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required", field: "email" });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required", field: "phone" });
    }
    if (!nationality) {
      return res.status(400).json({ success: false, message: "Nationality is required", field: "nationality" });
    }
    if (!startDate) {
      return res.status(400).json({ success: false, message: "Travel start date is required", field: "startDate" });
    }
    if (!pickupLocation) {
      return res.status(400).json({ success: false, message: "Pickup location is required", field: "pickupLocation" });
    }

    // Detailed validations
    const validationErrors = {};
    if (!validateName(fullName)) {
      validationErrors.fullName = "Full name must be at least 2 characters";
    }
    if (!validateEmail(email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!validatePhone(phone)) {
      validationErrors.phone = "Invalid phone number format";
    }
    if (!validateNationality(nationality)) {
      validationErrors.nationality = "Nationality must be at least 2 characters";
    }

    const isLocal = nationality && (nationality.toLowerCase() === "sri lankan" || nationality.toLowerCase() === "local");
    if (isLocal) {
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
      if (!nic || !nicRegex.test(nic.trim())) {
        validationErrors.nic = "Invalid Sri Lankan NIC format (Must be e.g. 991234567V or 199912345678).";
      }
    } else {
      const passportRegex = /^[a-zA-Z0-9-]{5,15}$/;
      if (!passportId || !passportRegex.test(passportId.trim())) {
        validationErrors.passportId = "Invalid Passport ID (Must be 5 to 15 alphanumeric characters).";
      }
    }
    const tourDateVal = new Date(startDate);
    tourDateVal.setHours(0, 0, 0, 0);
    const todayVal = new Date();
    todayVal.setHours(0, 0, 0, 0);
    const oneDayLaterVal = new Date(todayVal);
    oneDayLaterVal.setDate(oneDayLaterVal.getDate() + 1);

    if (tourDateVal < oneDayLaterVal) {
      validationErrors.startDate = "Tour date must be at least 1 day from today";
    }
    if (!validatePickupLocation(pickupLocation)) {
      validationErrors.pickupLocation = "Pickup location must be at least 3 characters";
    }

    const numAdults = Number(numberOfAdults) || 1;
    const numChildren = Number(numberOfChildren) || 0;
    if (!validateGuestCount(numAdults, numChildren)) {
      validationErrors.numberOfAdults = "Total guests must be between 1 and 100";
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Validate tour exists
    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found", field: "tourId" });
    }
    if (tour.status !== "active") {
      return res.status(400).json({ success: false, message: "This tour is not currently available", field: "tourId" });
    }

    // Lookup customer ID by email if receptionist is creating the booking
    let guestCustomerId = null;
    const customerObj = await Customer.findOne({ where: { email } });
    if (customerObj) {
      guestCustomerId = customerObj.id;
    }

    // Generate unique inquiry reference
    const inquiryRef = await generateUniqueReferenceCode(TourInquiry, "inquiryRef", "TI");

    // Create inquiry
    const inquiry = await TourInquiry.create({
      inquiryRef,
      tourId,
      customerId: guestCustomerId,
      fullName,
      email,
      phone,
      nationality,
      nic: isLocal ? nic : null,
      passportId: !isLocal ? passportId : null,
      numberOfAdults: numAdults,
      numberOfChildren: numChildren,
      startDate,
      pickupLocation,
      specialRequests,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Tour booking inquiry created successfully!",
      data: {
        inquiryId: inquiry.id,
        inquiryRef: inquiry.inquiryRef,
        status: inquiry.status,
      },
    });
  } catch (error) {
    console.error("Error creating tour inquiry in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tour inquiry",
      error: error.message,
    });
  }
};

// Get all tour inquiries (receptionist view)
export const getAllInquiries = async (req, res) => {
  try {
    const rows = await sequelize.query(`
      SELECT 
        ti.*,
        t.id AS tour_id,
        t.packageName,
        t.price AS tourPrice,
        t.discount AS tourDiscount,
        tb.id AS bookingId,
        tb.bookingRef,
        tb.totalAmount,
        tb.depositAmount,
        tb.remainingAmount,
        tb.status AS bookingStatus,
        tb.balancePaidAt,
        tb.balancePaymentMethod,
        tb.balanceCollectedBy
      FROM tour_inquiries ti
      LEFT JOIN tours t ON ti.tourId = t.id
      LEFT JOIN tour_bookings tb ON ti.id = tb.inquiryId
      ORDER BY ti.createdAt DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const inquiries = rows.map(r => {
      const item = { ...r };
      item.Tour = r.tour_id ? {
        id: r.tour_id,
        packageName: r.packageName,
        price: r.tourPrice,
        discount: r.tourDiscount
      } : null;
      return item;
    });

    res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching inquiries in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
      error: error.message,
    });
  }
};

// Accept inquiry
export const acceptInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await TourInquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (inquiry.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending inquiries can be accepted" });
    }

    await inquiry.update({ status: "accepted" });

    res.status(200).json({
      success: true,
      message: "Inquiry accepted successfully.",
      data: { inquiry },
    });
  } catch (error) {
    console.error("Error accepting inquiry in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting inquiry",
      error: error.message,
    });
  }
};

// Reject inquiry
export const rejectInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const inquiry = await TourInquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (inquiry.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending inquiries can be rejected" });
    }

    await inquiry.update({
      status: "rejected",
      rejectionReason: rejectionReason || "Rejected by receptionist",
    });

    res.status(200).json({
      success: true,
      message: "Inquiry rejected successfully.",
      data: { inquiry },
    });
  } catch (error) {
    console.error("Error rejecting inquiry in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting inquiry",
      error: error.message,
    });
  }
};

// Cancel inquiry
export const cancelInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await TourInquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (inquiry.status === "rejected") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled/rejected" });
    }

    await inquiry.update({
      status: "rejected",
      rejectionReason: "Cancelled by receptionist",
    });

    res.status(200).json({
      success: true,
      message: "Tour booking cancelled successfully.",
      data: { inquiry },
    });
  } catch (error) {
    console.error("Error cancelling inquiry in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling inquiry",
      error: error.message,
    });
  }
};

// Update guest count (pax)
export const updatePax = async (req, res) => {
  try {
    const { id } = req.params;
    const { numberOfAdults, numberOfChildren } = req.body;

    const inquiry = await TourInquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    const numAdults = Number(numberOfAdults) || 1;
    const numChildren = Number(numberOfChildren) || 0;
    if (!validateGuestCount(numAdults, numChildren)) {
      return res.status(400).json({ success: false, message: "Total guests must be between 1 and 100" });
    }

    await inquiry.update({
      numberOfAdults: numAdults,
      numberOfChildren: numChildren,
    });

    res.status(200).json({
      success: true,
      message: "Pax updated successfully.",
      data: { inquiry },
    });
  } catch (error) {
    console.error("Error updating pax in reception:", error);
    res.status(500).json({
      success: false,
      message: "Error updating pax",
      error: error.message,
    });
  }
};

// Collect remaining balance payment for a Tour booking
export const collectTourBalancePayment = async (req, res) => {
  try {
    const { id } = req.params; // inquiryId
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "paymentMethod is required"
      });
    }

    // Check if matching booking exists in tour_bookings
    const [booking] = await sequelize.query(
      "SELECT * FROM tour_bookings WHERE inquiryId = :inquiryId LIMIT 1",
      {
        replacements: { inquiryId: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Tour booking not found. The customer might not have paid the deposit yet."
      });
    }

    if (booking.balancePaidAt) {
      return res.status(400).json({
        success: false,
        message: "Balance payment has already been collected for this tour booking"
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

    // Update remaining balance details in tour_bookings
    await sequelize.query(`
      UPDATE tour_bookings 
      SET 
        status = 'completed', 
        balancePaidAt = NOW(), 
        balancePaymentMethod = :paymentMethod, 
        balanceCollectedBy = :balanceCollectedBy,
        updatedAt = NOW()
      WHERE inquiryId = :inquiryId
    `, {
      replacements: {
        inquiryId: id,
        paymentMethod,
        balanceCollectedBy
      }
    });

    res.status(200).json({
      success: true,
      message: "Tour balance payment collected successfully"
    });

  } catch (error) {
    console.error("Error collecting tour balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while collecting balance payment"
    });
  }
};
