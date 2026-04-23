import { TourBooking, TourPayment, TourInquiry, Tour , TourRefund } from "../../models/index.js";
import { Op } from "sequelize";

const REFUND_POLICY_DAYS = 4;

const calculateRefundEligibility = (tourStartDate, refundablePaidAmount) => {
  const tourDate = new Date(tourStartDate);
  const currentDate = new Date();
  const hoursDiff = (tourDate - currentDate) / (1000 * 60 * 60);
  const daysDiff = hoursDiff / 24;
  const dateEligible = daysDiff >= REFUND_POLICY_DAYS;
  const hasRefundablePayment = Number(refundablePaidAmount || 0) > 0;
  const isEligible = dateEligible && hasRefundablePayment;

  return {
    isEligible,
    dateEligible,
    hasRefundablePayment,
    refundStatus: isEligible ? "approved" : "not_eligible",
    refundAmount: isEligible ? Number(refundablePaidAmount || 0) : 0,
    hoursBeforeTour: Math.max(0, Math.floor(hoursDiff)),
    daysBeforeTour: Math.max(0, Math.floor(daysDiff)),
  };
};

const persistCancellation = async (booking, { reason = null } = {}) => {
  const successfulDepositPayments = await TourPayment.findAll({
    where: {
      bookingId: booking.id,
      paymentType: "deposit",
      paymentStatus: "success",
    },
    attributes: ["amount"],
    raw: true,
  });

  const refundablePaidAmount = successfulDepositPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const eligibility = calculateRefundEligibility(booking.tourStartDate, refundablePaidAmount);

  await booking.update({
    status: "cancelled",
    refundStatus: eligibility.refundStatus,
    refundAmount: eligibility.refundAmount,
    cancelledAt: new Date(),
    paymentToken: null,
    trackingToken: null,
  });

  await TourRefund.create({
    bookingId: booking.id,
    isEligible: eligibility.isEligible,
    daysBeforeTour: eligibility.daysBeforeTour,
    refundAmount: eligibility.refundAmount,
    status: eligibility.isEligible ? "pending" : "not_eligible",
    clientReason: reason || null,
    requestedAt: new Date(),
  });

  return eligibility;
};

