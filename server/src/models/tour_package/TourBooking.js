import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourBooking extends Model {}

TourBooking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    bookingRef: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      // e.g. TB-2026-0001
    },
    inquiryId: {
      type: DataTypes.UUID,
      allowNull: false,
      // Link to TourInquiry
    },
    // Pricing (calculated when created from accepted inquiry)
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // 50% of totalAmount
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // 50% of totalAmount
    },
    // Status
    status: {
      type: DataTypes.ENUM(
        "payment_pending",
        "half_paid",
        "completed",
        "cancelled"
      ),
      defaultValue: "payment_pending",
      allowNull: false,
    },
    // Refund
    refundStatus: {
      type: DataTypes.ENUM(
        "not_applicable",
        "pending",
        "not_eligible",
        "approved",
        "processed"
      ),
      defaultValue: "not_applicable",
      allowNull: false,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Secure Tokens (for email links)
    paymentToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trackingToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Manager
    managerNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TourBooking",
    tableName: "tour_bookings",
    timestamps: true,
  }
);

export default TourBooking;