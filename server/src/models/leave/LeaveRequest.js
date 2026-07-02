import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class LeaveRequest extends Model {}

LeaveRequest.init(
    {
        leaveId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        staffId: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        leaveTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        totalDays: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Cancelled"),
            defaultValue: "Pending"
        },
        approvedBy: {
            type: DataTypes.STRING(20), // Referencing StaffMember.staffId
            allowNull: true
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "leave_requests",
        modelName: "LeaveRequest",
        timestamps: true
    }
);

export default LeaveRequest;
