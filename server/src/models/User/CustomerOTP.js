import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database.js';

class CustomerOTP extends Model {}

CustomerOTP.init(
    {
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        otp: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "CustomerOTP",
        tableName: "customer_otp",
        timestamps: true
    }
);

export default CustomerOTP;