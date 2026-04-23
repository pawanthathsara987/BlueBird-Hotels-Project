import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourItem extends Model {}

TourItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "TourItem",
    tableName: "tour_items",
    timestamps: true,
  }
);

export default TourItem;