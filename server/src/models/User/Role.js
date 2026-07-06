import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/database.js';

class Role extends Model {}

Role.init(
    {
        roleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roleName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        officeStartTime: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        officeEndTime: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        gracePeriodMinutes: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        standardWorkingHours: {
            type: DataTypes.DECIMAL(4, 1),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true
    }
);

export default Role;