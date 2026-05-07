import { TourInquiry, Tour, TourBooking, TourPayment } from "../../models/index.js";
import { Op } from "sequelize";
import crypto from "crypto";
import { generateSecureToken, getTokenExpiry } from "../../utils/tokenUtils.js";
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

    // Validate tour date (minimum 2 days ahead)
    if (!validateTourDate(startDate)) {
      validationErrors.startDate = "Tour date must be at least 2 days from today";
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

    // Calculate pricing (tour.price is the full package price, not per guest)
    const tour = inquiry.Tour;
    const basePrice = Number(tour?.price || 0);
    const discount = Number(tour?.discount || 0);
    const totalAmount = discount > 0 
      ? basePrice - (basePrice * discount / 100)
      : basePrice;
    const depositAmount = totalAmount * 0.5;
    const remainingAmount = totalAmount - depositAmount;

    // Generate booking reference
    const bookingRef = await generateUniqueReferenceCode(TourBooking, "bookingRef", "TB");

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

    res.status(200).json({
      success: true,
      message: "Inquiry accepted and booking created. You can now send the quote email to the guest.",
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
        {
          model: TourBooking,
          attributes: [
            "id",
            "bookingRef",
            "status",
            "totalAmount",
            "depositAmount",
            "remainingAmount",
          ],
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

    if (!inquiry.TourBooking) {
      return res.status(400).json({
        success: false,
        message: "Booking does not exist for this inquiry",
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

    const basePricePerGuest = getBasePricePerGuest(inquiry.Tour);
    const basePrice = (() => {
      const bp = Number(inquiry.Tour?.price || 0);
      const disc = Number(inquiry.Tour?.discount || 0);
      return disc > 0 ? bp - (bp * disc / 100) : bp;
    })();
    const selectedTotalPrice =
      pricePerGuest !== undefined ? Number(pricePerGuest) : basePrice;

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

    if (numberOfAdults !== undefined || numberOfChildren !== undefined || tourStartDate) {
      await inquiry.update({
        numberOfAdults: adults,
        numberOfChildren: children,
        startDate: tourDate,
      });
    }

    await inquiry.TourBooking.update({
      totalAmount,
      depositAmount,
      remainingAmount,
      tourStartDate: tourDate,
    });

    const depositPayment = await TourPayment.findOne({
      where: {
        bookingId: inquiry.TourBooking.id,
        paymentType: "deposit",
        paymentStatus: "pending",
      },
      order: [["createdAt", "DESC"]],
    });

    if (depositPayment) {
      await depositPayment.update({ amount: depositAmount });
    }

    const tourBasePrice = (() => {
      const bp = Number(inquiry.Tour?.price || 0);
      const disc = Number(inquiry.Tour?.discount || 0);
      return disc > 0 ? bp - (bp * disc / 100) : bp;
    })();

    await sendAcceptedInquiryQuoteEmail(
      inquiry,
      inquiry.TourBooking,
      {
        packageName: inquiry.Tour?.packageName,
        tourBasePrice,
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
        bookingId: inquiry.TourBooking.id,
        bookingRef: inquiry.TourBooking.bookingRef,
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
