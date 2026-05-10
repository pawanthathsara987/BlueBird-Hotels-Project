// models/Vehicle.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Vehicle extends Model {}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Identity ─────────────────────────────────────────
    plateNumber: {                          // ← ADD (unique, needed for bookings)
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    brand: {                                // ← ADD (e.g. "Toyota", "Nissan")
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vehicleType: {                          // ✓ keep
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {                                // ✓ keep
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {                                 // ← ADD
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // ── Specs ─────────────────────────────────────────────
    capacity: {                             // ✓ keep
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fuelType: {                             // ← ADD (petrol/diesel/electric/hybrid)
      type: DataTypes.ENUM('petrol', 'diesel', 'electric', 'hybrid'),
      allowNull: true,
    },
    transmission: {                         // ← ADD (auto/manual)
      type: DataTypes.ENUM('automatic', 'manual'),
      allowNull: true,
    },
    color: {                                // ← ADD
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // ── Pricing ───────────────────────────────────────────
    pricePerDay: {                          // ✓ keep
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // ── Status ────────────────────────────────────────────
    status: {                               // ← RENAME + expand ENUM
      type: DataTypes.ENUM('available', 'unavailable', 'maintenance', 'retired'),
      allowNull: false,
      defaultValue: 'available',
    },

    // ── Content ───────────────────────────────────────────
    description: {                          // ← ADD
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {                             // ✓ keep
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    features: {                             // ← ADD (e.g. ["AC","GPS","WiFi"])
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
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