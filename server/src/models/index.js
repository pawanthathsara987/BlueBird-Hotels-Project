import Guest from "./booking/roomBookGuestModel.js";
import RoomBook from "./booking/roomBookModel.js";
import StaffMember from "./User/StaffMember.js";
import Room from "./room_package/roomModel.js";
import RoomPackage from "./room_package/packageModel.js";
import Amenities from "./room_package/amenitiesModel.js";
import UserRegisterModel from "./User/UserRegisterModel.js";
import RoomAmenities from "./room_package/roomAmenities.js";


export function initModels() {

    // Guest -> RoomBook
    Guest.hasMany(RoomBook, {
        foreignKey: "guest_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    RoomBook.belongsTo(Guest, {
        foreignKey: "guest_id",
    });

    // Room -> RoomBook
    Room.hasMany(RoomBook, {
        foreignKey: "roomId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    RoomBook.belongsTo(Room, {
        foreignKey: "roomId",
    });

    // Package -> Room
    RoomPackage.hasMany(Room, {
        foreignKey: "packageId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    Room.belongsTo(RoomPackage, {
        foreignKey: "packageId",
    })

    // Room -> RoomAmenities
    Room.hasMany(RoomAmenities, {
        foreignKey: "roomId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    RoomAmenities.belongsTo(Room, {
        foreignKey: "roomId",
    });


    // Amenities -> RoomAmenities
    Amenities.hasMany(RoomAmenities, {
        foreignKey: "amenityId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    RoomAmenities.belongsTo(Amenities, {
        foreignKey: "amenityId",
    });

    return { Guest, RoomBook, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities };
}
export { Guest, RoomBook, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities };


