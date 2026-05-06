import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database.js';

class Customer extends Model { }

Customer.init(
    {
        customerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Customer',
        tableName: 'customer',
        timestamps: true
    }
);

export default Customer;