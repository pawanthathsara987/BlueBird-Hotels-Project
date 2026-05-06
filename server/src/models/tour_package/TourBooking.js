import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourBooking extends Model {}

TourBooking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bookingRef: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    inquiryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Snapshot from inquiry — for date rule checks
    tourStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Pricing
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    // Tokens
    paymentToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trackingToken: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentLinkSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Managerial actions  
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Cancellation
    cancelledAt: {
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