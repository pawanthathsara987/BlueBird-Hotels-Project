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
import VehicleType from "./vehicle/vehicleTypeModel.js";
import Role from "./User/Role.js";
import VehicleRentalPolicy from "./vehicle/vehicleRentalPolicyModel.js";
import OccupancyType from "./room_package/occupancyTypesModel.js";
import RoomType from "./room_package/roomTypeModel.js";
import BoardType from "./room_package/boardType.js";
import SeasonalDiscount from "./room_package/seasonalDiscount.js";
import RoomPrice from "./room_package/roomPrice.js";
import DriverPricingSetting from "./vehicle/driverPricingModel.js";
import VehicleBooking from "./vehicle/VehicleBookingModel.js";
import Driver from "./vehicle/driverModel.js";
import Payment from "./vehicle/paymentModel.js";
import Checklist from "./vehicle/checklistModel.js";
import ServiceLog from "./vehicle/serviceLogModel.js";


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

    // ── Vehicle Booking Associations ──────────────────────────────────────────────
    // Vehicle → VehicleBooking
    Vehicle.hasMany(VehicleBooking, { foreignKey: 'vehicleId', as: 'bookings', onDelete: 'RESTRICT' });
    VehicleBooking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

    // Customer → VehicleBooking
    Customer.hasMany(VehicleBooking, { foreignKey: 'customerId', as: 'vehicleBookings', onDelete: 'CASCADE' });
    VehicleBooking.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

    // Driver → VehicleBooking
    Driver.hasMany(VehicleBooking, { foreignKey: 'driverId', as: 'bookings' });
    VehicleBooking.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });

    // VehicleBooking → Payment
    VehicleBooking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments', onDelete: 'CASCADE' });
    Payment.belongsTo(VehicleBooking, { foreignKey: 'bookingId', as: 'booking' });

    // VehicleBooking → Checklist
    VehicleBooking.hasMany(Checklist, { foreignKey: 'bookingId', as: 'checklists', onDelete: 'CASCADE' });
    Checklist.belongsTo(VehicleBooking, { foreignKey: 'bookingId', as: 'booking' });

    // Vehicle → ServiceLog
    Vehicle.hasMany(ServiceLog, { foreignKey: 'vehicleId', as: 'serviceLogs', onDelete: 'CASCADE' });
    ServiceLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

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

    return { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, PackageImage, Vehicle, VehicleType, VehicleRentalPolicy, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, VehicleBooking, Driver, Payment, Checklist, ServiceLog };
}
export { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, RoomPackage, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, PackageImage, Vehicle, VehicleType, VehicleRentalPolicy, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, DriverPricingSetting, VehicleBooking, Driver, Payment, Checklist, ServiceLog };
