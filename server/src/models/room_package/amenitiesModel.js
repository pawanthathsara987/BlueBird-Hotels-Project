import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";

class Amenities extends Model {}

Amenities.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

    },
    {
        sequelize,
        tableName: "amenities",
        timestamps: false,
    }
);

export default Amenities;