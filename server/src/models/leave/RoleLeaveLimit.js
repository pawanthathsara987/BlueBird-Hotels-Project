import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class RoleLeaveLimit extends Model {}

RoleLeaveLimit.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "roles",
                key: "roleId"
            }
        },
        leaveTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "leave_types",
                key: "leaveTypeId"
            }
        },
        maxDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize,
        tableName: "role_leave_limits",
        modelName: "RoleLeaveLimit",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["roleId", "leaveTypeId"]
            }
        ]
    }
);

export default RoleLeaveLimit;
