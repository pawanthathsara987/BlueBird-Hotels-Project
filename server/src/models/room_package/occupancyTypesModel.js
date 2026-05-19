import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database.js';

class OccupancyType extends Model {}

OccupancyType.init({
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
}, {
    sequelize,
    modelName: "OccupancyType",
    tableName: "occupancy_type",
    timestamps: true,
});

export default OccupancyType;