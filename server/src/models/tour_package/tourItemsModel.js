// models/TourItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TourItem = sequelize.define('TourItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'tour_items',
  timestamps: true,
});

module.exports = TourItem;