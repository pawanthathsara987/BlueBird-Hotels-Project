import sequelize from './../../config/database.js';
import { QueryTypes } from 'sequelize';

async function getAvailableRooms(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];

        const query = `
            SELECT COUNT(*) AS availableRoom
            FROM room r
            WHERE r.roomStatus = 'available'
            AND NOT EXISTS (
                SELECT 1
                FROM booked_rooms br
                WHERE br.roomId = r.id
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
            message: availableRoom > 0
                ? "Available rooms fetched successfully"
                : "No available rooms found",
            data: { availableRoom }
        });

    } catch (error) {
        console.error('Error fetching available rooms:', error);

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
        const query = 'SELECT COUNT(*) AS checkOuts FROM booked_rooms WHERE checkOut = :date AND status = "checked_out"';

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
        const query = 'SELECT COUNT(*) AS occupiedRooms FROM booked_rooms WHERE checkIn <= :date AND checkOut > :date AND status = "checked_in"';

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
        console.error('Error fetching occupied rooms:', error);

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
                br.room_id, 
                br.checkIn, 
                br.checkOut
            FROM booked_rooms br
            JOIN reservations r ON br.reservation_id = r.id
            JOIN customer c ON r.guest_id = c.customerId
            WHERE br.status = 'checked_in'
            ORDER BY br.checkIn DESC
            LIMIT 8
        `;

        const result = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "Recent check-ins fetched successfully",
            data: result
        });

    } catch (error) {
        console.error('Error fetching recent check-ins:', error);

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
            ORDER BY br.checkOut DESC
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
                c.firstName,
                c.lastName,
                br.room_id,
                br.reservation_id,
                br.status,
                br.checkIn,
                br.checkOut,
                br.createdAt AS bookedAt
            FROM booked_rooms br
            JOIN reservations r ON br.reservation_id = r.id
            JOIN customer c ON r.guest_id = c.customerId
            ORDER BY br.createdAt DESC
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

export { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings };