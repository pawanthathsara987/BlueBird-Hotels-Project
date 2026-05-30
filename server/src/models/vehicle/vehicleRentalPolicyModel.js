import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class VehicleRentalPolicy extends Model {}

VehicleRentalPolicy.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      defaultValue: 1,
    },
    depositNonRefundable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sameConditionRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sameFuelLevelRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    thirdPartyLendingAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lateReturnGraceHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    lateReturnFeePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 4.0,
    },
    lateReturnFullDayAfterHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    cleaningFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 12.0,
    },
    damageLiabilityCap: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1000.0,
    },
    includedKilometersPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    extraMileageFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 120.0,
    },
    extraMileageCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'LKR',
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VehicleRentalPolicy',
    tableName: 'vehicle_rental_policies',
    timestamps: true,
  }
);

export default VehicleRentalPolicy;