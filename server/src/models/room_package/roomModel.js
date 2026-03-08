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
    rnumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    rstatus: {
        type: DataTypes.ENUM("available", "occupied", "maintenance"),
        allowNull: false,
        defaultValue: "available",
    },
}, {
    sequelize,
    modelName: "Room",
    tableName: "rooms",
    timestamps: true,
});

export default Room;