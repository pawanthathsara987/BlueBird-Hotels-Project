import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourPayment extends Model {}

TourPayment.init(
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
    // deposit = 50% upfront | final = remaining 50%
    paymentType: {
      type: DataTypes.ENUM("deposit", "final"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "online"),
      allowNull: true,
      // online → placeholder until gateway decided
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TourPayment",
    tableName: "tour_payments",
    timestamps: true,
  }
);

export default TourPayment;