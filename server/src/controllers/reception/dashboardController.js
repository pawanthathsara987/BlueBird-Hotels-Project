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
                FROM booking_room br
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
        const query = 'SELECT COUNT(*) AS checkIns FROM booking_room WHERE checkIn = :date AND (status != "checked_out" AND status != "cancelled")';

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
        const query = 'SELECT COUNT(*) AS checkOuts FROM booking_room WHERE checkOut = :date AND status = "checked_out"';

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


async function getocuupiedRooms(req, res) {
    try {
        const date = new Date().toISOString().split('T')[0];
        const query = 'SELECT COUNT(*) AS occupiedRooms FROM booking_room WHERE checkIn <= :date AND checkOut > :date AND status = "checked_in"';

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


export { getAvailableRooms, todayCheckIns, todayCheckOuts, getocuupiedRooms };