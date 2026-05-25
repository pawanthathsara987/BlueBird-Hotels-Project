import { col, fn, Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import { sendEmail, sendBookingConfirmationEmail } from "../../services/emailService.js";
import { Customer, Room, BookedRoom, Reservation, AirPortPickup, OtherItemPrice, RoomType, Amenities } from "../../models/index.js";

/**
 * Helper to calculate dynamic price for a room stay based on RoomType, OccupancyType, BoardType and SeasonalDiscount.
 */
const calculateRoomStayPrice = async (roomTypeName, boardTypeName, adultsCount, checkInDate, checkOutDate) => {
    // 1. Resolve RoomType
    const roomType = await RoomType.findOne({
        where: { type: { [Op.like]: `%${roomTypeName}%` } }
    });
    if (!roomType) {
        throw new Error(`Room type "${roomTypeName}" not found in database`);
    }

    // 2. Resolve BoardType
    const boardType = await BoardType.findOne({
        where: { type: { [Op.like]: `%${boardTypeName}%` } }
    });
    if (!boardType) {
        throw new Error(`Board type "${boardTypeName}" not found in database`);
    }

    // 3. Resolve OccupancyType based on guest numbers
    // Single if adultsCount <= 1, Double if adultsCount === 2, Triple if adultsCount === 3, Family if adultsCount >= 4
    let occupancyTypeName = "Double";
    if (adultsCount <= 1) {
        occupancyTypeName = "Single";
    } else if (adultsCount === 2) {
        occupancyTypeName = "Double";
    } else if (adultsCount === 3) {
        occupancyTypeName = "Triple";
    } else {
        occupancyTypeName = "Quadruple";
    }

    let occupancyType = await OccupancyType.findOne({
        where: { type: { [Op.like]: `%${occupancyTypeName}%` } }
    });

    if (!occupancyType) {
        occupancyType = await OccupancyType.findOne({
            where: { type: { [Op.like]: "%Double%" } }
        });
    }
    if (!occupancyType) {
        occupancyType = await OccupancyType.findOne();
    }
    if (!occupancyType) {
        throw new Error(`No occupancy types defined in database`);
    }

    // 4. Find standard RoomPrice for this combination
    let roomPrice = await RoomPrice.findOne({
        where: {
            roomTypeId: roomType.id,
            boardTypeId: boardType.id,
            occupancyTypeId: occupancyType.id
        },
        include: [{
            model: SeasonalDiscount,
            as: "season"
        }]
    });

    // Fallback: If exact occupancy combination doesn't exist, try getting standard Double occupancy price
    if (!roomPrice) {
        const doubleOcc = await OccupancyType.findOne({ where: { type: { [Op.like]: "%Double%" } } });
        if (doubleOcc) {
            roomPrice = await RoomPrice.findOne({
                where: {
                    roomTypeId: roomType.id,
                    boardTypeId: boardType.id,
                    occupancyTypeId: doubleOcc.id
                },
                include: [{
                    model: SeasonalDiscount,
                    as: "season"
                }]
            });
        }
    }

    // Fallback 2: Get any price combination for this room type and board type
    if (!roomPrice) {
        roomPrice = await RoomPrice.findOne({
            where: {
                roomTypeId: roomType.id,
                boardTypeId: boardType.id
            },
            include: [{
                model: SeasonalDiscount,
                as: "season"
            }]
        });
    }

    if (!roomPrice) {
        throw new Error(`Pricing not configured for room type "${roomTypeName}" with board type "${boardTypeName}"`);
    }

    let baseRate = parseFloat(roomPrice.price);
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const stayNights = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));

    let totalPrice = 0;

    // Calculate price night by night to accurately apply seasonal discounts if check-in spans multiple periods
    for (let day = 0; day < stayNights; day++) {
        const currentNightDate = new Date(start);
        currentNightDate.setDate(start.getDate() + day);

        let nightlyRate = baseRate;

        // Query SeasonalDiscount for this specific night
        const activeDiscount = await SeasonalDiscount.findOne({
            where: {
                startDate: { [Op.lte]: currentNightDate },
                endDate: { [Op.gte]: currentNightDate }
            }
        });

        if (activeDiscount) {
            if (activeDiscount.discountType === "percentage") {
                nightlyRate = nightlyRate * (1 - activeDiscount.discountValue / 100);
            } else if (activeDiscount.discountType === "fixed") {
                nightlyRate = Math.max(0, nightlyRate - activeDiscount.discountValue);
            }
        } else if (roomPrice.season) {
            const season = roomPrice.season;
            if (currentNightDate >= new Date(season.startDate) && currentNightDate <= new Date(season.endDate)) {
                if (season.discountType === "percentage") {
                    nightlyRate = nightlyRate * (1 - season.discountValue / 100);
                } else if (season.discountType === "fixed") {
                    nightlyRate = Math.max(0, nightlyRate - season.discountValue);
                }
            }
        }

        totalPrice += nightlyRate;
    }

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
            const pickupPriceRecord = await OtherItemPrice.findOne({
                where: { item_name: { [Op.like]: "%airport pickup%" }, status: true },
                transaction: t
            });
            const pickupPrice = pickupPriceRecord ? parseFloat(pickupPriceRecord.price) : 50.00;
            calculatedTotalPrice += pickupPrice;
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

