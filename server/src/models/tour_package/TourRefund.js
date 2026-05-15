import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourRefund extends Model {}

TourRefund.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    refundRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    inquiryRef: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    daysUntilTour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    packagePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    refundPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("calculated", "requested", "approved", "rejected"),
      allowNull: false,
      defaultValue: "requested",
    },
    notes: {
      type: DataTypes.TEXT,
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
