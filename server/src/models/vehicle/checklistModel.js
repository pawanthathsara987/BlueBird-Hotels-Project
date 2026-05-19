import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Checklist extends Model {}

Checklist.init(
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
    doneBy: {
      type: DataTypes.INTEGER,
      allowNull: false,              // Manager who completed the checklist
      references: { model: 'users', key: 'id' },
    },

    // ── Checklist type ────────────────────────────
    type: {
      type: DataTypes.ENUM('pickup', 'return'),
      allowNull: false,
      // pickup → filled when vehicle handed to customer
      // return → filled when vehicle comes back
    },

    // ── Vehicle condition ─────────────────────────
    conditionKm: {
      type: DataTypes.INTEGER,
      allowNull: false,              // odometer reading at pickup/return
    },
    fuelLevel: {
      type: DataTypes.ENUM(
        'empty',
        'quarter',
        'half',
        'three_quarter',
        'full'
      ),
      allowNull: false,
    },
    damages: {
      type: DataTypes.TEXT,
      allowNull: true,               // description of any visible damages
    },

    // ── Evidence ──────────────────────────────────
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],              // array of Supabase image URLs
    },
    accessories: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // e.g. ["spare_tyre", "jack", "first_aid_kit", "fire_extinguisher"]
    },

    // ── Sign off ──────────────────────────────────
    signedByCustomer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    signedByStaff: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    doneAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Checklist',
    tableName: 'checklists',
    timestamps: true,
  }
);

export default Checklist;