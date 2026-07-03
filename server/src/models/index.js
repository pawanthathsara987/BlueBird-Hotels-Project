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
import VehicleRentalPolicy from "./vehicle/vehicleRentalPolicyModel.js";
import OccupancyType from "./room/occupancyTypesModel.js";
import RoomType from "./room/roomTypeModel.js";
import BoardType from "./room/boardType.js";
import SeasonalDiscount from "./room/seasonalDiscount.js";
import RoomPrice from "./room/roomPrice.js";
import RoomTypeAmenities from "./room/roomTypeAmenities.js";
import DriverPricingSetting from "./vehicle/driverPricingModel.js";
import VehicleBooking from "./vehicle/VehicleBookingModel.js";
import Driver from "./vehicle/driverModel.js";
import Payment from "./vehicle/paymentModel.js";
// Checklist and VehicleServiceLog restored
import VehicleChecklist from "./vehicle/vehicleChecklistModel.js";
import VehicleServiceLog from "./vehicle/vehicleServiceLogModel.js";
import ServiceCharge from "./room/ServiceCharge.js";
import Policy from "./room/policy.js";
import VehicleFinalBill from "./vehicle/vehicleFinalBillModel.js";
import RoomPayment from "./booking/roomPayment.js";
import ShopItem from "./shop/ShopItem.js";
import Attendance from "./attendance/Attendance.js";
import AttendanceEditLog from "./attendance/AttendanceEditLog.js";
import BookingRefund from "./booking/bookingRefund.js";
import BookingRefundItem from "./booking/bookingRefundItem.js";
import AttendanceSetting from "./attendance/AttendanceSetting.js";
import LeaveType from "./leave/LeaveType.js";
import LeaveRequest from "./leave/LeaveRequest.js";
import AirportPickupVehicle from "./booking/airportPickupVehicleModel.js";



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
        as: "bookedRooms",
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


    // Booking -> AirPortPickup
    Booking.hasOne(AirPortPickup, {
        foreignKey: "booking_id",
        as: "airportPickup",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    AirPortPickup.belongsTo(Booking, {
        foreignKey: "booking_id",
        as: "booking",
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

    // Customer -> TourInquiry (One-to-Many)
    Customer.hasMany(TourInquiry, {
        foreignKey: "customerId",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    });
    TourInquiry.belongsTo(Customer, {
        foreignKey: "customerId",
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

    // ── Vehicle → VehicleServiceLog ───────────────────────────────────────────────
    Vehicle.hasMany(VehicleServiceLog, { foreignKey: 'vehicleId', as: 'serviceLogs', onDelete: 'CASCADE' });
    VehicleServiceLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

    // ── Vehicle → VehicleChecklist ────────────────────────────────────────────────
    Vehicle.hasMany(VehicleChecklist, { foreignKey: 'vehicleId', as: 'checklists', onDelete: 'CASCADE' });
    VehicleChecklist.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

    // ── VehicleBooking → VehicleChecklist ─────────────────────────────────────────
    VehicleBooking.hasMany(VehicleChecklist, { foreignKey: 'bookingId', as: 'checklists', onDelete: 'CASCADE' });
    VehicleChecklist.belongsTo(VehicleBooking, { foreignKey: 'bookingId', as: 'booking' });

    // ── VehicleBooking → VehicleFinalBill ─────────────────────────────────────────
    VehicleBooking.hasOne(VehicleFinalBill, { foreignKey: 'bookingId', as: 'finalBill', onDelete: 'CASCADE' });
    VehicleFinalBill.belongsTo(VehicleBooking, { foreignKey: 'bookingId', as: 'booking' });

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

    // RoomType <-> OccupancyType association
    OccupancyType.hasMany(RoomType, {
        foreignKey: 'occupancy_type_id',
        as: 'roomTypes',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });
    RoomType.belongsTo(OccupancyType, {
        foreignKey: 'occupancy_type_id',
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

    // Booking -> RoomPayment
    Booking.hasMany(RoomPayment, {
        foreignKey: "booking_id",
        as: "payments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    RoomPayment.belongsTo(Booking, {
        foreignKey: "booking_id",
        as: "booking",
    });

    // Customer -> RoomPayment
    Customer.hasMany(RoomPayment, {
        foreignKey: "customer_id",
        as: "payments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    RoomPayment.belongsTo(Customer, {
        foreignKey: "customer_id",
        as: "customer",
    });

    StaffMember.hasMany(Attendance, {
        foreignKey: "staffId",
        sourceKey: "staffId"
    });

    Attendance.belongsTo(StaffMember, {
        foreignKey: "staffId",
        targetKey: "staffId"
    });

    Attendance.hasMany(AttendanceEditLog, {
        foreignKey: "attendanceId",
        as: "editLogs"
    });

    AttendanceEditLog.belongsTo(Attendance, {
        foreignKey: "attendanceId",
        as: "attendance"
    });

    // Booking -> BookingRefund
    Booking.hasMany(BookingRefund, {
        foreignKey: "booking_id",
        as: "refunds",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    BookingRefund.belongsTo(Booking, {
        foreignKey: "booking_id",
        as: "booking"
    });

    // BookingRefund -> BookingRefundItem
    BookingRefund.hasMany(BookingRefundItem, {
        foreignKey: "refund_id",
        as: "items",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    BookingRefundItem.belongsTo(BookingRefund, {
        foreignKey: "refund_id",
        as: "refund"
    });

    // BookingRefundItem -> BookedRoom
    BookingRefundItem.belongsTo(BookedRoom, {
        foreignKey: "booked_room_id",
        as: "bookedRoom"
    });

    // BookingRefundItem -> AirPortPickup
    BookingRefundItem.belongsTo(AirPortPickup, {
        foreignKey: "airport_pickup_id",
        as: "airportPickup"
    });

    // BookingRefund -> StaffMember
    BookingRefund.belongsTo(StaffMember, {
        foreignKey: "processed_by",
        targetKey: "userId",
        as: "processedByStaff"
    });

    // Leave Management
    LeaveType.hasMany(LeaveRequest, {
        foreignKey: "leaveTypeId",
        as: "leaveRequests"
    });

    LeaveRequest.belongsTo(LeaveType, {
        foreignKey: "leaveTypeId",
        as: "leaveType"
    });

    StaffMember.hasMany(LeaveRequest, {
        foreignKey: "staffId",
        sourceKey: "staffId",
        as: "leaveRequests"
    });

    LeaveRequest.belongsTo(StaffMember, {
        foreignKey: "staffId",
        targetKey: "staffId",
        as: "staffMember"
    });

    LeaveRequest.belongsTo(StaffMember, {
        foreignKey: "approvedBy",
        targetKey: "staffId",
        as: "approver"
    });

    return { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, Vehicle, VehicleType, VehicleRentalPolicy, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, RoomTypeAmenities, DriverPricingSetting, VehicleBooking, Driver, Payment, ServiceCharge, Policy, VehicleServiceLog, VehicleChecklist, VehicleFinalBill, RoomPayment, ShopItem, Attendance, AttendanceEditLog, BookingRefund, BookingRefundItem, LeaveRequest, LeaveType, AirportPickupVehicle };
}
export { AirPortPickup, Customer, BookedRoom, Booking, Reservation, Room, StaffMember, Amenities, UserRegisterModel, RoomAmenities, Tour, TourItem, TourInquiry, Vehicle, VehicleType, VehicleRentalPolicy, Role, OccupancyType, RoomType, BoardType, RoomPrice, SeasonalDiscount, RoomTypeAmenities, DriverPricingSetting, VehicleBooking, Driver, Payment, ServiceCharge, Policy, VehicleServiceLog, VehicleChecklist, VehicleFinalBill, RoomPayment, ShopItem, Attendance, AttendanceEditLog, BookingRefund, BookingRefundItem, LeaveRequest, LeaveType, AirportPickupVehicle };
