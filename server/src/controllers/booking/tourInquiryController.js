import { TourInquiry, Tour, TourRefund } from "../../models/index.js";
import crypto from "crypto";
import {
  validateEmail,
  validatePhone,
  validateTourDate,
  validateGuestCount,
  validatePickupLocation,
  validateName,
  validateNationality,
  validateInquiryForm,
} from "../../utils/validationUtils.js";
import {
  sendAcceptedInquiryQuoteEmail,
  sendRejectionEmail,
} from "../../services/emailService.js";

const getBasePricePerGuest = (tour) => {
  const price = Number(tour?.price || 0);
  const discount = Number(tour?.discount || 0);
  return discount > 0 ? price - (price * discount) / 100 : price;
};

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

const calculateRefundPercentage = (tourDate) => {
  // tourDate may be YYYY-MM-DD or full datetime; parse into JS Date
  const start = new Date(tourDate);
  if (isNaN(start.getTime())) {
    return { hoursUntilTour: null, refundPercentage: 0 };
  }

  const now = new Date();
  const msUntil = start.getTime() - now.getTime();
  const hoursUntilTour = Math.floor(msUntil / (1000 * 60 * 60));

  if (hoursUntilTour >= 24 * 7) return { hoursUntilTour, refundPercentage: 60 };
  if (hoursUntilTour >= 24 * 4) return { hoursUntilTour, refundPercentage: 20 };
  return { hoursUntilTour, refundPercentage: 0 };
};

// Create new tour inquiry
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

    // Validate required fields are present
    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour selection is required",
        field: "tourId",
      });
    }

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
        field: "fullName",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        field: "email",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
        field: "phone",
      });
    }

    if (!nationality) {
      return res.status(400).json({
        success: false,
        message: "Nationality is required",
        field: "nationality",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Travel start date is required",
        field: "startDate",
      });
    }

    if (!pickupLocation) {
      return res.status(400).json({
        success: false,
        message: "Pickup location is required",
        field: "pickupLocation",
      });
    }

    // Use validation utilities for detailed validation
    const validationErrors = {};

    // Validate full name
    if (!validateName(fullName)) {
      validationErrors.fullName = "Full name must be at least 2 characters";
    }

    // Validate email format
    if (!validateEmail(email)) {
      validationErrors.email = "Invalid email format";
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      validationErrors.phone = "Invalid phone number format";
    }

    // Validate nationality
    if (!validateNationality(nationality)) {
      validationErrors.nationality = "Nationality must be at least 2 characters";
    }

    // Validate tour date (minimum 4 days ahead)
    if (!validateTourDate(startDate)) {
      validationErrors.startDate = "Tour date must be at least 4 days from today";
    }

    // Validate pickup location
    if (!validatePickupLocation(pickupLocation)) {
      validationErrors.pickupLocation = "Pickup location must be at least 3 characters";
    }

    // Validate guest count
    const numAdults = Number(numberOfAdults) || 1;
    const numChildren = Number(numberOfChildren) || 0;
    if (!validateGuestCount(numAdults, numChildren)) {
      validationErrors.numberOfAdults = "Total guests must be between 1 and 100";
    }

    // Return validation errors if any
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
      return res.status(404).json({
        success: false,
        message: "Tour not found",
        field: "tourId",
      });
    }

    // Validate tour is active
    if (tour.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This tour is not currently available for inquiries",
        field: "tourId",
      });
    }

    // Generate unique inquiry reference
    const inquiryRef = await generateUniqueReferenceCode(TourInquiry, "inquiryRef", "TI");

    // Create inquiry
    const inquiry = await TourInquiry.create({
      inquiryRef,
      tourId,
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
      message: "Tour inquiry created successfully. Please check your email for confirmation.",
      data: {
        inquiryId: inquiry.id,
        inquiryRef: inquiry.inquiryRef,
        status: inquiry.status,
      },
    });
  } catch (error) {
    console.error("Error creating tour inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tour inquiry",
      error: error.message,
    });
  }
};

