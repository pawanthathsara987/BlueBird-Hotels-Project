import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class BoardType extends Model {}

BoardType.init({
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
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tagline: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: "BoardType",
    tableName: "board_type",
    timestamps: true,
});

export default BoardType;