import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Tour extends Model {}

Tour.init(
  {
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
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    termsConditions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    itinerary: {
        type: DataTypes.JSON,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
        groupSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Tour",
        tableName: "tours",
        timestamps: true,
    }
);

export default Tour;
