import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Foreign keys ──────────────────────────────
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'bookings', key: 'id' },
    },
    receivedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,               // null for online payments (PayHere)
      references: { model: 'users', key: 'id' },
    },

    // ── Payment details ───────────────────────────
    type: {
      type: DataTypes.ENUM(
        'advance',                   // deposit paid via PayHere online
        'balance',                   // remaining amount paid at hotel
        'extra',                     // any extra charge (damage etc.)
        'refund'                     // refund back to customer
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM(
        'online',                    // PayHere
        'cash',                      // at hotel
        'card',                      // at hotel
        'bank_transfer'              // at hotel
      ),
      allowNull: false,
    },

    // ── PayHere fields (advance payments only) ────
    gatewayRef: {
      type: DataTypes.STRING(100),
      allowNull: true,               // PayHere payment_id
    },
    payhereStatusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,               // raw PayHere status code
    },
    rawPayload: {
      type: DataTypes.JSON,
      allowNull: true,               // full PayHere webhook payload
    },

    // ── Manual payment (balance/extra) ───────────
    receiptNo: {
      type: DataTypes.STRING(100),
      allowNull: true,               // receipt number for cash/card payments
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,               // manager notes on payment
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true,               // when payment was received
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
  }
);

export default Payment;