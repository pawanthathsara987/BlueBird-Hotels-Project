import sequelize from "../../config/database.js";
import { Guest, Room, RoomBook, RoomPackage } from "../../models/index.js";


// available room check
const availableRooms = async (req, res) => {
    try {
        const avlRooms = await Room.findAll({
            where: { rstatus: "available" },
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

//available package
const getAllPackages = async (req, res) => {
    try {
        const packages = await sequelize.query(`
            SELECT 
                p.id,
                p.pname,
                p.pprice,
                p.pimage,
                p.maxAdults,
                p.maxKids,
                COUNT(CASE WHEN r.rstatus = 'available' THEN 1 END) AS availableRooms
            FROM room_package p
            LEFT JOIN rooms r ON p.id = r.packageId
            GROUP BY p.id
        `, { type: sequelize.QueryTypes.SELECT });

        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No packages found",
            });
        }

        return res.status(200).json({
            success: true,
            count: packages.length,
            data: packages,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
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

export {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBookingById,
    updateBooking,
    availableRooms,
    getAllPackages
}