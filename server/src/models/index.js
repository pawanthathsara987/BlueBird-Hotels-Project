import Customer from "./User/Customer.js";
import BookedRoom from "./booking/bookedRoom.js";
import Booking from "./booking/booking.js";
import StaffMember from "./User/StaffMember.js";
import Room from "./room/roomModel.js";
import Amenities from "./room/amenitiesModel.js";
import UserRegisterModel from "./User/UserRegisterModel.js";
import Tour from "./tour_package/tourModel.js";
import TourItem from "./tour_package/tourItemsModel.js";
import RoomAmenities from "./room/roomAmenities.js";
import TourInquiry from "./tour_package/TourInquiry.js";
import AirPortPickup from './booking/airPortPickupModel.js';
import Vehicle from "./vehicle/vehicleModel.js";
import VehicleType from "./vehicle/vehicleTypeModel.js";
import Role from "./User/Role.js";
import OccupancyType from "./room/occupancyTypesModel.js";
import RoomType from "./room/roomTypeModel.js";
import BoardType from "./room/boardType.js";
import SeasonalDiscount from "./room/seasonalDiscount.js";
import RoomPrice from "./room/roomPrice.js";
import RoomTypeAmenities from "./room/roomTypeAmenities.js";
import DriverPricingSetting from "./vehicle/driverpricingmodel.js";
import OtherItemPrice from "./room/otherItemPrice.js";
import Policy from "./room/policy.js";


// Keep `Reservation` alias for backward compatibility with existing controllers
const Reservation = Booking;


export function initModels() {

    // Booking -> BookedRoom
    Booking.hasMany(BookedRoom, {
        foreignKey: "booking_id",
        as: "bookedRooms",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    BookedRoom.belongsTo(Booking, {
        foreignKey: "booking_id",
        as: "booking",
    });

    // Room -> BookedRoom
    Room.hasMany(BookedRoom, {
        foreignKey: "room_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    BookedRoom.belongsTo(Room, {
        foreignKey: "room_id",
    });

    // Customer -> Bookings
    Customer.hasMany(Booking, {
        foreignKey: "customer_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Booking.belongsTo(Customer, {
        foreignKey: "customer_id",
    });


    // Customer -> AirPortPickup
    Customer.hasMany(AirPortPickup, {
        foreignKey: "customer_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    AirPortPickup.belongsTo(Customer, {
        foreignKey: "customer_id",
    });

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

    // RoomType <-> Amenities (Many-to-Many via RoomTypeAmenities)
    RoomType.belongsToMany(Amenities, {
        through: RoomTypeAmenities,
        foreignKey: "roomTypeId",
        otherKey: "amenityId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Amenities.belongsToMany(RoomType, {
        through: RoomTypeAmenities,
        foreignKey: "amenityId",
        otherKey: "roomTypeId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    // RoomType -> RoomTypeAmenities (One-to-Many)
    RoomType.hasMany(RoomTypeAmenities, {
        foreignKey: "roomTypeId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    RoomTypeAmenities.belongsTo(RoomType, {
        foreignKey: "roomTypeId",
    });

    // Amenities -> RoomTypeAmenities (One-to-Many)
    Amenities.hasMany(RoomTypeAmenities, {
        foreignKey: "amenityId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    RoomTypeAmenities.belongsTo(Amenities, {
        foreignKey: "amenityId",
    });

    // Tour <-> TourItem (Many-to-Many)
    Tour.belongsToMany(TourItem, {
        through: "tour_item_assignments",
        foreignKey: "tourId",
        otherKey: "tourItemId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    TourItem.belongsToMany(Tour, {
        through: "tour_item_assignments",
        foreignKey: "tourItemId",
        otherKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    // Tour -> TourInquiry (One-to-Many)
    Tour.hasMany(TourInquiry, {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    TourInquiry.belongsTo(Tour, {
        foreignKey: "tourId",
    });


    //StaffMember -> Role (Many-to-One)
    StaffMember.belongsTo(Role, {
        foreignKey: "roleId"
    });

    Role.hasMany(StaffMember, {
        foreignKey: "roleId"
    });

    // ── VehicleType → Vehicle ─────────────────────────────────────────────────────
    VehicleType.hasMany(Vehicle, {
        foreignKey: 'vehicleTypeId',
        as: 'vehicles',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    Vehicle.belongsTo(VehicleType, {
        foreignKey: 'vehicleTypeId',
        as: 'vehicleType',
    });

    // RoomPrice associations: link pricing to occupancy/room/board/season types
    OccupancyType.hasMany(RoomPrice, {
        foreignKey: 'occupancyTypeId',
        as: 'roomPrices',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    RoomPrice.belongsTo(OccupancyType, {
        foreignKey: 'occupancyTypeId',
        as: 'occupancyType',
    });

    // RoomType associations
    RoomType.hasMany(RoomPrice, {
        foreignKey: 'roomTypeId',
        as: 'roomPrices',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    RoomPrice.belongsTo(RoomType, {
        foreignKey: 'roomTypeId',
        as: 'roomType',
    });

    BoardType.hasMany(RoomPrice, {
        foreignKey: 'boardTypeId',
        as: 'roomPrices',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    RoomPrice.belongsTo(BoardType, {
        foreignKey: 'boardTypeId',
        as: 'boardType',
    });

    SeasonalDiscount.hasMany(RoomPrice, {
        foreignKey: 'seasonId',
        as: 'roomPrices',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
    RoomPrice.belongsTo(SeasonalDiscount, {
        foreignKey: 'seasonId',
        as: 'season',
    });

    // Room -> OccupancyType & RoomType associations
    OccupancyType.hasMany(Room, {
        foreignKey: 'occupancy_type_id',
        as: 'rooms',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    Room.belongsTo(OccupancyType, {
        foreignKey: 'occupancy_type_id',
        as: 'occupancyType',
    });

    RoomType.hasMany(Room, {
        foreignKey: 'room_type_id',
        as: 'rooms',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    Room.belongsTo(RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType',
    });

    return { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, Vehicle, VehicleType, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, RoomTypeAmenities, OtherItemPrice, Policy };
}
export { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, Vehicle, VehicleType, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, RoomTypeAmenities, DriverPricingSetting, OtherItemPrice, Policy };
