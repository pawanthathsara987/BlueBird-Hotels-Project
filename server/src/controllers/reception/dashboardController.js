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
                AND DATE(br.checkIn) <= :date
                AND DATE(br.checkOut) > :date
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
        const query = 'SELECT COUNT(*) AS checkIns FROM booked_rooms WHERE checkIn = :date AND (status != \'checked_out\' AND status != \'cancelled\')';

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
            AND DATE(br.checkIn) <= :date
            AND DATE(br.checkOut) > :date
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
                GROUP_CONCAT(r.room_number ORDER BY r.room_number) AS rooms,
                COUNT(r.room_number) AS totalRooms,
                MAX(br.checkIn) AS checkIn
            FROM booked_rooms br
            JOIN booking res ON br.booking_id = res.id
            JOIN customer c ON res.customer_id = c.id
            JOIN room r ON br.room_id = r.id
            WHERE br.status = 'checked_in'
            GROUP BY c.id, c.firstName, c.lastName
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
            JOIN booking r ON br.booking_id = r.id
            JOIN customer c ON r.customer_id = c.id
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
                GROUP_CONCAT(room.room_number ORDER BY room.room_number) AS rooms,
                GROUP_CONCAT(DISTINCT br.status) AS roomStatuses,
                MAX(br.createdAt) AS bookedAt
            FROM booking r
            JOIN booked_rooms br ON r.id = br.booking_id
            JOIN room ON room.id = br.room_id
            JOIN customer c ON r.customer_id = c.id
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
            WHERE booking_id = :reservation_id
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

