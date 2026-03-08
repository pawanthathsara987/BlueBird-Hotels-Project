import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database';

class SystemUser extends Model {}

SystemUser.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        user_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
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
        role: {
            type: DataTypes.ENUM('admin', 'receptionist'),
            allowNull: false,
            defaultValue: 'receptionist'
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'SystemUser',
        tableName: 'system_users',
        timestamps: true
    }
);

export default SystemUser;