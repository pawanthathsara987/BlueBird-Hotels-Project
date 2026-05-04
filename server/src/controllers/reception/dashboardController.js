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



export { getAvailableRooms };