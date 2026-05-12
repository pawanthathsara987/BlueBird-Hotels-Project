import sequelize from './../../config/database.js';
import { QueryTypes } from 'sequelize';

async function getAvailableRooms(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];

        const query = `
            SELECT COUNT(*) AS availableRoom
            FROM room r
            WHERE NOT EXISTS (
                SELECT 1
                FROM booked_rooms br
                WHERE br.room_id = r.id
                AND br.status != 'cancelled'
                AND br.checkIn <= :date
                AND br.checkOut > :date
            )
        `;

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        const availableRoom = result[0]?.availableRoom || 0;

        return res.status(200).json({
            success: true,
            message: "Available rooms fetched successfully",
            data: { availableRoom }
        });

    } catch (error) {
        console.error("Error fetching available rooms:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function todayCheckIns(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];
        const query = 'SELECT COUNT(*) AS checkIns FROM booked_rooms WHERE checkIn = :date AND (status != "checked_out" AND status != "cancelled")';

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        const checkIns = result[0]?.checkIns || 0;

        return res.status(200).json({
            success: true,
            message: "Today's check-ins fetched successfully",
            data: { checkIns }
        });

    } catch (error) {
        console.error('Error fetching today check-ins:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function todayCheckOuts(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];

        const query = `
            SELECT COUNT(*) AS checkOuts
            FROM booked_rooms
            WHERE checkOut = :date
            AND status != 'cancelled'
        `;

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        const checkOuts = result[0]?.checkOuts || 0;

        return res.status(200).json({
            success: true,
            message: "Today's check-outs fetched successfully",
            data: { checkOuts }
        });

    } catch (error) {
        console.error('Error fetching today check-outs:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}   


async function getOccupiedRooms(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];

        const query = `
            SELECT COUNT(DISTINCT br.room_id) AS occupiedRooms
            FROM booked_rooms br
            WHERE br.status = 'checked_in'
            AND br.checkIn <= :date
            AND br.checkOut > :date
        `;

        const result = await sequelize.query(query, {
            replacements: { date },
            type: QueryTypes.SELECT
        });

        const occupiedRooms = result[0]?.occupiedRooms || 0;

        return res.status(200).json({
            success: true,
            message: "Occupied rooms fetched successfully",
            data: { occupiedRooms }
        });

    } catch (error) {
        console.error("Error fetching occupied rooms:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


async function recentCheckins(req, res) {
    try {
        const query = `
            SELECT 
                c.firstName, 
                c.lastName,
                GROUP_CONCAT(r.roomNumber ORDER BY r.roomNumber) AS rooms,
                COUNT(r.roomNumber) AS totalRooms,
                MAX(br.checkIn) AS checkIn
            FROM booked_rooms br
            JOIN reservations res ON br.reservation_id = res.id
            JOIN customer c ON res.guest_id = c.customerId
            JOIN room r ON br.room_id = r.id
            WHERE br.status = 'checked_in'
            GROUP BY c.customerId, c.firstName, c.lastName
            ORDER BY MAX(br.createdAt) ASC
            LIMIT 8
        `;

        const result = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


async function recentCheckouts(req, res) {
    try {
        const query = `
            SELECT 
                c.firstName, 
                c.lastName, 
                br.room_id, 
                br.checkIn, 
                br.checkOut
            FROM booked_rooms br
            JOIN reservations r ON br.reservation_id = r.id
            JOIN customer c ON r.guest_id = c.customerId
            WHERE br.status = 'checked_out'
            ORDER BY br.checkOut ASC
            LIMIT 8
        `;

        const result = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "Recent check-outs fetched successfully",
            data: result
        });

    } catch (error) {
        console.error('Error fetching recent check-outs:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


async function recentBookings(req, res) {
    try {
        const query = `
            SELECT
                r.id AS reservation_id,
                c.firstName,
                c.lastName,
                MIN(br.checkIn) AS checkIn,
                MAX(br.checkOut) AS checkOut,
                COUNT(br.room_id) AS totalRooms,
                GROUP_CONCAT(room.roomNumber ORDER BY room.roomNumber) AS rooms,
                GROUP_CONCAT(DISTINCT br.status) AS roomStatuses,
                MAX(br.createdAt) AS bookedAt
            FROM reservations r
            JOIN booked_rooms br ON r.id = br.reservation_id
            JOIN room ON room.id = br.room_id
            JOIN customer c ON r.guest_id = c.customerId
            WHERE r.status = 'confirmed'
            GROUP BY r.id, c.firstName, c.lastName
            ORDER BY bookedAt ASC
            LIMIT 8
        `;

        const result = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "Recent bookings fetched successfully",
            data: result
        });

    } catch (error) {
        console.error('Error fetching recent bookings:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function checkInGuest(req, res) {
    try {
        const { reservation_id } = req.body;

        const query = `
            UPDATE booked_rooms
            SET status = 'checked_in'
            WHERE reservation_id = :reservation_id
            AND status = 'reserved'
        `;

        await sequelize.query(query, {
            replacements: { reservation_id },
            type: QueryTypes.UPDATE
        });

        return res.status(200).json({
            success: true,
            message: "Guest checked in successfully"
        });

    } catch (error) {
        console.error('Error during check-in:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings, checkInGuest };