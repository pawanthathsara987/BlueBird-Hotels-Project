import Guest from "./booking/roomBookGuestModel.js";
import RoomBook from "./booking/roomBookModel.js";
import Room from "./room/roomModel.js";
import RoomPackage from "./packages/packageModel.js";
import SystemUser from "./User/SystemUser.js";

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

    // RoomPackage -> RoomBook
    RoomPackage.hasMany(RoomBook, {
        foreignKey: "packageId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    RoomBook.belongsTo(RoomPackage, {
        foreignKey: "packageId",
    });

    return { Guest, RoomBook, Room, RoomPackage, SystemUser };
}

// ← add these named exports so controllers can import them directly
export { Guest, RoomBook, Room, RoomPackage, SystemUser };