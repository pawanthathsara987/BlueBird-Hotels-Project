import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class BookingRefund extends Model {}

BookingRefund.init(
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
            references: {
                model: "booking",
                key: "id",
            },
        },
        refund_no: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "Card Reversal",
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "COMPLETED"),
            allowNull: false,
            defaultValue: "PENDING",
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        transaction_ref: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        request_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        approval_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        refund_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        processed_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "staff_members",
                key: "userId",
            },
        },
        original_booking_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        paid_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        cancelled_room_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        cancellation_charge: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        remaining_payable_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        remaining_value: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        final_booking_value: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        payment_status: {
            type: DataTypes.ENUM("FULLY_PAID", "PARTIALLY_PAID", "REFUND_PENDING", "REFUNDED", "PAY_AT_CHECKIN"),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "BookingRefund",
        tableName: "booking_refunds",
        timestamps: true,
    }
);

export default BookingRefund;
