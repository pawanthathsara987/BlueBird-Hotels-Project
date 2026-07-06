import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class CustomerWallet extends Model {}

CustomerWallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'customer',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    sequelize,
    modelName: 'CustomerWallet',
    tableName: 'customer_wallets',
    timestamps: true,
  }
);

export default CustomerWallet;
