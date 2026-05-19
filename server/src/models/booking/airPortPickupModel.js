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
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "customer",
                key: "id",
            },
        },
        pickup_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pickup_time: {
            type: DataTypes.TIME,
            allowNull: false,
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