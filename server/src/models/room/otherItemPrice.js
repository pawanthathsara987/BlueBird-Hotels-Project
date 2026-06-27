import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class OtherItemPrice extends Model { }

OtherItemPrice.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }   
}, {
    sequelize,
    modelName: "OtherItemPrice",
    tableName: 'other_item_prices',
    timestamps: true
});

export default OtherItemPrice;