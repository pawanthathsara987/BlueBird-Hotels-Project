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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    overview: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    inclusion: {
        type: DataTypes.JSON,
        allowNull: true
    },
    exclusion: {
        type: DataTypes.JSON,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
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
    terms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: true
    }
}, 
    {
        sequelize,
        modelName: "Tour",
        tableName: "tours",
        timestamps: true,
    }
);

export default Tour;
