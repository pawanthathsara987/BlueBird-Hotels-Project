import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class VehicleChecklist extends Model {}

VehicleChecklist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── FK ─────────────────────────────────────────
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicle_booking', key: 'id' },
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicles', key: 'id' },
    },

    // ── Inspection Details ─────────────────────────
    type: {
      type: DataTypes.ENUM('pickup', 'return'),
      allowNull: false,
    },
    inspectedBy: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    inspectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // ── Condition Fields (ok, damaged, missing, na)
    exteriorBody: { type: DataTypes.ENUM('ok', 'damaged', 'na'), defaultValue: 'ok' },
    tires: { type: DataTypes.ENUM('ok', 'damaged', 'missing', 'na'), defaultValue: 'ok' },
    windshield: { type: DataTypes.ENUM('ok', 'damaged', 'na'), defaultValue: 'ok' },
    lights: { type: DataTypes.ENUM('ok', 'damaged', 'missing', 'na'), defaultValue: 'ok' },
    mirrors: { type: DataTypes.ENUM('ok', 'damaged', 'missing', 'na'), defaultValue: 'ok' },
    interior: { type: DataTypes.ENUM('ok', 'damaged', 'na'), defaultValue: 'ok' },
    ac: { type: DataTypes.ENUM('ok', 'damaged', 'na'), defaultValue: 'ok' },

    // ── Stats ──────────────────────────────────────
    fuelLevel: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Full',
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ── Notes & Sign-off ───────────────────────────
    damageNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customerSignature: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // In a real app this would store a signature image URL, using boolean for simplicity
    },
  },
  {
    sequelize,
    modelName: 'VehicleChecklist',
    tableName: 'vehicle_checklists',
    underscored: true,
    timestamps: true,
  }
);

export default VehicleChecklist;
