import { QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import { Guest, Room, RoomBook, RoomPackage } from "../../models/index.js";


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

// add booking
const createBooking = async (req, res) => {
    const t = await Guest.sequelize.transaction();
    try {
        const { name, email, country, phone, roomNo, price, checkIn, checkOut, actualAdults, actualKids } = req.body;

        // Find room by room number
        const room = await Room.findOne({
            where: { rnumber: roomNo },
            transaction: t
        });

        if (!room) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }


        const package_ = await RoomPackage.findByPk(
            room.packageId,
            { transaction: t }
        );

        if (!package_) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }

        // Validate capacity
        if (actualAdults > package_.maxAdults) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Package allows max ${package_.maxAdults} adults only`,
            });
        }

        if (actualKids > package_.maxKids) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Package allows max ${package_.maxKids} kids only`,
            });
        }

        // Create guest
        const guest = await Guest.create({
            name,
            email,
            country,
            pnumber: phone,
        }, { transaction: t });

        // Create booking
        const booking = await RoomBook.create({
            guest_id: guest.id,
            roomId: room.id,
            price,
            checkIn,
            checkOut,
            actualAdults,
            actualKids,
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: { guest, booking }
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

// get all booking
const getAllBookings = async (req, res) => {
    try {
        const bookings = await RoomBook.findAll({
            include: [
                {
                    model: Guest,
                    attributes: ["id", "name", "email", "country", "pnumber"],
                },
                {
                    model: Room,
                    attributes: ["id", "rnumber", "rstatus", "packageId"],
                }
            ]
        });

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bookings found",
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}


// get a booking
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await RoomBook.findByPk(id, {
            include: [
                {
                    model: Guest,
                    attributes: ["id", "name", "email", "country", "pnumber"],
                },
                {
                    model: Room,
                    attributes: ["id", "rnumber", "rstatus", "packageId"],
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "No booking record found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking record found",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

// update a booking
const updateBooking = async (req, res) => {
    const t = await RoomBook.sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, email, country, phone, roomNo, price, checkIn, checkOut, actualAdults, actualKids } = req.body;

        const booking = await RoomBook.findByPk(id, {
            include: [{ model: Guest }],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        await booking.Guest.update({
            name,
            email,
            country,
            pnumber: phone,
        }, { transaction: t });

        await booking.update({
            roomId: roomNo,
            price,
            checkIn,
            checkOut,
            actualAdults,
            actualKids,
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Booking and guest updated successfully",
            data: {
                booking,
                guest: booking.Guest,
            }
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

// delete a booking
const deleteBookingById = async (req, res) => {
    const t = await RoomBook.sequelize.transaction();
    try {
        const { id } = req.params;

        const booking = await RoomBook.findByPk(id, {
            include: [{ model: Guest }],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "No booking record found",
            });
        }

        await booking.Guest.destroy({ transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

// get all packages which assign room status = available and not boooking for specific date
const getAvailablePackagesByDate  = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "checkin and checkout date are required",
            });
        };

        const query =
            `SELECT 
                p.id,
                p.pname,
                p.pprice,
                p.pimage,
                p.maxAdults,
                p.maxKids,
                p.description,
                COUNT(r.id) AS available_room
            FROM room_package p
            JOIN room r 
                ON p.id = r.packageId
            WHERE r.roomStatus = 'available'
            AND NOT EXISTS (
                SELECT 1
                FROM booking_room br
                WHERE br.roomId = r.id
                AND br.status NOT IN ('cancelled', 'checked_out')
                AND br.checkIn < ?
                AND br.checkOut > ?
            )
            GROUP BY 
                p.id, p.pname, p.pprice, p.pimage, 
                p.maxAdults, p.maxKids, p.description`;

        const packagesList = await sequelize.query(query, {
            replacements: [checkOut, checkIn],
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: packagesList.length > 0
                ? "Packages retrieved successfully"
                : "No available packages for selected dates",
            count: packagesList.length,
            data: packagesList
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
}

export {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBookingById,
    updateBooking,
    availableRooms,
    getAvailablePackagesByDate
}