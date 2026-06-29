import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class ServiceCharge extends Model { }

ServiceCharge.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    service_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    service_Code: {
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
    modelName: "ServiceCharge",
    tableName: 'service_charges',
    timestamps: true
});

export default ServiceCharge;
