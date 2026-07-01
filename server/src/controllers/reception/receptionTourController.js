import { TourInquiry, Tour, Customer } from "../../models/index.js";
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
    const inquiries = await TourInquiry.findAll({
      include: [
        {
          model: Tour,
          attributes: ["id", "packageName", "price", "discount"],
        },
      ],
      order: [["createdAt", "DESC"]],
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
