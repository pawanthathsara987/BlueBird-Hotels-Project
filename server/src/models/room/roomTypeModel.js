import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class RoomType extends Model { }

RoomType.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    occupancy_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'occupancy_type',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: "RoomType",
    tableName: "room_type",
    timestamps: true,
});

export default RoomType;
