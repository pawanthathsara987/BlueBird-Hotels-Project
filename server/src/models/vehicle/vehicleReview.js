import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class VehicleReview extends Model {}

VehicleReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    vehicle_booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "vehicle_booking", key: "id" },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "customer", key: "id" },
    },
    vehicle_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    driver_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VehicleReview",
    tableName: "vehicle_reviews",
    timestamps: true,
  }
);

export default VehicleReview;
