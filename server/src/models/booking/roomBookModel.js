import { Model, Sequelize } from "sequelize";
import database from "../../config/database";
import Guest from "./roomBookGuestModel";

class RoomBook extends Model {}

RoomBook.init({
    booking_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    guest_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Guest,
            key: "id",
        },
    },

    roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Room,
            key: "id",
        },
    },

    packageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: RoomPackage,
            key: "id",
        },
    },

    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
},
{
    Sequelize: database,
    modelName: RoomBook,
    tableName: 'booking_room',
    timestamps: true,
});

export default RoomBook;