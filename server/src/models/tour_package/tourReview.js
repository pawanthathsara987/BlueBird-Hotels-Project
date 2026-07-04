import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourReview extends Model {}

TourReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tour_booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "tour_inquiries", key: "id" },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "customer", key: "id" },
    },
    tour_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    guide_rating: {
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
    modelName: "TourReview",
    tableName: "tour_reviews",
    timestamps: true,
  }
);

export default TourReview;
