import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoomBook extends Model {}

RoomBook.init(
    {
        booking_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        guest_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        checkIn: {                          
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        checkOut: {                         
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("reserved", "checked_in", "checked_out", "cancelled"),
            defaultValue: "reserved",
            allowNull: false,   
        },
        actualAdults: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        actualKids: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "RoomBook",
        tableName: "booking_room",
        timestamps: true,
    }
);

export default RoomBook;