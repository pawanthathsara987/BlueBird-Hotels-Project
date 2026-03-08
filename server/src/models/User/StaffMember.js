import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class StaffMember extends Model { }

StaffMember.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        userName: {
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
        role: {
            type: DataTypes.ENUM('staff_member', 'receptionist'),
            allowNull: false,
            defaultValue: 'receptionist'
        },
        phoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'StaffMember',
        tableName: 'staff_members',
        timestamps: true
    }
);

export default StaffMember;