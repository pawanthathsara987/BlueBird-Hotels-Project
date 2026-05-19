import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class BookedRoom extends Model {}

BookedRoom.init(
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
                model: 'booking',
                key: 'id'
            }
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'room',
                key: 'id'
            }
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
            type: DataTypes.ENUM("reserved", "checked_in", "checked_out", "cancelled", "hold"),
            defaultValue: "reserved",
            allowNull: false,
        },
        adults: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        kids: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "BookedRoom",
        tableName: "booked_rooms",
        timestamps: true,
    }
);

export default BookedRoom;