import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoomPrice extends Model {}

RoomPrice.init({
    id: {                          
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    occupancyTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    roomTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    boardTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
},
{
    sequelize,
    modelName: "RoomPrice",
    tableName: "room_price",
    timestamps: true,
});

export default RoomPrice;