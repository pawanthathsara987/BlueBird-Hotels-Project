import Customer from "./User/Customer.js";
import BookedRoom from "./booking/bookedRoom.js";
import Booking from "./booking/booking.js";
import StaffMember from "./User/StaffMember.js";
import Room from "./room_package/roomModel.js";
import RoomPackage from "./room_package/packageModel.js";
import Amenities from "./room_package/amenitiesModel.js";
import UserRegisterModel from "./User/UserRegisterModel.js";
import Tour from "./tour_package/tourModel.js";
import TourItem from "./tour_package/tourItemsModel.js";
import RoomAmenities from "./room_package/roomAmenities.js";
import TourInquiry from "./tour_package/TourInquiry.js";
import PackageImage from "./room_package/packageImageModel.js";
import AirPortPickup from './booking/airPortPickupModel.js';
import Vehicle from "./vehicle/vehicleModel.js";
import Role from "./User/Role.js";


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

    // Package -> Room
    RoomPackage.hasMany(Room, {
        foreignKey: "packageId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    Room.belongsTo(RoomPackage, {
        foreignKey: "packageId",
    })

    // package -> packageImage
    RoomPackage.hasMany(PackageImage, {
        foreignKey: "packageId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    PackageImage.belongsTo(RoomPackage, {
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

    // Keep `Reservation` alias for backward compatibility with existing controllers
    const Reservation = Booking;

    return { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, PackageImage, Vehicle, Role };
}
export { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, PackageImage, Vehicle, Role };


