import { Model, Sequelize } from "sequelize";
import database from "../../config/database";

class Room extends Model {}

Room.init({
    rid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    rnumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
    },

    radults: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    rkids: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    rstatus: {
        type: Sequelize.ENUM("available", "occupied", "maintenance"),
        allowNull: false,
        defaultValue: "available",
    },
},
{
    sequelize: database,
    modelName: Room,
    tableName: "rooms",
    timestamps: true,
});

export default Room;