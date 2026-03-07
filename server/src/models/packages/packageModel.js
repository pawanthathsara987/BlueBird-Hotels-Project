import { Model, Sequelize } from "sequelize";
import database from "../../config/database";

class RoomPackage extends Model {}

RoomPackage.init({
    pid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    pname: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    pprice: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },

    pimage: {
        type: Sequelize.STRING,
        allowNull: true,
    }
},
{
    sequelize: database,
    modelName: RoomPackage,
    tableName: "room_package",
    timestamps: true,
});

export default RoomPackage;