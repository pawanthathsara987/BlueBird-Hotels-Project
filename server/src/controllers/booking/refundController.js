import { Booking, BookedRoom, Room, RoomType, AirPortPickup, RoomPayment, BookingRefund, BookingRefundItem, StaffMember, Customer, Policy } from "../../models/index.js";
import { Op } from "sequelize";
import sequelize from "../../config/database.js";

// Helper to generate a unique refund number
async function generateRefundNo() {
    const refundCount = await BookingRefund.count();
    return `REF-${1000 + refundCount + 1}`;
}

// 1. Check Refund Eligibility
export const getRefundEligibility = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user.id; // Enforce customer ownership

        // Fetch booking
        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            include: [
                {
                    model: BookedRoom,
                    as: "bookedRooms",
                    include: [{ model: Room, include: [{ model: RoomType, as: "roomType" }] }]
                },
                {
                    model: AirPortPickup,
                    as: "airportPickup"
                },
                {
                    model: RoomPayment,
                    as: "payments"
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
        }

        // Fetch active policy to get the cancellation threshold dynamically
        const policy = await Policy.findOne({ where: { status: true } });
        const freeCancelDays = policy ? (policy.free_cancellation_days || 7) : 7;
        const cutoffHours = freeCancelDays * 24;

        if (booking.status === "cancelled" || booking.status === "completed") {
            return res.status(400).json({ success: false, message: `Stays with status ${booking.status} are not eligible for refunds` });
        }

        // Calculate amount actually paid
        const totalPaid = booking.payments
            ? booking.payments
                .filter(p => p.status === "success" || p.status === "paid")
                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
            : 0;

        if (totalPaid <= 0) {
            return res.status(400).json({ success: false, message: "No successful payment transaction history found for this booking" });
        }

        // Check already refunded or pending refund items
        const processedRefundItems = await BookingRefundItem.findAll({
            include: [
                {
                    model: BookingRefund,
                    as: "refund",
                    where: {
                        booking_id: bookingId,
                        status: { [Op.in]: ["PENDING", "APPROVED", "COMPLETED"] }
                    }
                }
            ]
        });

        const refundedRoomIds = processedRefundItems
            .filter(item => item.item_type === "ROOM" && item.booked_room_id)
            .map(item => item.booked_room_id);

        const isPickupRefunded = processedRefundItems.some(item => item.item_type === "AIRPORT_PICKUP");

        // Filter eligible rooms (reserved/hold status, not checked-in/out, not already refunded)
        const eligibleRooms = (booking.bookedRooms || [])
            .filter(room =>
                (room.status === "reserved" || room.status === "hold") &&
                !refundedRoomIds.includes(room.id)
            )
            .map(room => {
                // Calculate stay nights for this room
                const checkInDate = new Date(room.checkIn);
                const checkOutDate = new Date(room.checkOut);
                const msPerDay = 1000 * 60 * 60 * 24;
                const nights = Math.max(1, Math.round(Math.abs(checkOutDate - checkInDate) / msPerDay));
                const roomPrice = parseFloat(room.price) || 0;

                // Calculate eligibility window based on policy free cancellation days
                const now = new Date();
                const diffMs = checkInDate - now;
                const diffHrs = diffMs / (1000 * 60 * 60);

                let refundAmount = roomPrice * 0.50; // Deposit paid at booking is 50%
                let penaltyApplied = false;

                if (diffHrs < cutoffHours) {
                    penaltyApplied = true;
                    refundAmount = 0; // No refund allowed if late cancellation
                }

                return {
                    id: room.id,
                    roomNumber: room.Room?.room_number || "TBD",
                    roomType: room.Room?.roomType?.type || "Deluxe Suite",
                    boardType: room.board_type,
                    checkIn: room.checkIn,
                    checkOut: room.checkOut,
                    nights,
                    price: roomPrice,
                    refundAmount,
                    penaltyApplied
                };
            });

        // Filter eligible airport pickup
        let eligibleAirportPickup = null;
        if (booking.airportPickup && booking.airportPickup.status === "CONFIRMED" && !isPickupRefunded) {
            const pickupPrice = parseFloat(booking.airportPickup.price) || 15000;

            // Check earliest check-in for dynamic policy cutoff
            let checkInIsLate = false;
            if (booking.bookedRooms && booking.bookedRooms.length > 0) {
                const checkInDates = booking.bookedRooms.map(r => new Date(r.checkIn));
                const earliestCheckIn = new Date(Math.min(...checkInDates));
                const now = new Date();
                const diffMs = earliestCheckIn - now;
                const diffHrs = diffMs / (1000 * 60 * 60);
                if (diffHrs < cutoffHours) {
                    checkInIsLate = true;
                }
            }

            // Formula: 50% paid - (full room payment - 50% of full room payment)
            const roomsTotalValue = booking.bookedRooms.reduce((sum, r) => sum + parseFloat(r.price), 0);
            const pickupRefundAmount = Math.max(0, totalPaid - (roomsTotalValue - (roomsTotalValue * 0.50)));

            eligibleAirportPickup = {
                id: booking.airportPickup.id,
                pickupDate: booking.airportPickup.pickup_date,
                pickupTime: booking.airportPickup.pickup_time,
                location: booking.airportPickup.pickup_location,
                price: pickupPrice,
                refundAmount: pickupRefundAmount,
                penaltyApplied: false
            };
        }

        // Return details
        res.status(200).json({
            success: true,
            totalPaid,
            bookingTotal: parseFloat(booking.total_price),
            eligibleRooms,
            eligibleAirportPickup
        });

    } catch (error) {
        console.error("Error checking refund eligibility:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Calculate Refund Amounts
export const calculateRefund = async (req, res) => {
    try {
        const { bookingId, rooms, airportPickup } = req.body;
        const customerId = req.user.id;

        // Fetch booking
        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            include: [
                {
                    model: BookedRoom,
                    as: "bookedRooms"
                },
                {
                    model: AirPortPickup,
                    as: "airportPickup"
                },
                {
                    model: RoomPayment,
                    as: "payments"
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
        }

        // Fetch active policy to get the cancellation threshold dynamically
        const policy = await Policy.findOne({ where: { status: true } });
        const freeCancelDays = policy ? (policy.free_cancellation_days || 7) : 7;
        const cutoffHours = freeCancelDays * 24;

        // Calculate amount actually paid
        const totalPaid = booking.payments
            ? booking.payments
                .filter(p => p.status === "success" || p.status === "paid")
                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
            : 0;

        // 1. Calculate original total booking amount of active rooms + pickup before this cancellation
        const activeRooms = booking.bookedRooms.filter(r => r.status !== "cancelled");
        const roomsTotalValue = activeRooms.reduce((sum, r) => sum + parseFloat(r.price), 0);

        let pickupPriceValue = 0;
        if (booking.airportPickup && booking.airportPickup.status !== "CANCELLED") {
            pickupPriceValue = parseFloat(booking.airportPickup.price) || 15000;
        }

        const totalBookingAmount = roomsTotalValue + pickupPriceValue;

        // Check if stay check-in is within policy cutoff days (late cancellation)
        let isLateCancellation = false;
        if (booking.bookedRooms && booking.bookedRooms.length > 0) {
            const checkInDates = booking.bookedRooms.map(r => new Date(r.checkIn));
            const earliestCheckIn = new Date(Math.min(...checkInDates));
            const now = new Date();
            const diffMs = earliestCheckIn - now;
            const diffHrs = diffMs / (1000 * 60 * 60);
            if (diffHrs < cutoffHours) {
                isLateCancellation = true;
            }
        }

        // Determine if all remaining active rooms are being cancelled
        const activeRoomsBefore = booking.bookedRooms.filter(r => r.status !== "cancelled");
        const activeRoomsBeingCancelled = activeRoomsBefore.filter(r => Array.isArray(rooms) && rooms.includes(r.id));
        const isAllRoomsCancelled = activeRoomsBefore.length > 0 && (activeRoomsBeingCancelled.length === activeRoomsBefore.length);

        let shouldCancelPickup = airportPickup;
        if (isAllRoomsCancelled && booking.airportPickup && booking.airportPickup.status === "CONFIRMED") {
            shouldCancelPickup = true;
        }

        // 2. Calculate cancelled amount
        let cancelledRoomsAmount = 0;
        if (Array.isArray(rooms) && rooms.length > 0) {
            const selectedRooms = booking.bookedRooms.filter(r => rooms.includes(r.id));
            for (const room of selectedRooms) {
                cancelledRoomsAmount += parseFloat(room.price) || 0;
            }
        }

        let cancelledPickupAmount = 0;
        if (shouldCancelPickup && booking.airportPickup && booking.airportPickup.status === "CONFIRMED") {
            cancelledPickupAmount = parseFloat(booking.airportPickup.price) || 15000;
        }

        const cancelledAmount = cancelledRoomsAmount + cancelledPickupAmount;

        // Step 1: Calculate remaining value (price of all NOT cancelled items)
        const remaining_value = Math.max(0, totalBookingAmount - cancelledAmount);

        // Step 2: Calculate total cancelled value
        const cancelled_value = cancelledAmount;

        // Step 3: Calculate cancellation fee
        let cancellation_fee = 0;
        if (isLateCancellation && cancelledRoomsAmount > 0) {
            cancellation_fee = cancelledRoomsAmount * 0.50; // Keep deposit of late cancelled rooms
        }

        // Step 4: Calculate final booking value (payable amount after cancellation)
        const final_booking_value = remaining_value + cancellation_fee;

        // Step 5: Calculate refund amount
        let refund_amount = 0;
        if (totalPaid > final_booking_value) {
            refund_amount = totalPaid - final_booking_value;
        }

        // Enforce boundary rules: Refund can NEVER exceed paid amount and cannot be negative
        refund_amount = Math.max(0, Math.min(refund_amount, totalPaid));

        // Calculate remaining payable (if any)
        const remaining_payable = Math.max(0, final_booking_value - totalPaid);

        // Resolve payment status for database synchronization
        let resolvedPaymentStatus = "PAY_AT_CHECKIN";
        if (remaining_payable === 0) {
            if (refund_amount > 0) {
                resolvedPaymentStatus = "REFUND_PENDING";
            } else {
                resolvedPaymentStatus = "FULLY_PAID";
            }
        } else {
            if (totalPaid > 0) {
                resolvedPaymentStatus = "PARTIALLY_PAID";
            } else {
                resolvedPaymentStatus = "PAY_AT_CHECKIN";
            }
        }

        const refundPercentage = cancelled_value > 0
            ? Math.round((refund_amount / cancelled_value) * 100)
            : 0;

        res.status(200).json({
            success: true,
            totalBookingAmount,
            paidAmount: totalPaid,
            cancelledAmount,
            cancellationCharge: cancellation_fee,
            refundAmount: refund_amount,
            remainingPayableAmount: remaining_payable,
            paymentStatus: resolvedPaymentStatus,

            // Required step output values
            total_booking_value: totalBookingAmount,
            cancelled_value,
            remaining_value,
            cancellation_fee,
            final_booking_value,
            paid_amount: totalPaid,
            refund_amount,
            remaining_payable,

            // Legacy client side compatibility keys
            roomTotal: cancelledRoomsAmount,
            airportPickup: cancelledPickupAmount,
            cancellationFee: cancellation_fee,
            refundPercentage,
            totalPaid
        });

    } catch (error) {
        console.error("Error calculating refund:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. Create Refund Request
export const createRefundRequest = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { bookingId, rooms, airportPickup, reason, paymentMethod } = req.body;
        const customerId = req.user.id;

        // Fetch booking
        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            include: [
                { model: BookedRoom, as: "bookedRooms" },
                { model: AirPortPickup, as: "airportPickup" },
                { model: RoomPayment, as: "payments" }
            ],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
        }

        // Fetch active policy to get the cancellation threshold dynamically
        const policy = await Policy.findOne({ where: { status: true }, transaction: t });
        const freeCancelDays = policy ? (policy.free_cancellation_days || 7) : 7;
        const cutoffHours = freeCancelDays * 24;

        // Check if stay check-in is within policy cutoff days (late cancellation)
        let isLateCancellation = false;
        if (booking.bookedRooms && booking.bookedRooms.length > 0) {
            const checkInDates = booking.bookedRooms.map(r => new Date(r.checkIn));
            const earliestCheckIn = new Date(Math.min(...checkInDates));
            const now = new Date();
            const diffMs = earliestCheckIn - now;
            const diffHrs = diffMs / (1000 * 60 * 60);
            if (diffHrs < cutoffHours) {
                isLateCancellation = true;
            }
        }

        // Enforce Rule 4: Check payment total
        const totalPaid = booking.payments
            ? booking.payments
                .filter(p => p.status === "success" || p.status === "paid")
                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
            : 0;

        if (totalPaid <= 0) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Cannot request refund for an unpaid stay reservation" });
        }

        // Duplicate protection check
        const processedRefundItems = await BookingRefundItem.findAll({
            include: [
                {
                    model: BookingRefund,
                    as: "refund",
                    where: {
                        booking_id: bookingId,
                        status: { [Op.in]: ["PENDING", "APPROVED", "COMPLETED"] }
                    }
                }
            ],
            transaction: t
        });

        const refundedRoomIds = processedRefundItems
            .filter(item => item.item_type === "ROOM" && item.booked_room_id)
            .map(item => item.booked_room_id);

        const isPickupRefunded = processedRefundItems.some(item => item.item_type === "AIRPORT_PICKUP");

        // 1. Calculate original total booking amount of active rooms + pickup before this cancellation
        const activeRooms = booking.bookedRooms.filter(r => r.status !== "cancelled");
        const roomsTotalValue = activeRooms.reduce((sum, r) => sum + parseFloat(r.price), 0);

        let pickupPriceValue = 0;
        if (booking.airportPickup && booking.airportPickup.status !== "CANCELLED") {
            pickupPriceValue = parseFloat(booking.airportPickup.price) || 15000;
        }

        const totalBookingAmount = roomsTotalValue + pickupPriceValue;

        // Determine if all remaining active rooms are being cancelled
        const activeRoomsBefore = booking.bookedRooms.filter(r => r.status !== "cancelled");
        const activeRoomsBeingCancelled = activeRoomsBefore.filter(r => Array.isArray(rooms) && rooms.includes(r.id));
        const isAllRoomsCancelled = activeRoomsBefore.length > 0 && (activeRoomsBeingCancelled.length === activeRoomsBefore.length);

        let shouldCancelPickup = airportPickup;
        if (isAllRoomsCancelled && booking.airportPickup && booking.airportPickup.status === "CONFIRMED" && !isPickupRefunded) {
            shouldCancelPickup = true;
        }

        const refundItemsData = [];
        let cancelledRoomsAmount = 0;

        // Validate selected rooms
        if (Array.isArray(rooms) && rooms.length > 0) {
            for (const roomId of rooms) {
                const room = booking.bookedRooms.find(r => r.id === roomId);
                if (!room) {
                    await t.rollback();
                    return res.status(400).json({ success: false, message: `Room ${roomId} does not belong to this booking` });
                }
                if (room.status === "checked_in" || room.status === "checked_out") {
                    await t.rollback();
                    return res.status(400).json({ success: false, message: `Cannot refund checked-in or checked-out room stays` });
                }
                if (refundedRoomIds.includes(roomId)) {
                    await t.rollback();
                    return res.status(400).json({ success: false, message: `Room ${room.Room?.room_number || roomId} has already been refunded` });
                }

                const roomPrice = parseFloat(room.price) || 0;
                cancelledRoomsAmount += roomPrice;

                let itemRefundAmount = roomPrice * 0.50; // Refund 50% deposit if early cancellation
                if (isLateCancellation) {
                    itemRefundAmount = 0; // Late cancellation has 0 refund
                }

                refundItemsData.push({
                    item_type: "ROOM",
                    booked_room_id: roomId,
                    price: roomPrice,
                    refund_amount: itemRefundAmount
                });
            }
        }

        // Validate airport pickup selection
        let cancelledPickupAmount = 0;
        if (shouldCancelPickup) {
            if (!booking.airportPickup || booking.airportPickup.status !== "CONFIRMED") {
                await t.rollback();
                return res.status(400).json({ success: false, message: "Airport pickup transfer not scheduled or active" });
            }
            if (isPickupRefunded) {
                await t.rollback();
                return res.status(400).json({ success: false, message: "Airport pickup has already been refunded" });
            }

            cancelledPickupAmount = parseFloat(booking.airportPickup.price) || 15000;

            // Only refund pickup deposit as cash if the entire booking is cancelled
            const activeRoomsAfterCount = activeRoomsBefore.length - activeRoomsBeingCancelled.length;
            let pickupRefundAmount = 0;
            if (activeRoomsAfterCount === 0) {
                // Entire booking cancelled: refund the pickup deposit as cash
                pickupRefundAmount = Math.max(0, totalPaid - (roomsTotalValue - (roomsTotalValue * 0.50)));
            } else {
                // Active rooms remain: pickup deposit is NOT refunded as cash, it stays to cover the rooms' remaining balance
                pickupRefundAmount = 0;
            }

            refundItemsData.push({
                item_type: "AIRPORT_PICKUP",
                airport_pickup_id: booking.airportPickup.id,
                price: cancelledPickupAmount,
                refund_amount: pickupRefundAmount
            });
        }

        if (refundItemsData.length === 0) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "No eligible rooms or pickup services selected for refund" });
        }

        const cancelledAmount = cancelledRoomsAmount + cancelledPickupAmount;

        // Step 1: Calculate remaining value (price of all NOT cancelled items)
        const remaining_value = Math.max(0, totalBookingAmount - cancelledAmount);

        // Step 2: Calculate total cancelled value
        const cancelled_value = cancelledAmount;

        // Step 3: Calculate cancellation fee
        let cancellation_fee = 0;
        if (isLateCancellation && cancelledRoomsAmount > 0) {
            cancellation_fee = cancelledRoomsAmount * 0.50; // Keep deposit of late cancelled rooms
        }

        // Step 4: Calculate final booking value (payable amount after cancellation)
        const final_booking_value = remaining_value + cancellation_fee;

        // Step 5: Calculate refund amount
        let refund_amount = 0;
        if (totalPaid > final_booking_value) {
            refund_amount = totalPaid - final_booking_value;
        }

        // Enforce boundary rules: Refund can NEVER exceed paid amount and cannot be negative
        refund_amount = Math.max(0, Math.min(refund_amount, totalPaid));

        // Calculate remaining payable (if any)
        const remaining_payable = Math.max(0, final_booking_value - totalPaid);

        // Resolve payment status for database synchronization
        let resolvedPaymentStatus = "PAY_AT_CHECKIN";
        if (remaining_payable === 0) {
            if (refund_amount > 0) {
                resolvedPaymentStatus = "REFUND_PENDING";
            } else {
                resolvedPaymentStatus = "FULLY_PAID";
            }
        } else {
            if (totalPaid > 0) {
                resolvedPaymentStatus = "PARTIALLY_PAID";
            } else {
                resolvedPaymentStatus = "PAY_AT_CHECKIN";
            }
        }

        const refundNo = await generateRefundNo();

        // Create master refund request storing all math variables
        const refundRequest = await BookingRefund.create({
            booking_id: bookingId,
            refund_no: refundNo,
            amount: refund_amount,
            payment_method: paymentMethod || "Card Reversal",
            status: "PENDING",
            reason: reason || "Customer request",
            request_date: new Date(),
            original_booking_amount: totalBookingAmount,
            paid_amount: totalPaid,
            cancelled_room_amount: cancelledAmount,
            cancellation_charge: cancellation_fee,
            remaining_payable_amount: remaining_payable,
            remaining_value: remaining_value,
            final_booking_value: final_booking_value,
            payment_status: resolvedPaymentStatus
        }, { transaction: t });

        // 8. Cancel rooms and pickup in database immediately
        for (const item of refundItemsData) {
            if (item.item_type === "ROOM" && item.booked_room_id) {
                await BookedRoom.update(
                    { status: "cancelled" },
                    { where: { id: item.booked_room_id }, transaction: t }
                );
            } else if (item.item_type === "AIRPORT_PICKUP" && item.airport_pickup_id) {
                await AirPortPickup.update(
                    { status: "CANCELLED" },
                    { where: { id: item.airport_pickup_id }, transaction: t }
                );
            }
        }

        // 9. Count remaining active rooms under this booking
        const activeRoomsCount = await BookedRoom.count({
            where: {
                booking_id: bookingId,
                status: { [Op.notIn]: ["cancelled", "checked_out"] }
            },
            transaction: t
        });

        // 10. Update booking totals and status in database immediately
        const newTotal = final_booking_value;
        let newTax = 0;
        if (booking.tax_percentage > 0) {
            newTax = newTotal * (booking.tax_percentage / 100);
        }

        const updatePayload = {
            total_price: newTotal,
            tax: newTax,
            payment_status: resolvedPaymentStatus
        };

        if (activeRoomsCount === 0) {
            updatePayload.status = "cancelled";

            // Mark pending payments as failed
            await RoomPayment.update(
                { status: "failed" },
                {
                    where: { booking_id: bookingId, status: "pending" },
                    transaction: t
                }
            );
        }

        await booking.update(updatePayload, { transaction: t });

        // Create refund items
        const finalItems = refundItemsData.map(item => ({
            ...item,
            refund_id: refundRequest.id
        }));

        await BookingRefundItem.bulkCreate(finalItems, { transaction: t });

        await t.commit();
        res.status(201).json({
            success: true,
            message: "Refund request submitted successfully and is pending approval",
            data: refundRequest
        });

    } catch (error) {
        await t.rollback();
        console.error("Error creating refund request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. Staff Pending Review API
export const getPendingRefunds = async (req, res) => {
    try {
        const pendingRequests = await BookingRefund.findAll({
            where: { status: "PENDING" },
            include: [
                {
                    model: Booking,
                    as: "booking",
                    include: [
                        { model: Customer, attributes: ["name", "email", "phone"] }
                    ]
                },
                {
                    model: BookingRefundItem,
                    as: "items",
                    include: [
                        { model: BookedRoom, as: "bookedRoom", include: [{ model: Room, attributes: ["room_number"] }] }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({ success: true, data: pendingRequests });
    } catch (error) {
        console.error("Error getting pending refunds:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 5. Staff Process/Action Refund Request (Approve/Reject)
export const actionRefundRequest = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { refundId } = req.params;
        const { status, paymentMethod, transactionRef, reason } = req.body;
        const staffUserId = req.user.userId; // Authenticated staff member

        if (!status || (status !== "APPROVED" && status !== "REJECTED")) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Invalid refund review status action" });
        }

        const refund = await BookingRefund.findOne({
            where: { id: refundId, status: "PENDING" },
            include: [
                { model: BookingRefundItem, as: "items" },
                { model: Booking, as: "booking", include: [{ model: BookedRoom, as: "bookedRooms" }] }
            ],
            transaction: t
        });

        if (!refund) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Pending refund request not found" });
        }

        if (status === "REJECTED") {
            let previousPaymentStatus = "PAY_AT_CHECKIN";
            const paid = parseFloat(refund.paid_amount) || 0;
            const originalVal = parseFloat(refund.original_booking_amount) || 0;
            if (paid >= originalVal) {
                previousPaymentStatus = "FULLY_PAID";
            } else if (paid > 0) {
                previousPaymentStatus = "PARTIALLY_PAID";
            }

            await refund.update({
                status: "REJECTED",
                reason: reason || "Rejected by staff",
                approval_date: new Date(),
                processed_by: staffUserId
            }, { transaction: t });

            await Booking.update({
                payment_status: previousPaymentStatus
            }, {
                where: { id: refund.booking_id },
                transaction: t
            });

            await t.commit();
            return res.status(200).json({ success: true, message: "Refund request successfully rejected" });
        }

        // If Approved/Completed
        await refund.update({
            status: "COMPLETED",
            payment_method: paymentMethod || refund.payment_method,
            transaction_ref: transactionRef || `REF-TXN-${Date.now()}`,
            approval_date: new Date(),
            refund_date: new Date(),
            processed_by: staffUserId
        }, { transaction: t });

        // Resolve final payment status after refund execution
        let finalBookingPaymentStatus = "FULLY_PAID";
        if (refund.amount > 0) {
            finalBookingPaymentStatus = "REFUNDED";
        } else {
            if (refund.remaining_payable_amount > 0) {
                if (parseFloat(refund.paid_amount) > 0) {
                    finalBookingPaymentStatus = "PARTIALLY_PAID";
                } else {
                    finalBookingPaymentStatus = "PAY_AT_CHECKIN";
                }
            } else {
                finalBookingPaymentStatus = "FULLY_PAID";
            }
        }

        // Update the parent Booking's payment_status
        await Booking.update({
            payment_status: finalBookingPaymentStatus
        }, {
            where: { id: refund.booking_id },
            transaction: t
        });

        await t.commit();

        const activeRoomsCount = await BookedRoom.count({
            where: {
                booking_id: refund.booking_id,
                status: { [Op.notIn]: ["cancelled", "checked_out"] }
            }
        });

        res.status(200).json({
            success: true,
            message: "Refund request approved and processed successfully",
            refundedAmount: refund.amount,
            newBookingTotal: refund.booking.total_price,
            bookingStatus: activeRoomsCount === 0 ? "cancelled" : refund.booking.status
        });

    } catch (error) {
        await t.rollback();
        console.error("Error processing refund action:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 6. Retrieve Stays Refund History (Customer side)
export const getBookingRefundHistory = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user.id;

        const refunds = await BookingRefund.findAll({
            where: { booking_id: bookingId },
            include: [
                {
                    model: Booking,
                    as: "booking",
                    where: { customer_id: customerId },
                    attributes: []
                },
                {
                    model: BookingRefundItem,
                    as: "items",
                    include: [
                        { model: BookedRoom, as: "bookedRoom", include: [{ model: Room, attributes: ["room_number"] }] }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({ success: true, data: refunds });
    } catch (error) {
        console.error("Error fetching booking refund history:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 7. Refund Reports API
export const getRefundReports = async (req, res) => {
    try {
        const refunds = await BookingRefund.findAll({
            include: [
                {
                    model: Booking,
                    as: "booking",
                    include: [{ model: Customer, attributes: ["name"] }]
                },
                {
                    model: StaffMember,
                    as: "processedByStaff",
                    attributes: ["name"]
                }
            ]
        });

        res.status(200).json({ success: true, data: refunds });
    } catch (error) {
        console.error("Error getting refund reports:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 7. Get All Pending Refunds categorized by Room, Tour, and Vehicle
export const getAllPendingRefunds = async (req, res) => {
    try {
        // 1. Fetch Room Bookings pending refunds
        const roomRefunds = await BookingRefund.findAll({
            where: { status: "PENDING" },
            include: [
                {
                    model: Booking,
                    as: "booking",
                    include: [
                        { model: Customer, attributes: ["firstName", "lastName", "email", "phoneNumber"] }
                    ]
                },
                {
                    model: BookingRefundItem,
                    as: "items",
                    include: [
                        { model: BookedRoom, as: "bookedRoom", include: [{ model: Room, attributes: ["room_number"] }] }
                    ]
                }
            ]
        });

        // 2. Fetch Tour Bookings pending refunds
        let tourRefunds = [];
        try {
            tourRefunds = await sequelize.query(`
                SELECT tr.*, ti.fullName, ti.email, ti.phone, ti.startDate, t.packageName 
                FROM tour_refunds tr 
                JOIN tour_inquiries ti ON tr.inquiryRef = ti.inquiryRef 
                JOIN tours t ON ti.tourId = t.id 
                WHERE tr.status = 'requested'
            `, { type: sequelize.QueryTypes.SELECT });
        } catch (e) {
            console.warn("tour_refunds table not created or has no data, returning empty array.");
        }

        // 3. Fetch Vehicle Rental Bookings pending refunds
        let vehicleRefunds = [];
        try {
            vehicleRefunds = await sequelize.query(`
                SELECT vr.*, c.firstName, c.lastName, c.email, c.phoneNumber 
                FROM vehicle_refunds vr 
                JOIN vehicle_bookings vb ON vr.bookingId = vb.id 
                JOIN customer c ON vb.customerId = c.id 
                WHERE vr.status = 'PENDING'
            `, { type: sequelize.QueryTypes.SELECT });
        } catch (e) {
            console.warn("vehicle_refunds table not created or has no data, returning empty array.");
        }

        res.status(200).json({
            success: true,
            data: {
                roomRefunds,
                tourRefunds,
                vehicleRefunds
            }
        });
    } catch (error) {
        console.error("Error getting all pending refunds:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 8. Action Categorized Refund Request (Approve/Reject)
export const actionCategoryRefundRequest = async (req, res) => {
    if (req.params.category === "room") {
        return actionRefundRequest(req, res);
    }

    const t = await sequelize.transaction();
    try {
        const { category, refundId } = req.params;
        const { status, paymentMethod, transactionRef, reason, amount } = req.body;

        if (!status || (status !== "APPROVED" && status !== "REJECTED")) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Invalid refund review status action" });
        }

        if (category === "tour") {
            const tourStatus = status === "APPROVED" ? "approved" : "rejected";
            
            const [refund] = await sequelize.query(
                `SELECT * FROM tour_refunds WHERE id = :refundId AND status = 'requested'`,
                { replacements: { refundId }, type: sequelize.QueryTypes.SELECT, transaction: t }
            );

            if (!refund) {
                await t.rollback();
                return res.status(404).json({ success: false, message: "Tour refund request not found" });
            }

            const approvedAmount = (amount !== undefined && !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0)
                ? parseFloat(amount)
                : parseFloat(refund.refundAmount || 0);

            await sequelize.query(
                `UPDATE tour_refunds SET status = :status, refundAmount = :refundAmount, updatedAt = NOW() WHERE id = :refundId`,
                {
                    replacements: { status: tourStatus, refundAmount: approvedAmount, refundId },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction: t
                }
            );

            // Record negative payment entry in tour_payments if tour payments exist
            if (status === "APPROVED" && approvedAmount > 0) {
                try {
                    const paymentNo = `TRF-RCPT-${refund.bookingId}-${Date.now()}`;
                    await sequelize.query(`
                        INSERT INTO tour_payments (
                            inquiry_id, customer_id, payment_no, amount, currency, method, status, createdAt, updatedAt
                        ) VALUES (
                            (SELECT inquiryId FROM tour_bookings WHERE id = :bookingId LIMIT 1),
                            (SELECT customerId FROM tour_inquiries WHERE id = (SELECT inquiryId FROM tour_bookings WHERE id = :bookingId LIMIT 1) LIMIT 1),
                            :paymentNo, :amount, 'LKR', :method, 'success', NOW(), NOW()
                        )
                    `, {
                        replacements: {
                            bookingId: refund.bookingId,
                            paymentNo,
                            amount: -approvedAmount,
                            method: (paymentMethod || 'Cash').toLowerCase()
                        },
                        type: sequelize.QueryTypes.INSERT,
                        transaction: t
                    });
                } catch (pe) {
                    console.error("Error creating tour payment entry:", pe);
                }
            }
        } else if (category === "vehicle") {
            const vehicleStatus = status === "APPROVED" ? "APPROVED" : "REJECTED";

            const [refund] = await sequelize.query(
                `SELECT * FROM vehicle_refunds WHERE id = :refundId AND status = 'PENDING'`,
                { replacements: { refundId }, type: sequelize.QueryTypes.SELECT, transaction: t }
            );

            if (!refund) {
                await t.rollback();
                return res.status(404).json({ success: false, message: "Vehicle refund request not found" });
            }

            const approvedAmount = (amount !== undefined && !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0)
                ? parseFloat(amount)
                : parseFloat(refund.refundAmount || 0);

            await sequelize.query(
                `UPDATE vehicle_refunds SET status = :status, refundAmount = :refundAmount, updatedAt = NOW() WHERE id = :refundId`,
                {
                    replacements: { status: vehicleStatus, refundAmount: approvedAmount, refundId },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction: t
                }
            );

            // Record negative payment entry in vehicle payments if they exist
            if (status === "APPROVED" && approvedAmount > 0) {
                try {
                    const paymentNo = `VRF-RCPT-${refund.bookingId}-${Date.now()}`;
                    await sequelize.query(`
                        INSERT INTO vehicle_payment (
                            booking_id, customer_id, payment_no, amount, currency, method, status, createdAt, updatedAt
                        ) VALUES (
                            :bookingId, (SELECT customerId FROM vehicle_bookings WHERE id = :bookingId LIMIT 1), :paymentNo, :amount, 'LKR', :method, 'success', NOW(), NOW()
                        )
                    `, {
                        replacements: {
                            bookingId: refund.bookingId,
                            paymentNo,
                            amount: -approvedAmount,
                            method: (paymentMethod || 'Cash').toLowerCase()
                        },
                        type: sequelize.QueryTypes.INSERT,
                        transaction: t
                    });
                } catch (pe) {
                    console.error("Error creating vehicle payment entry:", pe);
                }
            }
        }

        await t.commit();
        res.status(200).json({ success: true, message: `Refund successfully processed` });
    } catch (err) {
        await t.rollback();
        console.error("Error actioning category refund:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
