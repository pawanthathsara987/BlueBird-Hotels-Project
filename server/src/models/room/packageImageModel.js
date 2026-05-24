import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";

class PackageImage extends Model {}

PackageImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        packageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "PackageImage",
        tableName: "package_image",
        timestamps: true
    }
)

export default PackageImage;