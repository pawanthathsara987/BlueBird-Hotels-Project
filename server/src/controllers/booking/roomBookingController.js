import { col, fn, Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import { Customer, Room, BookedRoom, RoomPackage, Reservation } from "../../models/index.js";


// available room list with packages
const availableRooms = async (req, res) => {
    try {
        const avlRooms = await Room.findAll({
            where: { roomstatus: "available" },
            include: [
                {
                    model: RoomPackage,
                    attributes: ["id", "pname", "maxAdults", "maxKids", "pprice", "pimage"],
                }
            ]
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
            total_price,
            rooms
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
        // 2. Create Reservation
        // -----------------------------
        const reservation = await Reservation.create(
            {
                guest_id: guestId,
                total_price,
                status: "confirmed"
            },
            { transaction: t }
        );

        const bookedRoomEntries = [];

        // -----------------------------
        // 3. Validate + process rooms
        // -----------------------------
        for (const roomData of rooms) {
            const {
                roomId,
                checkIn,
                checkOut,
                actualAdults = 1,
                actualKids = 0
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

            bookedRoomEntries.push({
                reservation_id: reservation.id,
                room_id: roomId,
                checkIn,
                checkOut,
                actualAdults,
                actualKids,
                status: "reserved"
            });
        }

        // -----------------------------
        // 4. Bulk insert booked rooms
        // -----------------------------
        await BookedRoom.bulkCreate(bookedRoomEntries, { transaction: t });

        await t.commit();

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

export {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBookingById,
    updateBooking,
    availableRooms,
    getAvailableRoomAssignForPackage,
    getAvailablePackagesByDate
}