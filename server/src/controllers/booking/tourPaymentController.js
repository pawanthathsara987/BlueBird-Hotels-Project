import { TourPayment, TourBooking } from "../../models/index.js";
import { Op, fn, col } from "sequelize";

// Create payment record
export const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      paymentMethod,
      paymentType = "deposit",
    } = req.body;

    // Validate booking exists
    const booking = await TourBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate payment amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    const payment = await TourPayment.create({
      bookingId,
      paymentType,
      amount,
      paymentMethod: paymentMethod || null,
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Payment record created",
      data: payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await TourPayment.findByPk(id, {
      include: [
        {
          model: TourBooking,
          attributes: ["id", "bookingRef", "totalAmount", "depositAmount"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// Get payments by booking ID
export const getPaymentsByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await TourBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payments = await TourPayment.findAll({
      where: { bookingId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Verify deposit payment (50% advance)
export const verifyDepositPayment = async (req, res) => {
  try {
    const { bookingId, transactionId, paymentMethod } = req.body;

    if (!bookingId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and transactionId are required",
      });
    }

    const booking = await TourBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Find pending deposit payment
    const depositPayment = await TourPayment.findOne({
      where: {
        bookingId,
        paymentType: "deposit",
        paymentStatus: "pending",
      },
    });

    if (!depositPayment) {
      return res.status(404).json({
        success: false,
        message: "No pending deposit payment found",
      });
    }

    // Update payment record
    await depositPayment.update({
      paymentStatus: "success",
      paymentMethod: paymentMethod || "card",
      paidAt: new Date(),
    });

    // Update booking status to half_paid
    await booking.update({
      status: "half_paid",
    });

    // Create final payment (remaining 50%)
    const finalPayment = await TourPayment.create({
      bookingId,
      paymentType: "final",
      amount: booking.remainingAmount,
      paymentStatus: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Deposit payment verified successfully",
      data: {
        depositPayment,
        booking,
        finalPayment,
        nextPaymentDue: booking.remainingAmount,
      },
    });
  } catch (error) {
    console.error("Error verifying deposit payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying deposit payment",
      error: error.message,
    });
  }
};

// Verify final payment (remaining 50%)
export const verifyFinalPayment = async (req, res) => {
  try {
    const { bookingId, transactionId, paymentMethod } = req.body;

    if (!bookingId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and transactionId are required",
      });
    }

    const booking = await TourBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "half_paid") {
      return res.status(400).json({
        success: false,
        message: "Deposit payment must be completed first",
      });
    }

    // Find pending final payment
    const finalPayment = await TourPayment.findOne({
      where: {
        bookingId,
        paymentType: "final",
        paymentStatus: "pending",
      },
    });

    if (!finalPayment) {
      return res.status(404).json({
        success: false,
        message: "No pending final payment found",
      });
    }

    // Update payment record
    await finalPayment.update({
      paymentStatus: "success",
      paymentMethod: paymentMethod || "card",
      paidAt: new Date(),
    });

    // Update booking status to completed
    await booking.update({
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Final payment verified successfully",
      data: {
        finalPayment,
        booking,
        message: "Booking completed! Tour confirmation will be sent to email.",
      },
    });
  } catch (error) {
    console.error("Error verifying final payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying final payment",
      error: error.message,
    });
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    const booking = await TourBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Find the failed payment
    const failedPayment = await TourPayment.findOne({
      where: {
        bookingId,
        paymentStatus: "pending",
      },
      order: [["createdAt", "DESC"]],
    });

    if (failedPayment) {
      await failedPayment.update({
        paymentStatus: "failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
      data: {
        bookingId,
        reason: reason || "Payment failed",
        canRetry: true,
      },
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment failure",
      error: error.message,
    });
  }
};

// Get all payments (admin/manager)
export const getAllPayments = async (req, res) => {
  try {
    const { status, paymentType, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.paymentStatus = status;
    if (paymentType) where.paymentType = paymentType;

    const offset = (page - 1) * limit;

    const payments = await TourPayment.findAndCountAll({
      where,
      include: [
        {
          model: TourBooking,
          attributes: ["id", "bookingRef", "totalAmount", "status"],
        },
      ],
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments.rows,
      pagination: {
        total: payments.count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(payments.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const stats = {
      totalTransactions: await TourPayment.count(),
      successful: await TourPayment.count({
        where: { paymentStatus: "success" },
      }),
      pending: await TourPayment.count({
        where: { paymentStatus: "pending" },
      }),
      failed: await TourPayment.count({
        where: { paymentStatus: "failed" },
      }),
    };

    // Calculate total collected
    const successfulPayments = await TourPayment.findAll({
      where: { paymentStatus: "success" },
      attributes: ["amount"],
      raw: true,
    });

    const totalCollected = successfulPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    stats.totalCollected = totalCollected;

    // Payment method breakdown
    const byMethod = await TourPayment.findAll({
      where: { paymentStatus: "success" },
      attributes: [
        "paymentMethod",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("amount")), "total"],
      ],
      group: ["paymentMethod"],
      raw: true,
    });

    stats.byPaymentMethod = byMethod;

    res.status(200).json({
      success: true,
      message: "Payment statistics retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment stats",
      error: error.message,
    });
  }
};
