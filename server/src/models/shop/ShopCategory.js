import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class ShopCategory extends Model {}

ShopCategory.init(
  {
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'ShopCategory',
    tableName: 'shop_categories',
    timestamps: true
  }
);

export default ShopCategory;