const getAvailableRoomTypesByDate = async (req, res) => {
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
                rt.id AS room_type_id,
                rt.type AS room_type_name,
                rt.image_url,
                rp.occupancyTypeId,
                rp.boardTypeId,
                bt.type AS board_type_name,
                rp.price,
                COUNT(r.id) AS available_rooms_count,
                MAX(ot.capacity) AS max_adults,
                MAX(r.kids) AS max_kids,
                MAX(r.kids_allow) AS kids_allow
            FROM room_type rt
            JOIN room r ON rt.id = r.room_type_id
            JOIN occupancy_type ot ON r.occupancy_type_id = ot.id
            JOIN room_price rp ON rt.id = rp.roomTypeId
            JOIN board_type bt ON rp.boardTypeId = bt.id
            WHERE r.status = 'available'
            AND r.occupancy_type_id = rp.occupancyTypeId
            AND r.id NOT IN (
                SELECT br.room_id 
                FROM booked_rooms br
                WHERE br.status IN ('reserved', 'checked_in')
                    AND br.checkIn < :checkOut
                    AND br.checkOut > :checkIn
            )
            GROUP BY 
                rt.id, 
                rt.type, 
                rt.image_url, 
                rp.occupancyTypeId, 
                rp.boardTypeId, 
                bt.type, 
                rp.price
        `;

        const roomTypeList = await sequelize.query(query, {
            replacements: {
                checkIn: checkIn,
                checkOut: checkOut
            },
            type: QueryTypes.SELECT
        });

        // Fetch detailed available physical rooms list to allow client-side room assignment
        const roomsQuery = `
            SELECT r.id, r.room_number, r.floor, r.room_type_id, r.kids_allow, r.kids AS max_kids, ot.capacity AS max_adults
            FROM room r
            JOIN occupancy_type ot ON r.occupancy_type_id = ot.id
            WHERE r.status = 'available'
            AND r.id NOT IN (
                SELECT br.room_id 
                FROM booked_rooms br
                WHERE br.status IN ('reserved', 'checked_in')
                    AND br.checkIn < :checkOut
                    AND br.checkOut > :checkIn
            )
        `;

        const availableRoomsList = await sequelize.query(roomsQuery, {
            replacements: {
                checkIn: checkIn,
                checkOut: checkOut
            },
            type: QueryTypes.SELECT
        });

        const otherPricesList = await OtherItemPrice.findAll({
            where: { status: true }
        });

        const roomTypeAmenitiesList = await RoomType.findAll({
            include: [{
                model: Amenities,
                attributes: ["id", "name"],
                through: { attributes: [] }
            }]
        });

        return res.status(200).json({
            success: true,
            message: roomTypeList.length > 0 ? "Room Types found" : " No Room Types available",
            data: roomTypeList,
            availableRooms: availableRoomsList,
            otherPrices: otherPricesList,
            roomTypeAmenities: roomTypeAmenitiesList
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
            const pickupPriceRecord = await OtherItemPrice.findOne({
                where: { item_name: { [Op.like]: "%airport pickup%" }, status: true }
            });
            const pickupPrice = pickupPriceRecord ? parseFloat(pickupPriceRecord.price) : 50.00;
            calculatedTotalPrice += pickupPrice;
            airportPickupSurcharge = pickupPrice;
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
    getAvailableRoomTypesByDate,
    getPricingMatrix,
    checkBookingPrice,
    calculateRoomStayPrice
}