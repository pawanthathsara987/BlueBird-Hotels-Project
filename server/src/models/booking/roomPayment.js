import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoomPayment extends Model {}

RoomPayment.init(
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
            }
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "customer",
                key: "id",
            }
        },
        payment_no: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "LKR",
        },
        method: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "online",
        },
        status: {
            type: DataTypes.ENUM("pending", "success", "failed"),
            allowNull: false,
            defaultValue: "pending",
        },
        raw_payload: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: "RoomPayment",
        tableName: "room_payment",
        timestamps: true,
    }
);

export default RoomPayment;