// Get all inquiries (for manager/admin)
export const getAllInquiries = async (req, res) => {
  try {
    const { status, tourId, email, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (tourId) where.tourId = tourId;
    if (email) where.email = email;

    const offset = (page - 1) * limit;

    const inquiries = await TourInquiry.findAndCountAll({
      where,
      include: [
        {
          model: Tour,
          attributes: ["id", "packageName", "price", "discount"],
        },
      ],
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Inquiries retrieved successfully",
      data: inquiries.rows,
      pagination: {
        total: inquiries.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(inquiries.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
      error: error.message,
    });
  }
};

// Get single inquiry
export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await TourInquiry.findByPk(id, {
      include: [
        {
          model: Tour,
          attributes: ["id", "packageName", "price", "discount", "overview"],
        },
      ],
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry retrieved successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiry",
      error: error.message,
    });
  }
};

export const getRefundQuoteByInquiryCode = async (req, res) => {
  try {
    const { inquiryRef } = req.params;

    if (!inquiryRef) {
      return res.status(400).json({
        success: false,
        message: "Inquiry code is required",
        field: "inquiryRef",
      });
    }

    const inquiry = await TourInquiry.findOne({
      where: { inquiryRef },
      include: [
        {
          model: Tour,
          attributes: ["id", "packageName", "price", "discount"],
        },
      ],
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const tourPrice = Number(inquiry.Tour?.price || 0);
    const discount = Number(inquiry.Tour?.discount || 0);
    const packagePrice = discount > 0 ? tourPrice - (tourPrice * discount) / 100 : tourPrice;
    const { hoursUntilTour, refundPercentage } = calculateRefundPercentage(inquiry.startDate);
    const refundAmount = Number(((packagePrice * refundPercentage) / 100).toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Refund quote retrieved successfully",
      data: {
        inquiryRef: inquiry.inquiryRef,
        inquiryCreatedAt: inquiry.createdAt ? new Date(inquiry.createdAt).toISOString() : null,
        tourDate: inquiry.startDate,
        packageName: inquiry.Tour?.packageName || null,
        packagePrice: Number(packagePrice.toFixed(2)),
        refundPercentage,
        refundAmount,
        hoursUntilTour,
        customerName: inquiry.fullName,
        customerEmail: inquiry.email,
      },
    });
  } catch (error) {
    console.error("Error fetching refund quote:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching refund quote",
      error: error.message,
    });
  }
};

// Save a refund record to the database
export const saveRefundRecord = async (req, res) => {
  try {
    // Only accept inquiryRef and optional notes from client. Recalculate values server-side.
    const { inquiryRef, notes } = req.body;
    if (!inquiryRef) return res.status(400).json({ success: false, message: 'inquiryRef is required' });

    // Find inquiry and related tour
    const inquiry = await TourInquiry.findOne({
      where: { inquiryRef },
      include: [{ model: Tour, attributes: ['id', 'price', 'discount'] }],
    });

    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    // Prevent duplicate refund records for the same inquiryRef
    const existing = await TourRefund.findOne({ where: { inquiryRef } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A refund record for this inquiry already exists',
        data: {
          id: existing.id,
          refundRef: existing.refundRef,
          inquiryRef: existing.inquiryRef,
          tourId: existing.tourId,
          customerName: existing.customerName,
          email: existing.email,
          startDate: existing.startDate,
          tourDate: existing.startDate,
          daysUntilTour: Number(existing.daysUntilTour),
          packagePrice: Number(existing.packagePrice),
          refundPercentage: Number(existing.refundPercentage),
          refundAmount: Number(existing.refundAmount),
          status: existing.status,
          notes: existing.notes,
          createdAt: existing.createdAt,
        },
      });
    }

    const tour = inquiry.Tour;
    const tourPrice = Number(tour?.price || 0);
    const discount = Number(tour?.discount || 0);
    const packagePrice = discount > 0 ? tourPrice - (tourPrice * discount) / 100 : tourPrice;

    const { daysUntilTour, refundPercentage } = calculateRefundPercentage(inquiry.startDate);
    const refundAmount = Number(((packagePrice * refundPercentage) / 100).toFixed(2));

    const refundRef = await generateUniqueReferenceCode(TourRefund, 'refundRef', 'TR');

    const record = await TourRefund.create({
      refundRef,
      inquiryRef,
      tourId: inquiry.tourId,
      customerName: inquiry.fullName,
      email: inquiry.email,
      startDate: (new Date(inquiry.startDate)).toISOString().split('T')[0],
      daysUntilTour,
      packagePrice: Number(packagePrice.toFixed(2)),
      refundPercentage,
      refundAmount,
      status: 'requested',
      notes: notes || null,
    });

    return res.status(201).json({ success: true, message: 'Refund saved', data: { id: record.id, refundRef: record.refundRef } });
  } catch (error) {
    console.error('Error saving refund record:', error);
    return res.status(500).json({ success: false, message: 'Failed to save refund', error: error.message });
  }
};

// Get refund by refundRef
export const getRefundByRef = async (req, res) => {
  try {
    const { refundRef } = req.params;
    if (!refundRef) return res.status(400).json({ success: false, message: 'refundRef is required' });

    const refund = await TourRefund.findOne({ where: { refundRef } });
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });

    // Normalize numeric fields and createdAt
    const normalized = {
      id: refund.id,
      refundRef: refund.refundRef,
      inquiryRef: refund.inquiryRef,
      tourId: refund.tourId,
      customerName: refund.customerName,
      email: refund.email,
      tourDate: refund.startDate,
      daysUntilTour: Number(refund.daysUntilTour),
      packagePrice: Number(refund.packagePrice),
      refundPercentage: Number(refund.refundPercentage),
      refundAmount: Number(refund.refundAmount),
      status: refund.status,
      notes: refund.notes,
      createdAt: refund.createdAt ? new Date(refund.createdAt).toISOString() : null,
    };

    return res.status(200).json({ success: true, message: 'Refund retrieved', data: normalized });
  } catch (error) {
    console.error('Error fetching refund:', error);
    return res.status(500).json({ success: false, message: 'Error fetching refund', error: error.message });
  }
};

