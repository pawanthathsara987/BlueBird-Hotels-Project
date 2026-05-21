// models/driver/driverModel.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Driver extends Model {}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Identity ─────────────────────────────────
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    nicNo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── License ──────────────────────────────────
    licenseNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    licenseClass: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    licenseExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // ── Employment ───────────────────────────────
    employmentType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contract'),
      allowNull: false,
      defaultValue: 'full_time',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
      allowNull: false,
      defaultValue: 'active',
    },
    languageSkills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],   // e.g. ["English", "Chinese", "German"]
    },
    driverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
  }
);

export default Driver; 