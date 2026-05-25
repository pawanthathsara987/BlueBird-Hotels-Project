import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class VehicleServiceLog extends Model {}

VehicleServiceLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicles', key: 'id' },
    },
    serviceType: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    performedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    performedBy: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    nextServiceDue: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    receiptUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VehicleServiceLog',
    tableName: 'vehicle_service_logs',
    timestamps: true,
  }
);

export default VehicleServiceLog;
