import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoomReview extends Model {}

RoomReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "booking", key: "id" },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "customer", key: "id" },
    },
    hotel_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RoomReview",
    tableName: "room_reviews",
    timestamps: true,
  }
);

export default RoomReview;