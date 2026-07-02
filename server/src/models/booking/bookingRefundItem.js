import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class BookingRefundItem extends Model {}

BookingRefundItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        refund_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "booking_refunds",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        item_type: {
            type: DataTypes.ENUM("ROOM", "AIRPORT_PICKUP"),
            allowNull: false,
        },
        booked_room_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "booked_rooms",
                key: "id",
            },
        },
        airport_pickup_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "airport_pickup",
                key: "id",
            },
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        refund_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
    },
    {
        sequelize,
        modelName: "BookingRefundItem",
        tableName: "booking_refund_items",
        timestamps: true,
    }
);

export default BookingRefundItem;
