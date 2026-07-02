import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class LeaveType extends Model {}

LeaveType.init(
    {
        leaveTypeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        tableName: "leave_types",
        modelName: "LeaveType",
        timestamps: true
    }
);

export default LeaveType;
