import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class ServiceLog extends Model { }

ServiceLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Foreign keys ──────────────────────────────
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicles', key: 'id' },
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,              // Manager who logged the service
      references: { model: 'staff_members', key: 'userId' },
    },

    // ── Service details ───────────────────────────
    serviceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mileageKm: {
      type: DataTypes.INTEGER,
      allowNull: false,              // odometer at time of service
    },
    serviceType: {
      type: DataTypes.ENUM(
        'routine',                   // regular scheduled service
        'repair',                    // mechanical repair
        'tyre',                      // tyre change/rotation
        'battery',                   // battery replacement
        'accident',                  // accident repair
        'other'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,              // what was done
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    garage: {
      type: DataTypes.STRING(200),
      allowNull: true,               // name of workshop/garage
    },

    // ── Next service reminder ─────────────────────
    nextDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,               // next service date — triggers alert
    },
    nextDueMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,               // next service mileage — triggers alert
    },

    // ── Attachments ───────────────────────────────
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],              // invoice/receipt URLs from Supabase
    },
  },
  {
    sequelize,
    modelName: 'ServiceLog',
    tableName: 'service_logs',
    timestamps: true,
  }
);

export default ServiceLog;