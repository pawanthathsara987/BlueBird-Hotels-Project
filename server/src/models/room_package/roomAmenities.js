import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";

class RoomAmenities extends Model {}

RoomAmenities.init(
{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amenityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    sequelize,
    tableName: "room_amenities",
    timestamps: false,
}
);

export default RoomAmenities;