// Accept inquiry and update status only
export const acceptInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await TourInquiry.findByPk(id, {
      include: [Tour],
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (inquiry.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending inquiries can be accepted",
      });
    }

    // Update inquiry status
    await inquiry.update({
      status: "accepted",
    });

    res.status(200).json({
      success: true,
      message: "Inquiry accepted successfully.",
      data: { inquiry },
    });
  } catch (error) {
    console.error("Error accepting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting inquiry",
      error: error.message,
    });
  }
};

// Send accepted inquiry email with optional custom price, group size, and tour date
export const sendAcceptedInquiryEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pricePerGuest,
      numberOfAdults,
      numberOfChildren,
      tourStartDate,
      managerNote,
    } = req.body;

    const inquiry = await TourInquiry.findByPk(id, {
      include: [
        {
          model: Tour,
          attributes: ["id", "packageName", "price", "discount"],
        },
      ],
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (inquiry.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted inquiries can send quote emails",
      });
    }

    const adults =
      numberOfAdults !== undefined ? Number(numberOfAdults) : Number(inquiry.numberOfAdults || 0);
    const children =
      numberOfChildren !== undefined ? Number(numberOfChildren) : Number(inquiry.numberOfChildren || 0);
    const tourDate = tourStartDate || inquiry.startDate;

    if (!tourDate) {
      return res.status(400).json({
        success: false,
        message: "Tour start date is required",
      });
    }

    if (!Number.isInteger(adults) || adults < 1) {
      return res.status(400).json({
        success: false,
        message: "numberOfAdults must be an integer greater than or equal to 1",
      });
    }

    if (!Number.isInteger(children) || children < 0) {
      return res.status(400).json({
        success: false,
        message: "numberOfChildren must be an integer greater than or equal to 0",
      });
    }

    const basePrice = (() => {
      const bp = Number(inquiry.Tour?.price || 0);
      const disc = Number(inquiry.Tour?.discount || 0);
      return disc > 0 ? bp - (bp * disc / 100) : bp;
    })();
    const selectedTotalPrice = pricePerGuest !== undefined ? Number(pricePerGuest) : basePrice;

    if (!Number.isFinite(selectedTotalPrice) || selectedTotalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total tour price must be a positive number",
      });
    }

    const totalGuests = adults + children;
    const totalAmount = Number(selectedTotalPrice.toFixed(2));
    const depositAmount = Number((totalAmount * 0.5).toFixed(2));
    const remainingAmount = Number((totalAmount - depositAmount).toFixed(2));

    const quoteBooking = {
      bookingRef: `${inquiry.inquiryRef}-QUOTE`,
      totalAmount,
      depositAmount,
      remainingAmount,
    };

    await sendAcceptedInquiryQuoteEmail(
      inquiry,
      quoteBooking,
      {
        packageName: inquiry.Tour?.packageName,
        tourBasePrice: basePrice,
        totalAmount,
        adults,
        children,
        tourStartDate: tourDate,
        managerNote,
      }
    );

    res.status(200).json({
      success: true,
      message: "Quote email sent successfully to guest",
      data: {
        inquiryId: inquiry.id,
        bookingRef: quoteBooking.bookingRef,
        totalGuests,
        tourPackagePrice: totalAmount,
        tourStartDate: tourDate,
        totalAmount,
        depositAmount,
        remainingAmount,
      },
    });
  } catch (error) {
    console.error("Error sending accepted inquiry email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending accepted inquiry email",
      error: error.message,
    });
  }
};

// Reject inquiry
export const rejectInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const inquiry = await TourInquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (inquiry.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending inquiries can be rejected",
      });
    }

    await inquiry.update({
      status: "rejected",
      rejectionReason: reason || null,
    });

    // Send rejection email to guest
    try {
      await sendRejectionEmail(inquiry, reason || "Your inquiry does not match our current availability.");
    } catch (emailError) {
      console.error("Warning: Email sending failed, but inquiry was rejected:", emailError);
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Inquiry rejected successfully. Rejection email sent to guest.",
      data: {
        ...inquiry.toJSON(),
        rejectionReason: reason,
      },
    });
  } catch (error) {
    console.error("Error rejecting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting inquiry",
      error: error.message,
    });
  }
};

// Get inquiries for specific tour
export const getInquiriesByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { tourId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const inquiries = await TourInquiry.findAndCountAll({
      where,
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Tour inquiries retrieved successfully",
      data: inquiries.rows,
      pagination: {
        total: inquiries.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(inquiries.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tour inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tour inquiries",
      error: error.message,
    });
  }
};

// Get inquiry stats
export const getInquiryStats = async (req, res) => {
  try {
    const stats = {
      total: await TourInquiry.count(),
      pending: await TourInquiry.count({ where: { status: "pending" } }),
      accepted: await TourInquiry.count({ where: { status: "accepted" } }),
      rejected: await TourInquiry.count({ where: { status: "rejected" } }),
    };

    res.status(200).json({
      success: true,
      message: "Inquiry statistics retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiry stats",
      error: error.message,
    });
  }
};
