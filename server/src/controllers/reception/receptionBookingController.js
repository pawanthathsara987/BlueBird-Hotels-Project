import sequelize from '../../config/database.js';
import { QueryTypes } from 'sequelize';;
import { BookedRoom } from '../../models/index.js';

async function setCheckIn(req, res) {
    try {
        const { reservation_id } = req.params;

        const bookings = await BookedRoom.findAll({
            where: { booking_id: reservation_id }
        });

        if (!bookings.length) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        for (let booking of bookings) {
            if (booking.status === 'reserved') {
                booking.status = 'checked_in';
                await booking.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: 'All rooms checked in successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function setCheckOut(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Booking id is required'
            });
        }

        const booking = await BookedRoom.findByPk(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'checked_out') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already checked out'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check out a cancelled booking'
            });
        }

        if (booking.status !== 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Only checked-in bookings can be checked out'
            });
        }

        booking.status = 'checked_out';
        await booking.save();

        return res.status(200).json({
            success: true,
            message: 'Customer checked out successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error setting check-out status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function getPendingCheckins(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];

        const query = `
            SELECT
                b.id AS reservation_id,
                c.firstName,
                c.lastName,
                MIN(br.checkIn) AS checkIn,
                COUNT(br.room_id) AS totalRooms,
                GROUP_CONCAT(room.room_number ORDER BY room.room_number) AS rooms
            FROM booking b
            JOIN booked_rooms br ON b.id = br.booking_id
            JOIN room ON br.room_id = room.id
            JOIN customer c ON b.customer_id = c.id
            WHERE b.status = 'confirmed'
            AND br.status = 'reserved'
            AND br.checkIn = :date
            GROUP BY b.id, c.firstName, c.lastName
            ORDER BY b.createdAt ASC
        `;

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Error fetching pending check-ins:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getPendingCheckOuts(req, res) {
    try {
        const date = new Date().toISOString().split("T")[0];

        const query = `
            SELECT
                br.id AS booking_id,
                c.firstName,
                c.lastName,
                br.room_id,
                r.room_number,
                br.checkOut,
                br.status,
                DATEDIFF(br.checkOut, br.checkIn) AS nights
            FROM booked_rooms br
            JOIN booking b ON br.booking_id = b.id
            JOIN customer c ON b.customer_id = c.id
            JOIN room r ON br.room_id = r.id
            WHERE br.status = 'checked_in'
            AND br.checkOut >= :date
            ORDER BY br.checkOut ASC
        `;

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Error fetching pending check-outs:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export { setCheckIn, setCheckOut, getPendingCheckins, getPendingCheckOuts };