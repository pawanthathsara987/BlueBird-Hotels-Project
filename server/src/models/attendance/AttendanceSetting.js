import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class AttendanceSetting extends Model {}

AttendanceSetting.init(
    {
        settingId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        settingKey: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        settingValue: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "attendance_settings",
        modelName: "AttendanceSetting",
        timestamps: true
    }
);

export async function seedDefaultSettings() {
    try {
        await AttendanceSetting.sync();
        const defaultSettings = [
            { settingKey: 'OFFICE_START_TIME', settingValue: '08:00', description: 'Office start time' },
            { settingKey: 'OFFICE_END_TIME', settingValue: '17:00', description: 'Office end time' },
            { settingKey: 'GRACE_PERIOD', settingValue: '10', description: 'Grace period in minutes' },
            { settingKey: 'STANDARD_WORKING_HOURS', settingValue: '8', description: 'Working hours' },
            { settingKey: 'QR_SCAN_COOLDOWN', settingValue: '3', description: 'Scanner cooldown' },
            { settingKey: 'AUTO_MARK_ABSENT', settingValue: 'true', description: 'Enable absent marking' },
            { settingKey: 'ATTENDANCE_ENABLED', settingValue: 'true', description: 'Enable attendance' },
            { settingKey: 'ALLOW_MANUAL_EDIT', settingValue: 'true', description: 'Allow attendance edits' },
        ];

        for (const setting of defaultSettings) {
            await AttendanceSetting.findOrCreate({
                where: { settingKey: setting.settingKey },
                defaults: setting
            });
        }
        console.log('✅ Attendance settings initialized/verified');
    } catch (err) {
        console.error('❌ Failed to seed default settings:', err);
    }
}

export default AttendanceSetting;
