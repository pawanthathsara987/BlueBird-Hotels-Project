import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourRefund extends Model {}

TourRefund.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ── Eligibility ──
    isEligible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // true  → cancelled 4+ days before tour
      // false → cancelled < 4 days before tour
    },
    daysBeforeTour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // how many days before tour client cancelled
    },

    // ── Amount ──
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      // filled only if isEligible = true
      // = depositAmount (50% of total)
    },

    // ── Status ──
    status: {
      type: DataTypes.ENUM(
        "requested",    // client requested via tracking link
        "not_eligible", // < 4 days before tour → auto set
        "pending",      // eligible, waiting manager action
        "approved",     // manager approved
        "processed",    // refund sent to client
        "rejected"      // manager rejected
      ),
      defaultValue: "requested",
      allowNull: false,
    },

    // ── Client ──
    clientReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      // optional reason from client
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // ── Manager ──
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // who approved/rejected
    },
    managerNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TourRefund",
    tableName: "tour_refunds",
    timestamps: true,
  }
);

export default TourRefund;