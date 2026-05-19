import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class SeasonalDiscount extends Model {}

SeasonalDiscount.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: "SeasonalDiscount",
    tableName: "seasonal_discount",
    timestamps: true,
});

export default SeasonalDiscount;