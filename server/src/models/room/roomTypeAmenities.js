import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";

class RoomTypeAmenities extends Model {}

RoomTypeAmenities.init(
{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    roomTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "room_type_id",
    },
    amenityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "amenity_id",
    }
},
{
    sequelize,
    tableName: "room_type_amenities",
    timestamps: false,
}
);

export default RoomTypeAmenities;
