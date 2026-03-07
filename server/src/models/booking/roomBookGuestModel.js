import { Model, DataTypes } from "sequelize";
import database from "./../../config/database.js";

class Guest extends Model {}

Guest.init(
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
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pnumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    modelName: "Guest",
    tableName: "guests",
    timestamps: true,
  }
);

export default Guest;