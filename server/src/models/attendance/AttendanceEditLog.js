import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class AttendanceEditLog extends Model {}

AttendanceEditLog.init(
    {
        editLogId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        attendanceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "attendance",
                key: "attendanceId"
            }
        },
        oldCheckIn: {
            type: DataTypes.DATE,
            allowNull: true
        },
        newCheckIn: {
            type: DataTypes.DATE,
            allowNull: true
        },
        oldCheckOut: {
            type: DataTypes.DATE,
            allowNull: true
        },
        newCheckOut: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        editedBy: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "attendance_edit_logs",
        modelName: "AttendanceEditLog",
        timestamps: true,
        createdAt: "editedAt",
        updatedAt: false
    }
);

export default AttendanceEditLog;
