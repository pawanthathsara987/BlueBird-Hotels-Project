import Guest from "./booking/roomBookGuestModel";
import RoomBook from "./booking/roomBookModel";
import Room from "./room/roomModel";
import RoomPackage from "./package/packageModel";

// Define Associations
// Guest -> RoomBook (One Guest has many RoomBooks)
Guest.hasMany(RoomBook, {
    foreignKey: 'guest_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RoomBook.belongsTo(Guest, {
    foreignKey: 'guest_id',
});

// Room -> RoomBook (One Room has many RoomBooks)
Room.hasMany(RoomBook, {
    foreignKey: 'roomId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RoomBook.belongsTo(Room, {
    foreignKey: 'roomId',
});

// RoomPackage -> RoomBook (One Package has many RoomBooks)
RoomPackage.hasMany(RoomBook, {
    foreignKey: 'packageId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RoomBook.belongsTo(RoomPackage, {
    foreignKey: 'packageId',
});

export { Guest, RoomBook, Room, RoomPackage };