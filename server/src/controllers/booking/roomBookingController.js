import { col, fn, QueryTypes } from "sequelize";
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
        const { name, email, country, phone, rooms, total_price } = req.body; 
        // Note: Expecting 'rooms' as an array: [{ roomId, checkIn, checkOut, adults, kids }, ...]

        // 1. Create Customer
        const customer = await Customer.create({ name, email, country, pnumber: phone }, { transaction: t });

        // 2. Create Reservation (The Parent Record)
        const reservation = await Reservation.create({
            guest_id: customer.id,
            total_price: total_price,
            status: 'confirmed'
        }, { transaction: t });

        // 3. Loop through requested rooms and create BookedRoom records
        for (const roomData of rooms) {
            const { roomId, checkIn, checkOut, actualAdults, actualKids } = roomData;

            // Validate if room exists (Optional: Add your package capacity checks here)
            const room = await Room.findByPk(roomId, { transaction: t });
            if (!room) throw new Error(`Room ID ${roomId} not found`);

            await BookedRoom.create({
                reservation_id: reservation.id,
                room_id: room.id,
                checkIn,
                checkOut,
                actualAdults,
                actualKids,
                status: 'reserved'
            }, { transaction: t });
        }

        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            data: { reservationId: reservation.id }
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({ success: false, message: error.message });
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
        const reservation = await Reservation.findByPk(id, { transaction: t });
        
        if (!reservation) throw new Error("Reservation not found");
        
        await reservation.destroy({ transaction: t });
        await t.commit();
        
        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ success: false, message: error.message });
    }
};

// get all available roomlist for specific package and checkin checkout dates no book
const getAvailableRoomAssignForPackage = async (req, res) => {
    try {
        const { packageId, checkIn, checkOut } = req.body;

        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: "packageId are required",
            });
        }

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "checkin and checkout date are required",
            });
        };

        // Updated SQL to reflect 'booked_rooms' table and 'room_id' column
        const query = `
            SELECT 
                r.id, 
                r.roomNumber, 
                r.roomStatus,
                r.packageId
            FROM room r
            WHERE r.packageId = ?
            AND r.roomStatus = 'available'
            AND r.id NOT IN (
                SELECT room_id 
                FROM booked_rooms 
                WHERE status NOT IN ('cancelled', 'checked_out')
                    AND checkIn < ?
                    AND checkOut > ? 
            ) LIMIT 1`;

        const roomListbyPackageId = await sequelize.query(query, {
            replacements: [packageId, checkOut, checkIn],
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: roomListbyPackageId.length > 0
                ? "Rooms retrieved successfully"
                : "No available rooms for selected dates and package",
            count: roomListbyPackageId.length,
            data: roomListbyPackageId
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

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
                COUNT(r.id) AS available_room
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
            GROUP BY p.id, p.pname, p.pprice, p.pimage, p.maxAdults, p.maxKids, p.description
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