import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Booking extends Model {

  // ── Computed helpers ──────────────────────────
  get isFullyPaid() {
    return this.balancePaidAt !== null;
  }

  get remainingBalance() {
    if (this.balancePaidAt) return 0;
    return parseFloat(this.balanceAmount);
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    // ── Reference ─────────────────────────────────
    bookingNo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,             // e.g. BK-20240118-4F2A
    },

    // ── Foreign keys ──────────────────────────────
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicles', key: 'id' },
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,          // set by Manager after booking confirmed
      references: { model: 'drivers', key: 'id' },
    },

    // ── Hire details ──────────────────────────────
    hireType: {
      type: DataTypes.ENUM('with_driver', 'without_driver'),
      allowNull: false,
    },
    pickupDatetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDatetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    numDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dropoffLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── Customer license (without_driver only) ────
    customerLicenseNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    customerLicenseExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // ── Pricing snapshot ──────────────────────────
    // Locked at booking time — never read live from
    // vehicle so future price changes don't affect
    // existing bookings
    vehicleRatePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    driverRatePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,          // null for without_driver
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,         // (vehicleRate + driverRate) × numDays
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalPayable: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,         // subtotal - discount
    },

    // ── Deposit (PayHere online) ───────────────────
    depositPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,         // locked at booking time
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,         // totalPayable × depositPercentage / 100
    },
    depositPaidAt: {
      type: DataTypes.DATE,
      allowNull: true,          // set when PayHere webhook confirms
    },

    // ── Balance (collected at hotel) ───────────────
    balanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,         // totalPayable - depositAmount
    },
    balancePaidAt: {
      type: DataTypes.DATE,
      allowNull: true,          // set when Manager marks paid
    },
    balancePaymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer'),
      allowNull: true,
    },
    balanceCollectedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,          // Manager who collected — FK → users.id
      references: { model: 'users', key: 'id' },
    },

    // ── Booking status ────────────────────────────
    status: {
      type: DataTypes.ENUM(
        'pending_payment',      // booking created, awaiting PayHere deposit
        'confirmed',            // deposit paid via PayHere
        'payment_failed',       // PayHere payment declined
        'driver_assigned',      // Manager assigned driver (with_driver only)
        'balance_paid',         // Manager recorded balance at hotel
        'ongoing',              // vehicle handed over to customer
        'completed',            // vehicle returned
        'cancelled',            // cancelled by customer or Manager
        'expired'               // booking not paid within time limit
      ),
      allowNull: false,
      defaultValue: 'pending_payment',
    },

    // ── PayHere fields ────────────────────────────
    payhereOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,             // one PayHere order per booking
    },
    payherePaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,          // PayHere transaction reference
    },
    payhereStatusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,          // raw PayHere status code for audit
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,          // VISA / MASTERCARD / eZCash etc.
    },

    // ── Cancellation ──────────────────────────────
    cancelledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,          // FK → users.id (customer or Manager)
      references: { model: 'users', key: 'id' },
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── Extra ─────────────────────────────────────
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
  }
);

export default Booking;