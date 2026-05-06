import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourInquiry extends Model {}

TourInquiry.init(
      {
        id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    inquiryRef: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      // e.g. TI-2026-0001
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Guest Details (from form)
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfAdults: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    numberOfChildren: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Status
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  },
  {
    sequelize,
    modelName: "TourInquiry",
    tableName: "tour_inquiries",
    timestamps: true,
  }
);

export default TourInquiry;