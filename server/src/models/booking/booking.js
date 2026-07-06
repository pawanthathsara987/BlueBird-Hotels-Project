import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Booking extends Model {}

Booking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "customer",
                key: "id",
            }
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
            defaultValue: "pending",
            allowNull: false,
        },
        kids_age: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tax_percentage: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        tax: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        payment_status: {
            type: DataTypes.ENUM("FULLY_PAID", "PARTIALLY_PAID", "REFUND_PENDING", "REFUNDED", "PAY_AT_CHECKIN"),
            allowNull: false,
            defaultValue: "PARTIALLY_PAID",
        }
    },
    {
        sequelize,
        modelName: "Booking",
        tableName: "booking",
        timestamps: true,
    }
);

export default Booking;