async function getDashboardDetails(req, res) {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];

        // 1. Room stats counts
        const totalRoomsRes = await sequelize.query("SELECT COUNT(*) AS total FROM room", { type: QueryTypes.SELECT });
        const totalRoomsCount = totalRoomsRes[0]?.total || 0;

        const cleanVacantRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'available'", { type: QueryTypes.SELECT });
        const cleanVacant = cleanVacantRes[0]?.count || 0;

        const dirtyVacantRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'maintenance'", { type: QueryTypes.SELECT });
        const dirtyVacant = dirtyVacantRes[0]?.count || 0;

        const occupiedRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'occupied'", { type: QueryTypes.SELECT });
        const occupied = occupiedRes[0]?.count || 0;

        const occupancyRate = totalRoomsCount > 0 ? Math.round((occupied / totalRoomsCount) * 100) : 0;

        // 2. All rooms with occupancy details
        const roomsQuery = `
            SELECT 
                r.id,
                r.room_number,
                r.status,
                r.floor,
                rt.type AS room_type_name,
                c.firstName AS guest_first_name,
                c.lastName AS guest_last_name,
                br.checkOut AS checkout_date
            FROM room r
            LEFT JOIN room_type rt ON r.room_type_id = rt.id
            LEFT JOIN booked_rooms br ON r.id = br.room_id AND br.status = 'checked_in'
            LEFT JOIN booking res ON br.booking_id = res.id
            LEFT JOIN customer c ON res.customer_id = c.id
            ORDER BY r.room_number ASC
        `;
        const rooms = await sequelize.query(roomsQuery, { type: QueryTypes.SELECT });

        // 3. Today's Arrivals
        const arrivalsQuery = `
            SELECT
                res.id AS booking_id,
                c.firstName,
                c.lastName,
                MIN(br.checkIn) AS checkIn,
                COUNT(br.room_id) AS totalRooms,
                GROUP_CONCAT(r.room_number ORDER BY r.room_number) AS rooms
            FROM booking res
            JOIN booked_rooms br ON res.id = br.booking_id
            JOIN room r ON br.room_id = r.id
            JOIN customer c ON res.customer_id = c.id
            WHERE res.status = 'confirmed'
            AND br.status = 'reserved'
            AND DATE(br.checkIn) = :dateStr
            GROUP BY res.id, c.firstName, c.lastName
            ORDER BY res.createdAt ASC
        `;
        const todayArrivals = await sequelize.query(arrivalsQuery, {
            replacements: { dateStr },
            type: QueryTypes.SELECT
        });

        // 4. Today's Departures
        const departuresQuery = `
            SELECT
                br.id AS booking_id,
                res.id AS reservation_id,
                c.firstName,
                c.lastName,
                br.room_id,
                r.room_number AS room_number,
                br.checkOut,
                br.status,
                res.total_price AS total_amount,
                DATEDIFF(br.checkOut, br.checkIn) AS nights
            FROM booked_rooms br
            JOIN booking res ON br.booking_id = res.id
            JOIN customer c ON res.customer_id = c.id
            JOIN room r ON br.room_id = r.id
            WHERE br.status = 'checked_in'
            AND DATE(br.checkOut) = :dateStr
            ORDER BY br.checkOut ASC
        `;
        const todayDepartures = await sequelize.query(departuresQuery, {
            replacements: { dateStr },
            type: QueryTypes.SELECT
        });

        // 5. Walk-in Details (pricing and count)
        const walkinQuery = `
            SELECT 
                rt.id AS room_type_id,
                rt.type AS room_type_name,
                (SELECT COUNT(*) FROM room r WHERE r.room_type_id = rt.id AND r.status = 'available') AS available_count,
                COALESCE((SELECT price FROM room_price rp WHERE rp.roomTypeId = rt.id LIMIT 1), 6500) AS price_per_night
            FROM room_type rt
        `;
        const walkinDetails = await sequelize.query(walkinQuery, { type: QueryTypes.SELECT });

        // 6. 7-Day Quick Availability Calendar
        const availabilityCalendar = [];
        const roomTypes = await sequelize.query("SELECT id, type FROM room_type", { type: QueryTypes.SELECT });

        for (let i = 0; i < 7; i++) {
            const dateObj = new Date(dateStr);
            dateObj.setDate(dateObj.getDate() + i);
            const currentDateStr = dateObj.toISOString().split('T')[0];
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayMonth = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            const dayObj = {
                dayName,
                dayMonth,
                dateStr: currentDateStr,
                availabilities: {}
            };

            for (const rt of roomTypes) {
                const availQuery = `
                    SELECT COUNT(*) AS count
                    FROM room r
                    WHERE r.room_type_id = :roomTypeId
                    AND NOT EXISTS (
                        SELECT 1
                        FROM booked_rooms br
                        WHERE br.room_id = r.id
                        AND br.status != 'cancelled'
                        AND br.checkIn <= :currentDateStr
                        AND br.checkOut > :currentDateStr
                    )
                `;
                const result = await sequelize.query(availQuery, {
                    replacements: { roomTypeId: rt.id, currentDateStr },
                    type: QueryTypes.SELECT
                });
                dayObj.availabilities[rt.type] = result[0]?.count || 0;
            }
            availabilityCalendar.push(dayObj);
        }

        return res.status(200).json({
            success: true,
            data: {
                counts: {
                    totalRooms: totalRoomsCount,
                    cleanVacant,
                    dirtyVacant,
                    occupied,
                    occupancyRate
                },
                rooms,
                todayArrivals,
                todayDepartures,
                walkinDetails,
                availabilityCalendar
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getAnalyticsSummary(req, res) {
    try {
        const totalRoomsRes = await sequelize.query("SELECT COUNT(*) AS total FROM room", { type: QueryTypes.SELECT });
        const totalRooms = totalRoomsRes[0]?.total !== undefined ? Number(totalRoomsRes[0].total) : 0;

        const availableRoomsRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'available'", { type: QueryTypes.SELECT });
        const available = availableRoomsRes[0]?.count !== undefined ? Number(availableRoomsRes[0].count) : 0;

        const occupiedRoomsRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'occupied'", { type: QueryTypes.SELECT });
        const occupied = occupiedRoomsRes[0]?.count !== undefined ? Number(occupiedRoomsRes[0].count) : 0;

        const maintenanceRoomsRes = await sequelize.query("SELECT COUNT(*) AS count FROM room WHERE status = 'maintenance'", { type: QueryTypes.SELECT });
        const maintenance = maintenanceRoomsRes[0]?.count !== undefined ? Number(maintenanceRoomsRes[0].count) : 0;

        const totalBookingsRes = await sequelize.query("SELECT COUNT(*) AS total FROM booking WHERE status = 'confirmed'", { type: QueryTypes.SELECT });
        const totalBookings = totalBookingsRes[0]?.total !== undefined ? Number(totalBookingsRes[0].total) : 0;

        const totalRevenueRes = await sequelize.query("SELECT SUM(total_price) AS total FROM booking WHERE status = 'confirmed'", { type: QueryTypes.SELECT });
        const totalRevenue = totalRevenueRes[0]?.total !== null && totalRevenueRes[0]?.total !== undefined ? Number(totalRevenueRes[0].total) : 0;

        // Generate weekly trend data (last 7 days)
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - i);
            const dateStr = dateObj.toISOString().split('T')[0];
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            const activeRoomsRes = await sequelize.query(`
                SELECT COUNT(DISTINCT room_id) AS activeCount
                FROM booked_rooms
                WHERE status != 'cancelled'
                AND DATE(checkIn) <= :dateStr
                AND DATE(checkOut) > :dateStr
            `, {
                replacements: { dateStr },
                type: QueryTypes.SELECT
            });
            const activeCount = Number(activeRoomsRes[0]?.activeCount) || 0;
            const occupancy = totalRooms > 0 ? Math.round((activeCount / totalRooms) * 100) : 0;

            const dayBookingsRes = await sequelize.query(`
                SELECT COUNT(DISTINCT booking_id) AS bookingsCount
                FROM booked_rooms
                WHERE status != 'cancelled'
                AND DATE(checkIn) = :dateStr
            `, {
                replacements: { dateStr },
                type: QueryTypes.SELECT
            });
            const bookings = Number(dayBookingsRes[0]?.bookingsCount) || 0;

            weeklyTrend.push({
                day: dayName,
                occupancy,
                bookings
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalRevenue,
                roomsStats: { total: totalRooms, available, occupied, maintenance },
                weeklyTrend
            }
        });
    } catch (error) {
        console.error("Error generating analytics summary:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getDailyReport(req, res) {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const bookingsQuery = `
            SELECT
                bk.id AS reservation_id,
                c.firstName,
                c.lastName,
                bk.status AS bookingStatus,
                bk.total_price,
                MIN(br.checkIn) AS checkIn,
                MAX(br.checkOut) AS checkOut,
                GROUP_CONCAT(room.room_number ORDER BY room.room_number) AS rooms,
                GROUP_CONCAT(DISTINCT br.status) AS roomStatuses,
                bk.createdAt AS bookedAt
            FROM booking bk
            JOIN booked_rooms br ON bk.id = br.booking_id
            JOIN room ON room.id = br.room_id
            JOIN customer c ON bk.customer_id = c.id
            WHERE DATE(bk.createdAt) = :date
            GROUP BY bk.id, c.firstName, c.lastName, bk.status, bk.total_price, bk.createdAt
            ORDER BY bk.createdAt DESC
        `;

        const summaryQuery = `
            SELECT
                COUNT(*) AS totalBookings,
                COALESCE(SUM(total_price), 0) AS totalRevenue,
                COALESCE(AVG(total_price), 0) AS avgRevenue
            FROM booking
            WHERE DATE(createdAt) = :date
        `;

        const checkInsQuery = `SELECT COUNT(*) AS count FROM booked_rooms WHERE checkIn = :date AND status != 'cancelled'`;
        const checkOutsQuery = `SELECT COUNT(*) AS count FROM booked_rooms WHERE checkOut = :date AND status != 'cancelled'`;

        const [bookings, summary, checkIns, checkOuts] = await Promise.all([
            sequelize.query(bookingsQuery, { replacements: { date }, type: QueryTypes.SELECT }),
            sequelize.query(summaryQuery, { replacements: { date }, type: QueryTypes.SELECT }),
            sequelize.query(checkInsQuery, { replacements: { date }, type: QueryTypes.SELECT }),
            sequelize.query(checkOutsQuery, { replacements: { date }, type: QueryTypes.SELECT }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                date,
                bookings,
                totalBookings: Number(summary[0]?.totalBookings) || 0,
                totalRevenue: Number(summary[0]?.totalRevenue) || 0,
                avgRevenue: Number(summary[0]?.avgRevenue) || 0,
                todayCheckIns: Number(checkIns[0]?.count) || 0,
                todayCheckOuts: Number(checkOuts[0]?.count) || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching daily report:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function getMonthlyReport(req, res) {
    try {
        const year = req.query.year || new Date().getFullYear();
        const month = req.query.month || (new Date().getMonth() + 1);
        const monthStr = String(month).padStart(2, '0');
        const monthPrefix = `${year}-${monthStr}`;

        const dailyBreakdownQuery = `
            SELECT
                DATE(createdAt) AS date,
                COUNT(*) AS bookings,
                COALESCE(SUM(total_price), 0) AS revenue
            FROM booking
            WHERE DATE_FORMAT(createdAt, '%Y-%m') = :monthPrefix
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `;

        const summaryQuery = `
            SELECT
                COUNT(*) AS totalBookings,
                COALESCE(SUM(total_price), 0) AS totalRevenue,
                COALESCE(AVG(total_price), 0) AS avgRevenue,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
            FROM booking
            WHERE DATE_FORMAT(createdAt, '%Y-%m') = :monthPrefix
        `;

        const bookingsListQuery = `
            SELECT
                bk.id AS reservation_id,
                c.firstName,
                c.lastName,
                bk.status AS bookingStatus,
                bk.total_price,
                MIN(br.checkIn) AS checkIn,
                MAX(br.checkOut) AS checkOut,
                GROUP_CONCAT(room.room_number ORDER BY room.room_number) AS rooms,
                GROUP_CONCAT(DISTINCT br.status) AS roomStatuses,
                bk.createdAt AS bookedAt
            FROM booking bk
            JOIN booked_rooms br ON bk.id = br.booking_id
            JOIN room ON room.id = br.room_id
            JOIN customer c ON bk.customer_id = c.id
            WHERE DATE_FORMAT(bk.createdAt, '%Y-%m') = :monthPrefix
            GROUP BY bk.id, c.firstName, c.lastName, bk.status, bk.total_price, bk.createdAt
            ORDER BY bk.createdAt DESC
        `;

        const [dailyBreakdown, summary, bookings] = await Promise.all([
            sequelize.query(dailyBreakdownQuery, { replacements: { monthPrefix }, type: QueryTypes.SELECT }),
            sequelize.query(summaryQuery, { replacements: { monthPrefix }, type: QueryTypes.SELECT }),
            sequelize.query(bookingsListQuery, { replacements: { monthPrefix }, type: QueryTypes.SELECT }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                year: Number(year),
                month: Number(month),
                dailyBreakdown,
                bookings,
                totalBookings: Number(summary[0]?.totalBookings) || 0,
                totalRevenue: Number(summary[0]?.totalRevenue) || 0,
                avgRevenue: Number(summary[0]?.avgRevenue) || 0,
                confirmed: Number(summary[0]?.confirmed) || 0,
                cancelled: Number(summary[0]?.cancelled) || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export {
    getAvailableRooms,
    todayCheckIns,
    todayCheckOuts,
    getOccupiedRooms,
    recentCheckins,
    recentCheckouts,
    recentBookings,
    checkInGuest,
    getDashboardDetails,
    getAnalyticsSummary,
    getDailyReport,
    getMonthlyReport
};