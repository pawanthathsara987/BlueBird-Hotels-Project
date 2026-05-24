import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Room extends Model {}

Room.init({
    id: {                          
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    occupancy_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    room_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("available", "occupied", "maintenance"),
        allowNull: true,
        defaultValue: "available",
    },
    kids_allow: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    kids: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: "Room",
    tableName: "room",
    timestamps: true,
});

export default Room;