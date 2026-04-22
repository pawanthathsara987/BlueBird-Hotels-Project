import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourPayment extends Model {}

TourPayment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      // Link to TourBooking
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
      type: DataTypes.ENUM("payhere", "cash", "card"),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    // PayHere reference (when using PayHere)
    payhereOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
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