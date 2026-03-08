import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoomPackage extends Model {}

RoomPackage.init(
    {
        id: {                          // ← renamed from pid
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        pname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pprice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pimage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        maxAdults: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
        },
        maxKids: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, 
    {
        sequelize,
        modelName: "RoomPackage",
        tableName: "room_package",
        timestamps: true,
    }
);

export default RoomPackage;