import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class ShopItem extends Model { }

ShopItem.init(
    {
        itemId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('Clothes', 'Accessories', 'Other'),
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        availableQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize,
        modelName: 'ShopItem',
        tableName: 'shop_items',
        timestamps: true
    }
);

export default ShopItem;