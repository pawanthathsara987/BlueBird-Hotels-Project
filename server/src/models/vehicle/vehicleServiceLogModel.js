import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class VehicleServiceLog extends Model {}

VehicleServiceLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── FK ─────────────────────────────────────────
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicles', key: 'id' },
    },

    // ── Service details ────────────────────────────
    serviceType: {
      type: DataTypes.ENUM(
        'oil_change',
        'tire',
        'brake',
        'engine',
        'body_repair',
        'general_service',
        'insurance_renewal',
        'license_renewal',
        'wash_detail',
        'other'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    servicedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mileageAtService: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // ── Cost ───────────────────────────────────────
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },

    // ── Vendor / mechanic ──────────────────────────
    vendor: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    performedBy: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // ── Next service ───────────────────────────────
    nextServiceDue: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextServiceMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // ── Notes ──────────────────────────────────────
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── Attachments ────────────────────────────────
    receiptUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VehicleServiceLog',
    tableName: 'vehicle_service_logs',
    underscored: true,
    timestamps: true,
  }
);

export default VehicleServiceLog;
