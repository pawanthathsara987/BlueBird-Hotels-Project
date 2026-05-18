import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class VehicleType extends Model {}

VehicleType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,             // e.g. "Sedan", "Van", "SUV"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'VehicleType',
    tableName: 'vehicle_types',
    timestamps: true,
  }
);

export default VehicleType;