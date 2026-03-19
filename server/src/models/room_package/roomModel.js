import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Room extends Model {}

Room.init({
    id: {                          // ← renamed from rid
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    packageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    roomNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    roomStatus: {
        type: DataTypes.ENUM("available", "occupied", "maintenance"),
        allowNull: false,
        defaultValue: "available",
    },
}, {
    sequelize,
    modelName: "Room",
    tableName: "room",
    timestamps: true,
});

export default Room;