import { col, fn, Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import { sendEmail, sendBookingConfirmationEmail } from "../../services/emailService.js";
import { Customer, Room, BookedRoom, Reservation, AirPortPickup } from "../../models/index.js";

    return {
        totalPrice,
        nightlyRate: totalPrice / stayNights,
        stayNights,
        roomType: roomType.type,
        boardType: boardType.type,
        occupancyType: occupancyType.type
    };
};

// available room list with packages
const availableRooms = async (req, res) => {
    try {
        const avlRooms = await Room.findAll({
            where: { roomStatus: "available" },
            include: [
                {
                    model: RoomPackage,
                    attributes: ["id", "pname", "maxAdults", "maxKids", "pprice", "pimage"],
                }
            ]
        });

        // Query dynamic pricing combinations
        const pricingCatalogue = await RoomPrice.findAll({
            include: [
                { model: RoomType, as: "roomType", attributes: ["id", "type"] },
                { model: OccupancyType, as: "occupancyType", attributes: ["id", "type"] },
                { model: BoardType, as: "boardType", attributes: ["id", "type"] },
                { model: SeasonalDiscount, as: "season" }
            ]
        });

        // Query active seasonal discounts
        const activeSeasonalDiscounts = await SeasonalDiscount.findAll({
            where: {
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() }
            }
        });

        if (avlRooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No available rooms found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Available rooms found",
            count: avlRooms.length,
            data: avlRooms,
            pricingCatalogue,
            activeSeasonalDiscounts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
};

// Add booking
const createBooking = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            guestId,
            checkInDate,
            total_price,
            rooms,
            airportPickup,
            personalRequest,
        } = req.body;

        // -----------------------------
        // 1. Validate input
        // -----------------------------
        if (!guestId) {
            return res.status(400).json({
                success: false,
                message: "guestId is required"
            });
        }

        if (!checkInDate) {
            return res.status(400).json({
                success: false,
                message: "checkInDate is required"
            });
        }

        if (!total_price || total_price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid total_price"
            });
        }

        if (!Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Rooms are required"
            });
        }

        // -----------------------------
        // 2. Validate + process rooms (Calculate Server-Side Total Price)
        // -----------------------------
        let calculatedTotalPrice = 0;
        const bookedRoomEntries = [];

        for (const roomData of rooms) {
            const {
                roomId,
                checkIn,
                checkOut,
                actualAdults = 1,
                actualKids = 0,
                actualKidAges = [],
                roomType: clientRoomType,
                boardType: clientBoardType
            } = roomData;

            if (!roomId || !checkIn || !checkOut) {
                throw new Error("Invalid room data provided");
            }

            // Check room availability
            const room = await Room.findOne({
                where: {
                    id: roomId,
                    roomStatus: "available"
                },
                include: [RoomPackage],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!room) {
                throw new Error(`Room ${roomId} is not available`);
            }

            // Check overlapping bookings
            const conflict = await BookedRoom.findOne({
                where: {
                    room_id: roomId,
                    status: { [Op.notIn]: ["cancelled", "checked_out"] },
                    checkIn: { [Op.lt]: checkOut },
                    checkOut: { [Op.gt]: checkIn }
                },
                transaction: t
            });

            if (conflict) {
                throw new Error(`Room ${roomId} is already booked for selected dates`);
            }

            // DYNAMIC PRICE CALCULATION
            const resolvedRoomType = clientRoomType || (room.RoomPackage ? room.RoomPackage.pname : "Deluxe King Room");
            const resolvedBoardType = clientBoardType || "Room Only";

            const priceDetails = await calculateRoomStayPrice(
                resolvedRoomType,
                resolvedBoardType,
                actualAdults,
                checkIn,
                checkOut
            );

            calculatedTotalPrice += priceDetails.totalPrice;

            bookedRoomEntries.push({
                room_id: roomId,
                checkIn,
                checkOut,
                actualAdults,
                actualKids,
                actualKidAges,
                adults: actualAdults,
                kids: actualKids,
                status: "reserved"
            });
        }

        // Add airport pickup surcharge if enabled
        if (airportPickup?.enabled) {
            if (!airportPickup.pickupDate || !airportPickup.pickupTime) {
                throw new Error("Airport pickup date and time are required");
            }
            calculatedTotalPrice += 50.00;
        }

        // Compare price discrepancy (tolerance of $1.50 for minor floating point rounding differences)
        const clientPrice = parseFloat(total_price);
        const priceDiscrepancy = Math.abs(calculatedTotalPrice - clientPrice);
        if (priceDiscrepancy > 1.50) {
            throw new Error(`Price verification failed. Server calculated $${calculatedTotalPrice.toFixed(2)}, but client submitted $${clientPrice.toFixed(2)}.`);
        }

        // -----------------------------
        // 3. Create Reservation
        // -----------------------------
        const reservation = await Reservation.create(
            {
                guest_id: guestId,
                customer_id: guestId, // Reservation/Booking table uses customer_id
                check_in_date: checkInDate,
                total_price: calculatedTotalPrice, // Use the secure server-calculated price
                status: "confirmed",
                kids_age: rooms.flatMap(r => r.actualKidAges || []), // Aggregate kids ages onto the booking
                note: personalRequest || null
            },
            { transaction: t }
        );

        // Assign reservation_id and booking_id (for compatibility)
        const entriesWithBookingId = bookedRoomEntries.map(entry => ({
            ...entry,
            reservation_id: reservation.id,
            booking_id: reservation.id
        }));

        // -----------------------------
        // 4. Bulk insert booked rooms
        // -----------------------------
        await BookedRoom.bulkCreate(entriesWithBookingId, { transaction: t });

        if (airportPickup?.enabled) {
            await AirPortPickup.create(
                {
                    guest_id: guestId,
                    customer_id: guestId,
                    pickup_date: airportPickup.pickupDate,
                    pickup_time: airportPickup.pickupTime,
                },
                { transaction: t }
            );
        }

        await t.commit();

        try {
            const confirmedBooking = await Reservation.findByPk(reservation.id, {
                include: [
                    { model: Customer },
                    {
                        model: BookedRoom,
                        as: "bookedRooms",
                        include: [
                            {
                                model: Room,
                                include: [RoomPackage],
                            },
                        ],
                    },
                ],
            });

            if (confirmedBooking) {
                await sendBookingConfirmationEmail(confirmedBooking);
            }
        } catch (emailError) {
            console.error("BOOKING CONFIRMATION EMAIL ERROR:", emailError);
        }

        if (personalRequest && personalRequest != null) {
            await sendEmail({
                to: "sandeepal513@gmail.com",
                subject: "Personal Request",
                html: "<h1>Personal Request</h1>" +
                        "<p>Personal Request: " + personalRequest + "</p>",
                text: personalRequest,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                reservationId: reservation.id
            }
        });

    } catch (error) {
        await t.rollback();

        console.error("CREATE BOOKING ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Reservation.findAll({
            include: [
                { model: Customer },
                { 
                    model: BookedRoom, 
                    as: 'bookedRooms',
                    include: [Room] 
                }
            ]
        });
        return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get single booking
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Reservation.findByPk(id, {
            include: [
                { model: Customer },
                { model: BookedRoom, as: 'bookedRooms', include: [Room] }
            ]
        });
        if (!booking) return res.status(404).json({ message: "Not found" });
        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Booking 
