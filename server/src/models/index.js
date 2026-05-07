import Customer from "./User/Customer.js";
import BookedRoom from "./booking/roomBookModel.js";
import Reservation from "./booking/reservationModel.js";
import StaffMember from "./User/StaffMember.js";
import Room from "./room_package/roomModel.js";
import RoomPackage from "./room_package/packageModel.js";
import Amenities from "./room_package/amenitiesModel.js";
import UserRegisterModel from "./User/UserRegisterModel.js";
import Tour from "./tour_package/tourModel.js";
import TourItem from "./tour_package/tourItemsModel.js";
import RoomAmenities from "./room_package/roomAmenities.js";
import TourInquiry from "./tour_package/TourInquiry.js";
import TourBooking from "./tour_package/TourBooking.js";
import TourPayment from "./tour_package/TourPayment.js";
import PackageImage from "./room_package/packageImageModel.js";
import TourRefund from "./tour_package/TourRefund.js";


export function initModels() {

    // Reservation -> BookedRoom
    Reservation.hasMany(BookedRoom, {
        foreignKey: "reservation_id",
        as: "bookedRooms",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    BookedRoom.belongsTo(Reservation, {
        foreignKey: "reservation_id",
        as: "reservation",
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

    // TourInquiry -> TourBooking (One-to-One)
    TourInquiry.hasOne(TourBooking, {
        foreignKey: "inquiryId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    TourBooking.belongsTo(TourInquiry, {
        foreignKey: "inquiryId",
    });

    // TourBooking -> TourPayment (One-to-Many)
    TourBooking.hasMany(TourPayment, {
        foreignKey: "bookingId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    TourPayment.belongsTo(TourBooking, {
        foreignKey: "bookingId",
    });

    // TourBooking -> TourRefund (One-to-One)
    TourBooking.hasOne(TourRefund, {
        foreignKey: "bookingId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    TourRefund.belongsTo(TourBooking, {
        foreignKey: "bookingId",
    });

    return { Customer, BookedRoom, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, TourBooking, TourPayment, PackageImage, TourRefund };
}
export { Customer, BookedRoom, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, TourBooking, TourPayment, PackageImage, TourRefund };


