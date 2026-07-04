import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class TourPayment extends Model {}

TourPayment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        inquiry_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tour_inquiries",
                key: "id",
            }
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        modelName: "TourPayment",
        tableName: "tour_payments",
        timestamps: true,
    }
);

export default TourPayment;
