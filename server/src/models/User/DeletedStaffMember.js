import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database.js';

class DeletedStaffMember extends Model{}

DeletedStaffMember.init(
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
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        roleName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'DeletedStaffMember',
        tableName: 'deleted_staff_members',
        timestamps: true
    }
);

export default DeletedStaffMember;