import { TourInquiry, Tour, TourBooking, TourPayment } from "../../models/index.js";
import { Op } from "sequelize";
import { generateSecureToken, getTokenExpiry } from "../../utils/tokenUtils.js";
import {
  validateEmail,
  validateTourDate,
  validateInquiryForm,
} from "../../utils/validationUtils.js";
import {
  sendBookingConfirmationEmail,
  sendRejectionEmail,
} from "../../services/emailService.js";
import { sendInquiryAcceptedEmail, sendInquiryRejectedEmail } from "../../middleware/EmailSender.js";

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

    // Validate required fields
    if (
      !tourId ||
      !fullName ||
      !email ||
      !phone ||
      !nationality ||
      !startDate ||
      !pickupLocation
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate tour date (minimum 2 days ahead)
    if (!validateTourDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Tour date must be at least 2 days from today",
      });
    }

    // Validate tour exists
    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Validate tour is active
    if (tour.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This tour is not currently available",
      });
    }

    // Generate unique inquiry reference
    const inquiryCount = await TourInquiry.count();
    const inquiryRef = `TI-${new Date().getFullYear()}-${String(
      inquiryCount + 1
    ).padStart(4, "0")}`;

    // Create inquiry
    const inquiry = await TourInquiry.create({
      inquiryRef,
      tourId,
      fullName,
      email,
      phone,
      nationality,
      numberOfAdults: numberOfAdults || 1,
      numberOfChildren: numberOfChildren || 0,
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
    const { status, tourId, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (tourId) where.tourId = tourId;

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
        {
          model: TourBooking,
          attributes: ["id", "bookingRef", "status", "totalAmount"],
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

// Accept inquiry and create booking
export const acceptInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerNote } = req.body;

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

    // Calculate pricing
    const tour = inquiry.Tour;
    const totalGuests = inquiry.numberOfAdults + inquiry.numberOfChildren;
    const pricePerGuest = tour.discount
      ? tour.price - (tour.price * tour.discount) / 100
      : tour.price;
    const totalAmount = pricePerGuest * totalGuests;
    const depositAmount = totalAmount * 0.5;
    const remainingAmount = totalAmount - depositAmount;

    // Generate booking reference
    const bookingCount = await TourBooking.count();
    const bookingRef = `TB-${new Date().getFullYear()}-${String(
      bookingCount + 1
    ).padStart(4, "0")}`;

    // Generate secure tokens
    const paymentToken = generateSecureToken();
    const trackingToken = generateSecureToken();
    const tokenExpiresAt = getTokenExpiry();

    // Create booking with tokens
    const booking = await TourBooking.create({
      bookingRef,
      inquiryId: inquiry.id,
      totalAmount,
      depositAmount,
      remainingAmount,
      status: "payment_pending",
      tourStartDate: inquiry.startDate,
      paymentToken,
      trackingToken,
      tokenExpiresAt,
      acceptedAt: new Date(),
    });

    // Create initial payment record for deposit
    await TourPayment.create({
      bookingId: booking.id,
      paymentType: "deposit",
      amount: depositAmount,
      paymentStatus: "pending",
    });

    // Send booking confirmation email to guest
    try {
      await sendBookingConfirmationEmail(inquiry, booking);
    } catch (emailError) {
      console.error("Warning: Email sending failed, but booking was created:", emailError);
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Inquiry accepted and booking created. Confirmation email sent to guest.",
      data: {
        inquiry,
        booking: {
          id: booking.id,
          bookingRef: booking.bookingRef,
          status: booking.status,
          totalAmount: booking.totalAmount,
          depositAmount: booking.depositAmount,
          remainingAmount: booking.remainingAmount,
          tokenExpiresAt: booking.tokenExpiresAt,
        },
      },
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
