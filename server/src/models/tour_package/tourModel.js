const { DataTypes } = require("sequelize");
import sequelize from "../../config/database.js";

const Tour = sequelize.define("Tour", {
id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    },
  packageName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT
  },
  includedItems: {
    type: DataTypes.JSON 
  },
  termsConditions: {
    type: DataTypes.TEXT
  },
  mapLink: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Tour;