const updateBooking = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params; // Reservation ID
        const { status, total_price } = req.body;

        const reservation = await Reservation.findByPk(id, { transaction: t });
        if (!reservation) throw new Error("Reservation not found");

        await reservation.update({ status, total_price }, { transaction: t });
        
        await t.commit();
        return res.status(200).json({ success: true, message: "Updated" });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Booking 
const deleteBookingById = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;

        // 1. Find reservation
        const reservation = await Reservation.findByPk(id, {
            transaction: t
        });

        if (!reservation) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        // 2. Delete related booked rooms FIRST (important for FK safety)
        await BookedRoom.destroy({
            where: { reservation_id: id },
            transaction: t
        });

        // 3. Delete reservation
        await reservation.destroy({ transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Reservation deleted successfully"
        });

    } catch (error) {
        await t.rollback();

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// get all available roomlist for specific package and checkin checkout dates no book
const getAvailableRoomAssignForPackage = async (req, res) => {
    try {
        const { packageId, checkIn, checkOut } = req.body;

        if (!packageId || !checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "packageId, checkIn, checkOut required"
            });
        }

        const rooms = await sequelize.query(`
            SELECT r.*
            FROM room r
            WHERE r.packageId = :packageId
            AND r.roomStatus = 'available'
            AND r.id NOT IN (
                SELECT br.room_id
                FROM booked_rooms br
                WHERE br.status NOT IN ('cancelled', 'checked_out')
                AND br.checkIn < :checkOut
                AND br.checkOut > :checkIn
            )
        `, {
            replacements: { packageId, checkIn, checkOut },
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAvailablePackagesByDate = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "checkIn and checkOut dates are required",
            });
        }

        const query = `
            SELECT 
                p.id,
                p.pname,
                p.pprice,
                p.discount,
                p.pimage,
                p.maxAdults,
                p.maxKids,
                p.description,
                COUNT(DISTINCT r.id) AS available_room
            FROM room_package p
            JOIN room r ON p.id = r.packageId
            WHERE r.roomStatus = 'available'
            AND r.id NOT IN (
                SELECT br.room_id
                FROM booked_rooms br
                WHERE br.status NOT IN ('cancelled', 'checked_out')
                AND br.checkIn < :checkOut
                AND br.checkOut > :checkIn
            )
            GROUP BY p.id
        `;

        const packagesList = await sequelize.query(query, {
            replacements: { 
                checkIn: checkIn, 
                checkOut: checkOut 
            },
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: packagesList.length > 0 ? "Packages found" : "No packages available",
            data: packagesList
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Expose dynamic price matrix lookup
const getPricingMatrix = async (req, res) => {
    try {
        const matrix = await RoomPrice.findAll({
            include: [
                { model: RoomType, as: "roomType", attributes: ["id", "type"] },
                { model: OccupancyType, as: "occupancyType", attributes: ["id", "type"] },
                { model: BoardType, as: "boardType", attributes: ["id", "type"] },
                { model: SeasonalDiscount, as: "season" }
            ]
        });

        const activeDiscounts = await SeasonalDiscount.findAll({
            where: {
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Pricing matrix retrieved successfully",
            count: matrix.length,
            data: {
                matrix,
                activeDiscounts
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve pricing matrix",
            error: error.message
        });
    }
};

// Endpoint to dry-run pricing calculation
const checkBookingPrice = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, rooms, airportPickup } = req.body;

        if (!checkInDate || !checkOutDate || !Array.isArray(rooms)) {
            return res.status(400).json({
                success: false,
                message: "checkInDate, checkOutDate, and rooms list are required"
            });
        }

        let calculatedTotalPrice = 0;
        const breakdown = [];

        for (const roomData of rooms) {
            const {
                roomId,
                actualAdults = 2,
                roomType,
                boardType
            } = roomData;

            let resolvedRoomType = roomType;
            let resolvedBoardType = boardType || "Room Only";

            if (roomId && (!resolvedRoomType)) {
                const room = await Room.findByPk(roomId, { include: [RoomPackage] });
                if (room && room.RoomPackage) {
                    resolvedRoomType = room.RoomPackage.pname;
                }
            }

            if (!resolvedRoomType) {
                return res.status(400).json({
                    success: false,
                    message: "roomType or valid roomId is required for each room in list"
                });
            }

            const priceDetails = await calculateRoomStayPrice(
                resolvedRoomType,
                resolvedBoardType,
                actualAdults,
                checkInDate,
                checkOutDate
            );

            calculatedTotalPrice += priceDetails.totalPrice;
            breakdown.push({
                roomId,
                requestedRoomType: resolvedRoomType,
                requestedBoardType: resolvedBoardType,
                resolvedRoomType: priceDetails.roomType,
                resolvedBoardType: priceDetails.boardType,
                resolvedOccupancyType: priceDetails.occupancyType,
                stayNights: priceDetails.stayNights,
                avgNightlyRate: priceDetails.nightlyRate,
                roomTotalPrice: priceDetails.totalPrice
            });
        }

        let airportPickupSurcharge = 0;
        if (airportPickup?.enabled) {
            calculatedTotalPrice += 50.00;
            airportPickupSurcharge = 50.00;
        }

        return res.status(200).json({
            success: true,
            data: {
                totalPrice: calculatedTotalPrice,
                airportPickupSurcharge,
                stayNights: breakdown[0]?.stayNights || 1,
                breakdown
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Price calculation failed",
            error: error.message
        });
    }
};

export {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBookingById,
    updateBooking,
    availableRooms,
    getAvailableRoomAssignForPackage,
    getAvailablePackagesByDate,
    getPricingMatrix,
    checkBookingPrice,
    calculateRoomStayPrice
}