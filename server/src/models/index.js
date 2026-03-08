import Guest from "./booking/roomBookGuestModel.js";
import RoomBook from "./booking/roomBookModel.js";
import StaffMember from "./User/StaffMember.js";
import Room from "./room_package/roomModel.js";
import RoomPackage from "./room_package/packageModel.js";


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

    return { Guest, RoomBook, Room, RoomPackage, StaffMember };
}
export { Guest, RoomBook, Room, RoomPackage, StaffMember };

