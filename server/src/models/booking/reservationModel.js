import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Reservation extends Model {}

Reservation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        guest_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
            defaultValue: "pending",
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Reservation",
        tableName: "reservations",
        timestamps: true,
    }
);

export default Reservation;