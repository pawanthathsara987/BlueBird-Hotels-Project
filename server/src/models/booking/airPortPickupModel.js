import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class AirPortPickup extends Model {}

AirPortPickup.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "booking",
                key: "id",
            },
        },
        pickup_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        pickup_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        passenger_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        pickup_location: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Katunayake Airport",
        },
        status: {
            type: DataTypes.ENUM("CONFIRMED", "COMPLETED", "CANCELLED"),
            allowNull: false,
            defaultValue: "CONFIRMED",
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
    },
    {
        sequelize,
        modelName: "AirPortPickup",
        tableName: "airport_pickup",
        timestamps: true,
    }
);

export default AirPortPickup;