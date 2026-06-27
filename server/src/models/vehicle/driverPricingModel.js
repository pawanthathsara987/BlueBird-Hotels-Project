import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class DriverPricingSetting extends Model {}

DriverPricingSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      defaultValue: 1,
    },
    driverPricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'DriverPricingSetting',
    tableName: 'driver_pricing_settings',
    timestamps: true,
  }
);

export default DriverPricingSetting;
