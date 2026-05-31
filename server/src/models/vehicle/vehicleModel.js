// models/Vehicle.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Vehicle extends Model {}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Identity ────────────────────────────────
    plateNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // ── Type & capacity ─────────────────────────
    vehicleTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicle_types', key: 'id' },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fuelType: {
      type: DataTypes.ENUM('petrol', 'diesel', 'electric', 'hybrid'),
      allowNull: true,
    },
    transmission: {
      type: DataTypes.ENUM('automatic', 'manual'),
      allowNull: true,
    },

    // ── Pricing ─────────────────────────────────
    pricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // ── Real World Fleet Tracking ───────────────
    currentMileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    chassisNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },


    // ── Compliance ──────────────────────────────
    // ✅ ADD: needed for Manager expiry alerts (30-day warning)
    insuranceNo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    insuranceExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    revenueLicenseExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // ── Status ──────────────────────────────────
    //    'available'   → auto-managed: vehicle is active in the fleet and ready for booking
    //    'maintenance' → Manager manually sets when vehicle is being serviced (blocked for all dates)
    //    'retired'     → soft-delete; hidden from all views
    status: {
      type: DataTypes.ENUM('available', 'maintenance', 'retired'),
      allowNull: false,
      defaultValue: 'available',
    },

    // ── Features & media ────────────────────────
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],     // e.g. ["AC", "GPS", "WiFi", "Child Seat"]
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
    timestamps: true,
  }
);

export default Vehicle;