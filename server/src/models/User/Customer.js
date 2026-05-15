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
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: true
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
            allowNull: true
        },

        googleAuth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }, 
        
        phoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        idType: {
            type: DataTypes.ENUM('NIC', 'PASSPORT'),
            allowNull: true
        },
        idNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
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