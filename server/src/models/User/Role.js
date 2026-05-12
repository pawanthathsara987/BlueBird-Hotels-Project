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