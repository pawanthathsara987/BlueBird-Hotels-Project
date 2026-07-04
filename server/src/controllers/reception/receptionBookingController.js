import sequelize from '../../config/database.js';
import { QueryTypes } from 'sequelize';;
import { BookedRoom, AirPortPickup, Customer, Booking, RoomPayment, Room } from '../../models/index.js';

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
            WHERE b.status != 'cancelled'
            AND br.status = 'reserved'
            GROUP BY b.id, c.firstName, c.lastName
            ORDER BY MIN(br.checkIn) ASC
        `;

        const result = await sequelize.query(query, {
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
                b.id AS booking_id,
                br.id AS booked_room_id,
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
            ORDER BY br.checkOut ASC
        `;

        const result = await sequelize.query(query, {
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

// get upcoming airport pickup alerts (1 day before & 6 hours before)
async function getPickupAlerts(req, res) {
    try {
        const now = new Date();

        // Fetch all CONFIRMED pickups
        const pickups = await AirPortPickup.findAll({
            where: { status: 'CONFIRMED' },
            include: [
                {
                    model: Booking,
                    as: 'booking',
                    include: [{ model: Customer }]
                }
            ],
            order: [['pickup_date', 'ASC'], ['pickup_time', 'ASC']]
        });

        const alerts = [];

        for (const pickup of pickups) {
            // Combine pickup_date + pickup_time into a single JS Date
            const pickupDateTimeStr = `${pickup.pickup_date}T${pickup.pickup_time}`;
            const pickupDT = new Date(pickupDateTimeStr);

            if (isNaN(pickupDT.getTime())) continue;

            const diffMs = pickupDT - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            // Already passed — skip
            if (diffHours < 0) continue;

            const guestName = pickup.booking?.Customer
                ? `${pickup.booking.Customer.firstName} ${pickup.booking.Customer.lastName}`
                : 'Guest';

            // 6-hour urgent alert
            if (diffHours <= 6) {
                alerts.push({
                    id: pickup.id,
                    type: '6h',
                    urgency: 'urgent',
                    guestName,
                    pickup_date: pickup.pickup_date,
                    pickup_time: pickup.pickup_time,
                    pickup_location: pickup.pickup_location,
                    passenger_count: pickup.passenger_count,
                    hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
                    message: `🚨 Pickup in ${diffHours < 1 ? Math.round(diffMs / 60000) + ' min' : Math.round(diffHours * 10) / 10 + 'h'} — ${guestName} from ${pickup.pickup_location}`
                });
                // 24-hour advance alert
            } else if (diffHours <= 24) {
                alerts.push({
                    id: pickup.id,
                    type: '24h',
                    urgency: 'warning',
                    guestName,
                    pickup_date: pickup.pickup_date,
                    pickup_time: pickup.pickup_time,
                    pickup_location: pickup.pickup_location,
                    passenger_count: pickup.passenger_count,
                    hoursRemaining: Math.round(diffHours * 10) / 10,
                    message: `⏰ Tomorrow's pickup — ${guestName} at ${pickup.pickup_time} from ${pickup.pickup_location}`
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Error fetching pickup alerts:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// Get full check-in details for a booking (customer info + payment breakdown)
async function getCheckInDetails(req, res) {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Customer },
                {
                    model: BookedRoom,
                    as: 'bookedRooms',
                    include: [{ model: Room }]
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Fetch all successful payments for this booking
        const payments = await RoomPayment.findAll({
            where: { booking_id: bookingId },
            order: [['createdAt', 'ASC']]
        });

        const totalPrice = parseFloat(booking.total_price) || 0;
        const totalPaid = payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const balanceDue = Math.max(0, totalPrice - totalPaid);

        return res.status(200).json({
            success: true,
            data: {
                booking: {
                    id: booking.id,
                    bookingNo: booking.bookingNo,
                    status: booking.status,
                    payment_status: booking.payment_status,
                    total_price: totalPrice,
                    tax: booking.tax,
                    tax_percentage: booking.tax_percentage,
                    note: booking.note,
                    kids_age: booking.kids_age,
                    createdAt: booking.createdAt
                },
                customer: booking.Customer,
                bookedRooms: booking.bookedRooms,
                payments: payments.map(p => ({
                    id: p.id,
                    payment_no: p.payment_no,
                    amount: parseFloat(p.amount),
                    currency: p.currency,
                    method: p.method,
                    status: p.status,
                    createdAt: p.createdAt
                })),
                paymentSummary: {
                    totalPrice,
                    totalPaid,
                    balanceDue
                }
            }
        });
    } catch (error) {
        console.error('Error fetching check-in details:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Record a manual (cash/card at reception) payment for a booking
async function recordManualPayment(req, res) {
    try {
        const { bookingId } = req.params;
        const { amount, method, note } = req.body;

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
        }

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Generate a unique payment number
        const paymentNo = `RCPT-${bookingId}-${Date.now()}`;

        const payment = await RoomPayment.create({
            booking_id: parseInt(bookingId),
            customer_id: booking.customer_id,
            payment_no: paymentNo,
            amount: parseFloat(amount),
            currency: 'LKR',
            method: method || 'cash',
            status: 'success',
            raw_payload: { note: note || 'Recorded by reception at check-in', recorded_by: 'reception' }
        });

        // Recalculate total paid
        const payments = await RoomPayment.findAll({
            where: { booking_id: bookingId, status: 'success' }
        });
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalPrice = parseFloat(booking.total_price) || 0;

        // Update booking payment_status
        if (totalPaid >= totalPrice) {
            booking.payment_status = 'FULLY_PAID';
        } else {
            booking.payment_status = 'PARTIALLY_PAID';
        }
        await booking.save();

        return res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                payment,
                paymentSummary: {
                    totalPrice,
                    totalPaid,
                    balanceDue: Math.max(0, totalPrice - totalPaid)
                }
            }
        });
    } catch (error) {
        console.error('Error recording manual payment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export {
    setCheckIn,
    setCheckOut,
    getPendingCheckins,
    getPendingCheckOuts,
    getAirportPickups,
    updateAirportPickupStatus,
    createAirportPickup,
    getPickupAlerts,
    getCheckInDetails,
    recordManualPayment
};