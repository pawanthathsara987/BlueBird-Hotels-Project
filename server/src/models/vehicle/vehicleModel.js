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

    plateNumber: {                          // ← ADD (unique, needed for bookings)
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    brand: {                                
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vehicleType: {                          
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {                                
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {                                 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    capacity: {                             
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
    color: {                               
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    pricePerDay: {                          
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {                             
      type: DataTypes.ENUM('available', 'unavailable', 'maintenance', 'retired'),
      allowNull: false,
      defaultValue: 'available',
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    features: {// ← ADD (["AC","GPS","WiFi"])
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