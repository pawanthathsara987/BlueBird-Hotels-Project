import sequelize from '../../config/database.js';
import { QueryTypes } from 'sequelize';;
import { BookedRoom, AirPortPickup, Customer, Booking } from '../../models/index.js';

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

// get all airport pickups
async function getAirportPickups(req, res) {
    try {
        const pickups = await AirPortPickup.findAll({
            include: [
                {
                    model: Booking,
                    as: 'booking',
                    include: [{ model: Customer }]
                }
            ],
            order: [['pickup_date', 'ASC'], ['pickup_time', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: pickups
        });
    } catch (error) {
        console.error("Error fetching airport pickups:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// update airport pickup status
async function updateAirportPickupStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'CONFIRMED', 'COMPLETED', 'CANCELLED'
        
        const pickup = await AirPortPickup.findByPk(id);
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: "Airport pickup not found"
            });
        }
        
        pickup.status = status;
        await pickup.save();
        
        return res.status(200).json({
            success: true,
            message: "Airport pickup status updated successfully",
            data: pickup
        });
    } catch (error) {
        console.error("Error updating airport pickup status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// create airport pickup
async function createAirportPickup(req, res) {
    try {
        const { booking_id, pickup_date, pickup_time, passenger_count, pickup_location } = req.body;
        
        const newPickup = await AirPortPickup.create({
            booking_id,
            pickup_date,
            pickup_time,
            passenger_count: passenger_count || 1,
            pickup_location: pickup_location || "Katunayake Airport",
            status: "CONFIRMED"
        });
        
        return res.status(201).json({
            success: true,
            message: "Airport pickup request created successfully",
            data: newPickup
        });
    } catch (error) {
        console.error("Error creating airport pickup:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export { 
    setCheckIn, 
    setCheckOut, 
    getPendingCheckins, 
    getPendingCheckOuts, 
    getAirportPickups, 
    updateAirportPickupStatus, 
    createAirportPickup 
};