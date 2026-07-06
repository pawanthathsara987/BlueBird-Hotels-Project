import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class WalletTransaction extends Model {}

WalletTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer_wallets',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.STRING(50),
      allowNull: true, // e.g. Refund reference, Booking ID
    },
  },
  {
    sequelize,
    modelName: 'WalletTransaction',
    tableName: 'wallet_transactions',
    timestamps: true,
  }
);

export default WalletTransaction;
