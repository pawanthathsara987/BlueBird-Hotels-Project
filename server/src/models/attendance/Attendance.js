import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Attendance extends Model {}

Attendance.init(
    {
        attendanceId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        staffId: {
            type: DataTypes.STRING(20),
            allowNull: false
        },

        attendanceDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        checkInTime: {
            type: DataTypes.DATE,
            allowNull: true
        },

        checkOutTime: {
            type: DataTypes.DATE,
            allowNull: true
        },

        workingHours: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },

        workingMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        lateMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        status: {
            type: DataTypes.ENUM(
                "Present",
                "Late",
                "Absent"
            ),
            defaultValue: "Present"
        },

        attendanceMethod: {
            type: DataTypes.ENUM(
                "QR"
            ),
            defaultValue: "QR"
        },

        remarks: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "attendance",
        modelName: "Attendance",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["staffId", "attendanceDate"]
            }
        ]
    }
);

export default Attendance;