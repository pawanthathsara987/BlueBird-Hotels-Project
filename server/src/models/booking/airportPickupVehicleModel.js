import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class AirportPickupVehicle extends Model { }

AirportPickupVehicle.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        vehicle_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        passenger_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        baggage_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "AirportPickupVehicle",
        tableName: "airport_pickup_vehicles",
        timestamps: false,
    }
);

export default AirportPickupVehicle;