// Get all bookings (for manager/admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const bookings = await TourBooking.findAndCountAll({
      where,
      include: [
        {
          model: TourInquiry,
          attributes: [
            "fullName",
            "email",
            "phone",
            "numberOfAdults",
            "numberOfChildren",
            "startDate",
          ],
          include: [
            {
              model: Tour,
              attributes: ["id", "packageName"],
            },
          ],
        },
        {
          model: TourPayment,
          attributes: ["id", "paymentType", "amount", "paymentStatus", "paidAt"],
        },
      ],
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings.rows,
      pagination: {
        total: bookings.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(bookings.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await TourBooking.findByPk(id, {
      include: [
        {
          model: TourInquiry,
          include: [
            {
              model: Tour,
              attributes: [
                "id",
                "packageName",
                "price",
                "discount",
                "overview",
                "termsConditions",
              ],
            },
          ],
        },
        {
          model: TourPayment,
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Get booking by reference
export const getBookingByRef = async (req, res) => {
  try {
    const { bookingRef } = req.params;

    const booking = await TourBooking.findOne({
      where: { bookingRef },
      include: [
        {
          model: TourInquiry,
          include: [
            {
              model: Tour,
              attributes: [
                "id",
                "packageName",
                "price",
                "discount",
                "overview",
              ],
            },
          ],
        },
        {
          model: TourPayment,
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};


// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await TourBooking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    const eligibility = await persistCancellation(booking, { reason });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
        refundEligible: eligibility.isEligible,
        dateEligible: eligibility.dateEligible,
        refundablePaymentFound: eligibility.hasRefundablePayment,
        refundAmount: eligibility.refundAmount,
        refundPolicyDays: REFUND_POLICY_DAYS,
        hoursBeforeTour: eligibility.hoursBeforeTour,
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Validate guest cancellation token
export const validateCancelToken = async (req, res) => {
  try {
    const { bookingId, token } = req.query;

    if (!bookingId || !token) {
      return res.status(400).json({
        success: false,
        message: "bookingId and token are required",
      });
    }

    const booking = await TourBooking.findByPk(bookingId, {
      include: [{
        model: TourInquiry,
        include: [{ model: Tour, attributes: ["id", "packageName"] }],
      }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled" });
    }

    if (!booking.paymentToken || booking.paymentToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid cancellation token" });
    }

    if (!booking.tokenExpiresAt || new Date() > new Date(booking.tokenExpiresAt)) {
      return res.status(401).json({ success: false, message: "Cancellation link has expired" });
    }

    const successfulDepositPayments = await TourPayment.findAll({
      where: {
        bookingId: booking.id,
        paymentType: "deposit",
        paymentStatus: "success",
      },
      attributes: ["amount"],
      raw: true,
    });

    const refundablePaidAmount = successfulDepositPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const eligibility = calculateRefundEligibility(booking.tourStartDate, refundablePaidAmount);

    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        guestName: booking.TourInquiry?.fullName || "Guest",
        tourName: booking.TourInquiry?.Tour?.packageName || "Tour",
        startDate: booking.tourStartDate,
        refundEligible: eligibility.isEligible,
        dateEligible: eligibility.dateEligible,
        refundablePaymentFound: eligibility.hasRefundablePayment,
        refundAmount: eligibility.refundAmount,
        refundPolicyDays: REFUND_POLICY_DAYS,
        hoursBeforeTour: eligibility.hoursBeforeTour,
      },
    });
  } catch (error) {
    console.error("Error validating cancellation token:", error);
    res.status(500).json({
      success: false,
      message: "Error validating cancellation token",
      error: error.message,
    });
  }
};

// Guest cancellation by token
export const cancelBookingByToken = async (req, res) => {
  try {
    const { bookingId, token, reason } = req.body;

    if (!bookingId || !token) {
      return res.status(400).json({
        success: false,
        message: "bookingId and token are required",
      });
    }

    const booking = await TourBooking.findByPk(bookingId, {
      include: [{
        model: TourInquiry,
        include: [{ model: Tour, attributes: ["id", "packageName"] }],
      }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled" });
    }

    if (!booking.paymentToken || booking.paymentToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid cancellation token" });
    }

    if (!booking.tokenExpiresAt || new Date() > new Date(booking.tokenExpiresAt)) {
      return res.status(401).json({ success: false, message: "Cancellation link has expired" });
    }

    const eligibility = await persistCancellation(booking, { reason });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        bookingRef: booking.bookingRef,
        refundEligible: eligibility.isEligible,
        dateEligible: eligibility.dateEligible,
        refundablePaymentFound: eligibility.hasRefundablePayment,
        refundAmount: eligibility.refundAmount,
        refundPolicyDays: REFUND_POLICY_DAYS,
        hoursBeforeTour: eligibility.hoursBeforeTour,
      },
    });
  } catch (error) {
    console.error("Error cancelling booking by token:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const stats = {
      total: await TourBooking.count(),
      payment_pending: await TourBooking.count({
        where: { status: "payment_pending" },
      }),
      half_paid: await TourBooking.count({ where: { status: "half_paid" } }),
      completed: await TourBooking.count({ where: { status: "completed" } }),
      cancelled: await TourBooking.count({ where: { status: "cancelled" } }),
    };

    // Revenue calculations
    const completedBookings = await TourBooking.findAll({
      where: { status: "completed" },
      attributes: ["totalAmount"],
      raw: true,
    });

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount),
      0
    );

    stats.totalRevenue = totalRevenue;

    res.status(200).json({
      success: true,
      message: "Booking statistics retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking stats",
      error: error.message,
    });
  }
};

// Get bookings by status
export const getBookingsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status parameter is required",
      });
    }

    const offset = (page - 1) * limit;

    const bookings = await TourBooking.findAndCountAll({
      where: { status },
      include: [TourInquiry, TourPayment],
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Bookings retrieved by status",
      data: bookings.rows,
      pagination: {
        total: bookings.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(bookings.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings by status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings by status",
      error: error.message,
    });
  }
};

// Get bookings for date range
export const getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const offset = (page - 1) * limit;

    const bookings = await TourBooking.findAndCountAll({
      where: {
        tourStartDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [TourInquiry, TourPayment],
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      success: true,
      message: "Bookings retrieved for date range",
      data: bookings.rows,
      pagination: {
        total: bookings.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(bookings.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings by date range:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings by date range",
      error: error.message,
    });
  }
};
