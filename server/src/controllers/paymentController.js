import crypto from 'crypto';
import sequelize from '../config/database.js';
import { Reservation, Customer, BookedRoom, Room, RoomType, RoomPayment, AirPortPickup, VehicleBooking, Payment, TourInquiry, Tour, TourPayment, CustomerWallet, WalletTransaction } from "../models/index.js";
import { sendBookingConfirmationEmail, sendPersonalRequestEmail } from "../services/emailService.js";

// Helper to generate MD5 hash
const md5 = (string) => {
    return crypto.createHash('md5').update(string).digest('hex');
};

/**
 * Generate secure PayHere checkout signature hash entirely on the server
 */
export const generatePayHereHash = async (req, res) => {
    try {
        const { orderId, amount, currency } = req.body;

        if (!orderId || !amount || !currency) {
            return res.status(400).json({
                success: false,
                message: "orderId, amount, and currency are required"
            });
        }

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            return res.status(500).json({
                success: false,
                message: "PayHere server credentials are not configured"
            });
        }

        // Format amount strictly to 2 decimal places (e.g. 100.00)
        const formattedAmount = Number(amount).toFixed(2);

        // Calculate hashing variables
        const secretMd5Upper = md5(merchantSecret).toUpperCase();
        const rawString = merchantId + orderId + formattedAmount + currency + secretMd5Upper;
        const finalHash = md5(rawString).toUpperCase();

        return res.status(200).json({
            success: true,
            hash: finalHash,
            merchantId
        });

    } catch (error) {
        console.error("❌ Generate PayHere Hash Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate security signature hash",
            error: error.message
        });
    }
};

/**
 * Public asynchronous webhook receiver to confirm PayHere payments
 */
export const handlePayHereNotification = async (req, res) => {
    try {
        // Parse PayHere callback fields
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = req.body;

        console.log(`[PAYHERE WEBHOOK] Received callback for Order #${order_id}, Payment ID: ${payment_id}, Status: ${status_code}`);

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
        if (!merchantSecret) {
            console.error("[PAYHERE ERROR] Merchant secret not configured in server environment!");
            return res.status(500).send("Server configuration error");
        }

        // 1. Recalculate local verification signature
        const secretMd5Upper = md5(merchantSecret).toUpperCase();
        const rawString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretMd5Upper;
        const localSig = md5(rawString).toUpperCase();

        // 2. Validate webhook source
        if (localSig !== md5sig) {
            console.warn(`[PAYHERE WARNING] Invalid signature mismatch! Received: ${md5sig}, Calculated: ${localSig}`);
            return res.status(400).send("Signature verification failed");
        }

        // 3. Process payment status
        // PayHere Sandbox success code is 2
        if (Number(status_code) === 2) {
            const isTour = String(order_id).startsWith("TOUR_");
            const isVehicle = String(order_id).startsWith("VEHICLE_");
            let booking;
            let expectedAmount;
            let actualOrderId = order_id;

            if (isTour) {
                actualOrderId = String(order_id).replace("TOUR_", "");
                booking = await TourInquiry.findByPk(actualOrderId, { include: [{ model: Tour }] });
                if (!booking) {
                    console.warn(`[PAYHERE WARNING] Tour Inquiry ID #${actualOrderId} not found.`);
                    return res.status(404).send("Tour Inquiry not found");
                }
                expectedAmount = Number((Number(booking.Tour.price) * booking.numberOfAdults * 0.5).toFixed(2));
            } else if (isVehicle) {
                actualOrderId = String(order_id).replace("VEHICLE_", "");
                booking = await VehicleBooking.findByPk(actualOrderId);
                if (!booking) {
                    console.warn(`[PAYHERE WARNING] Vehicle Booking ID #${actualOrderId} not found.`);
                    return res.status(404).send("Vehicle Booking not found");
                }
                expectedAmount = Number((Number(booking.depositAmount)).toFixed(2));
            } else {
                booking = await Reservation.findByPk(actualOrderId);
                if (!booking) {
                    console.warn(`[PAYHERE WARNING] Booking ID #${actualOrderId} not found.`);
                    return res.status(404).send("Booking not found");
                }
                expectedAmount = Number((Number(booking.total_price) * 0.5).toFixed(2));
            }

            // Verify payment currency matches LKR
            if (payhere_currency !== "LKR") {
                console.warn(`[PAYHERE WARNING] Currency mismatch for Order #${order_id}.`);
                return res.status(400).send("Currency verification failed");
            }

            // Verify payment amount matches 50% advance
            const receivedAmount = Number(parseFloat(payhere_amount).toFixed(2));
            if (Math.abs(receivedAmount - expectedAmount) > 0.05) {
                console.warn(`[PAYHERE WARNING] Payment amount mismatch for Order #${order_id}. Expected: ${expectedAmount}, Received: ${receivedAmount}`);
                return res.status(400).send("Payment amount verification failed");
            }

            if (isTour) {
                try {
                    if (booking.status === "progress") {
                        console.log(`[PAYHERE SUCCESS] Tour #${actualOrderId} verified. Updating status to accepted.`);
                        await booking.update({ status: "accepted" });
                    }

                    // 1. Create or update tour_bookings record
                    const [existingTourBooking] = await sequelize.query(
                        'SELECT id FROM tour_bookings WHERE inquiryId = :inquiryId LIMIT 1',
                        {
                            replacements: { inquiryId: Number(actualOrderId) },
                            type: sequelize.QueryTypes.SELECT
                        }
                    );

                    const discountPercentage = Number(booking.Tour.discount || 0);
                    const originalPrice = Number(booking.Tour.price || 0);
                    const discountedPrice = discountPercentage > 0
                        ? originalPrice - (originalPrice * discountPercentage / 100)
                        : originalPrice;

                    const totalAmount = Number((discountedPrice * booking.numberOfAdults).toFixed(2));
                    const depositAmount = receivedAmount;
                    const remainingAmount = Number((totalAmount - depositAmount).toFixed(2));

                    if (!existingTourBooking) {
                        const trackingToken = crypto.randomBytes(16).toString("hex");
                        const cleanInquiryRef = (booking.inquiryRef || String(actualOrderId)).replace(/^TI-/, '');
                        const bookingRef = `TB-${cleanInquiryRef}`;

                        await sequelize.query(
                            `INSERT INTO tour_bookings (bookingRef, inquiryId, tourStartDate, totalAmount, depositAmount, remainingAmount, status, trackingToken, acceptedAt, createdAt, updatedAt) 
                             VALUES (:bookingRef, :inquiryId, :tourStartDate, :totalAmount, :depositAmount, :remainingAmount, :status, :trackingToken, NOW(), NOW(), NOW())`,
                            {
                                replacements: {
                                    bookingRef,
                                    inquiryId: Number(actualOrderId),
                                    tourStartDate: booking.startDate,
                                    totalAmount,
                                    depositAmount,
                                    remainingAmount,
                                    status: 'half_paid',
                                    trackingToken
                                }
                            }
                        );
                        console.log(`[PAYHERE SUCCESS] Tour booking record created in tour_bookings for Order #${order_id}.`);
                    } else {
                        await sequelize.query(
                            `UPDATE tour_bookings SET status = 'half_paid', depositAmount = :depositAmount, remainingAmount = :remainingAmount, updatedAt = NOW() WHERE inquiryId = :inquiryId`,
                            {
                                replacements: {
                                    inquiryId: Number(actualOrderId),
                                    depositAmount,
                                    remainingAmount
                                }
                            }
                        );
                    }

                    // 2. Create tour_payments record if not exists
                    const [existingTourPayment] = await sequelize.query(
                        'SELECT id FROM tour_payments WHERE payment_no = :payment_no LIMIT 1',
                        {
                            replacements: { payment_no: payment_id },
                            type: sequelize.QueryTypes.SELECT
                        }
                    );

                    if (!existingTourPayment) {
                        await sequelize.query(
                            `INSERT INTO tour_payments (inquiry_id, customer_id, payment_no, amount, currency, method, status, raw_payload, createdAt, updatedAt) 
                             VALUES (:inquiry_id, :customer_id, :payment_no, :amount, :currency, :method, :status, :raw_payload, NOW(), NOW())`,
                            {
                                replacements: {
                                    inquiry_id: Number(actualOrderId),
                                    customer_id: booking.customerId,
                                    payment_no: payment_id,
                                    amount: receivedAmount,
                                    currency: payhere_currency,
                                    method: 'online',
                                    status: 'success',
                                    raw_payload: JSON.stringify(req.body)
                                }
                            }
                        );
                        console.log(`[PAYHERE SUCCESS] Tour payment record created in tour_payments for Order #${order_id}.`);
                    }
                } catch (dbErr) {
                    console.error("[PAYHERE ERROR] Failed to record tour payment:", dbErr);
                }

                return res.status(200).send("OK");
            }

            if (isVehicle) {
                try {
                    const existingPayment = await Payment.findOne({ where: { payment_no: payment_id } });
                    if (!existingPayment) {
                        await Payment.create({
                            booking_id: Number(actualOrderId),
                            customer_id: booking.customerId,
                            payment_no: payment_id,
                            amount: receivedAmount,
                            currency: payhere_currency,
                            method: 'online',
                            status: 'success',
                            raw_payload: {
                                type: 'advance',
                                gatewayRef: payment_id,
                                payhereStatusCode: status_code,
                                rawPayload: req.body
                            }
                        });
                    }
                } catch (dbErr) {
                    console.error("[PAYHERE ERROR] Failed to record vehicle payment:", dbErr);
                }

                if (booking.status === "pending_payment") {
                    console.log(`[PAYHERE SUCCESS] Vehicle Booking #${actualOrderId} verified. Updating status to confirmed.`);
                    await booking.update({
                        status: "confirmed",
                        depositPaidAt: new Date()
                    });
                } else {
                    console.log(`[PAYHERE IGNORE] Vehicle Booking #${order_id} is already in state: ${booking.status}`);
                }
                return res.status(200).send("OK");
            }

            // Handle Room Payment Log
            try {
                const existingPayment = await RoomPayment.findOne({ where: { payment_no: payment_id } });
                if (!existingPayment) {
                    await RoomPayment.create({
                        booking_id: Number(actualOrderId),
                        customer_id: booking.customer_id,
                        payment_no: payment_id,
                        amount: parseFloat(payhere_amount),
                        currency: payhere_currency,
                        method: 'online',
                        status: 'success',
                        raw_payload: req.body
                    });
                }
            } catch (dbErr) { }

            // Only transition and email if currently pending
            if (booking.status === "pending") {
                console.log(`[PAYHERE SUCCESS] Booking #${actualOrderId} verified. Updating status to confirmed.`);
                await booking.update({ status: "confirmed" });

                // Fetch with associations to trigger receipt email
                try {
                    const confirmedBooking = await Reservation.findByPk(order_id, {
                        include: [
                            { model: Customer },
                            {
                                model: BookedRoom,
                                as: "bookedRooms",
                                include: [
                                    {
                                        model: Room,
                                        include: [{ model: RoomType, as: "roomType" }]
                                    }
                                ]
                            }
                        ]
                    });

                    if (confirmedBooking) {
                        await sendBookingConfirmationEmail(confirmedBooking);
                        console.log(`[PAYHERE EMAIL] Confirmed booking receipt email successfully sent for Booking #${order_id}`);

                        if (confirmedBooking.note && confirmedBooking.note.trim()) {
                            try {
                                await sendPersonalRequestEmail(
                                    confirmedBooking.Customer,
                                    confirmedBooking,
                                    confirmedBooking.note,
                                    confirmedBooking.check_in_date
                                );
                                console.log(`[PAYHERE EMAIL] Special personal request email successfully sent for Booking #${order_id}`);
                            } catch (reqEmailErr) {
                                console.error("[PAYHERE EMAIL ERROR] Failed to send special request email:", reqEmailErr.message);
                            }
                        }
                    }
                } catch (emailErr) {
                    console.error("[PAYHERE EMAIL ERROR] Failed to send receipt email:", emailErr);
                }
            } else {
                console.log(`[PAYHERE IGNORE] Booking #${order_id} is already in state: ${booking.status}`);
            }
        } else {
            console.log(`[PAYHERE UPDATE] Non-successful status code received: ${status_code} for Booking #${order_id}`);
            const isVehicle = String(order_id).startsWith("VEHICLE_");
            const isTour = String(order_id).startsWith("TOUR_");

            if (isTour) {
                const actualOrderId = String(order_id).replace("TOUR_", "");
                const t = await sequelize.transaction();
                try {
                    const booking = await TourInquiry.findByPk(actualOrderId, { transaction: t });
                    if (booking && booking.status === "progress") {
                        console.log(`[PAYHERE FAILURE] Tour #${order_id} failed. Transitioning status to pending.`);
                        await booking.update({ status: "pending" }, { transaction: t });

                        await TourPayment.update(
                            { status: "failed" },
                            { where: { inquiry_id: Number(actualOrderId), status: "pending" }, transaction: t }
                        );
                        await t.commit();
                    } else {
                        await t.rollback();
                    }
                } catch (dbErr) {
                    await t.rollback();
                    console.error("[PAYHERE DB ERROR] Failed to handle failed tour payment:", dbErr);
                }
                return res.status(200).send("OK");
            }

            if (isVehicle) {
                const actualOrderId = String(order_id).replace("VEHICLE_", "");
                const t = await sequelize.transaction();
                try {
                    const booking = await VehicleBooking.findByPk(actualOrderId, { transaction: t });
                    if (booking && booking.status === "pending_payment") {
                        console.log(`[PAYHERE FAILURE] Vehicle Booking #${order_id} failed. Transitioning status to payment_failed.`);
                        await booking.update({ status: "payment_failed" }, { transaction: t });

                        await Payment.update(
                            { status: "failed" },
                            { where: { booking_id: Number(actualOrderId), status: "pending" }, transaction: t }
                        );
                        await t.commit();
                    } else {
                        await t.rollback();
                    }
                } catch (dbErr) {
                    await t.rollback();
                    console.error("[PAYHERE DB ERROR] Failed to cancel vehicle booking:", dbErr);
                }
                return res.status(200).send("OK");
            }

            // FIX: Open the transaction BEFORE targeting any model mutations or searches
            const t = await sequelize.transaction();
            try {
                // Fetch the record directly inside the transaction lock
                const booking = await Reservation.findByPk(order_id, { transaction: t });

                if (booking && booking.status === "pending") {
                    console.log(`[PAYHERE FAILURE] Booking #${order_id} failed or cancelled on PayHere. Transitioning status to cancelled.`);

                    // Execute all updates safely tied to the active transaction context
                    await booking.update({ status: "cancelled" }, { transaction: t });
                    await BookedRoom.update({ status: "cancelled" }, { where: { booking_id: order_id }, transaction: t });

                    await RoomPayment.update(
                        { status: "failed" },
                        { where: { booking_id: Number(order_id), status: "pending" }, transaction: t }
                    );

                    await AirPortPickup.update(
                        { status: "CANCELLED" },
                        { where: { booking_id: Number(order_id) }, transaction: t }
                    );

                    await t.commit();
                    console.log(`[PAYHERE DB] Successfully cancelled failed payment Booking #${order_id}`);
                } else {
                    // Cleanly close out transaction if booking wasn't pending
                    await t.rollback();
                }
            } catch (dbErr) {
                await t.rollback();
                console.error("[PAYHERE DB ERROR] Failed to cancel booking on payment failure:", dbErr);
            }
        }

        return res.status(200).send("OK");

    } catch (error) {
        console.error("❌ PayHere Notification Webhook Error:", error);
        return res.status(500).send("Webhook internal processing error");
    }
};

export const confirmTourPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const customerId = req.user.id;
        const { inquiryId, paymentNo, amount, currency, useWallet } = req.body;

        if (!inquiryId || !paymentNo || !amount) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const booking = await TourInquiry.findByPk(inquiryId, { 
            include: [{ model: Tour }],
            transaction: t
        });
        if (!booking) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Tour Inquiry not found" });
        }

        if (booking.customerId) {
            if (booking.customerId !== customerId) {
                await t.rollback();
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
        } else {
            if (booking.email !== req.user.email) {
                await t.rollback();
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
            await booking.update({ customerId }, { transaction: t });
        }

        // Update TourInquiry status
        if (booking.status === "progress") {
            await booking.update({ status: "accepted" }, { transaction: t });
        }

        const discountPercentage = Number(booking.Tour.discount || 0);
        const originalPrice = Number(booking.Tour.price || 0);
        const discountedPrice = discountPercentage > 0
            ? originalPrice - (originalPrice * discountPercentage / 100)
            : originalPrice;

        const totalAmount = Number((discountedPrice * booking.numberOfAdults).toFixed(2));
        const expectedDeposit = Number((totalAmount * 0.5).toFixed(2));
        const receivedAmount = Number(amount);

        let walletDeduction = 0;
        if (useWallet && receivedAmount < expectedDeposit) {
            walletDeduction = Number((expectedDeposit - receivedAmount).toFixed(2));
            
            // Get or create wallet
            const [wallet] = await CustomerWallet.findOrCreate({
                where: { customerId },
                defaults: { customerId, balance: 0.00 },
                transaction: t
            });

            if (Number(wallet.balance) < walletDeduction) {
                await t.rollback();
                return res.status(400).json({ success: false, message: "Insufficient wallet balance for split payment" });
            }

            // Deduct from wallet
            const newBalance = Number((Number(wallet.balance) - walletDeduction).toFixed(2));
            await wallet.update({ balance: newBalance }, { transaction: t });

            // Create WalletTransaction
            await WalletTransaction.create({
                walletId: wallet.id,
                amount: -walletDeduction,
                type: 'withdrawal',
                description: `Paid advance for Tour booking ${booking.inquiryRef} (Split)`,
                referenceId: String(inquiryId)
            }, { transaction: t });

            // Log wallet payment
            const walletPaymentNo = `WLT-TR-${inquiryId}-${Date.now()}`;
            await sequelize.query(
                `INSERT INTO tour_payments (inquiry_id, customer_id, payment_no, amount, currency, method, status, raw_payload, createdAt, updatedAt) 
                 VALUES (:inquiry_id, :customer_id, :payment_no, :amount, :currency, :method, :status, :raw_payload, NOW(), NOW())`,
                {
                    replacements: {
                        inquiry_id: Number(inquiryId),
                        customer_id: customerId,
                        payment_no: walletPaymentNo,
                        amount: walletDeduction,
                        currency: currency || 'LKR',
                        method: 'wallet',
                        status: 'success',
                        raw_payload: JSON.stringify({ type: 'wallet-deduction', inquiryId })
                    },
                    transaction: t
                }
            );
        }

        const depositAmount = receivedAmount + walletDeduction;
        const remainingAmount = Number((totalAmount - depositAmount).toFixed(2));

        // 1. Create or update tour_bookings record
        const [existingTourBooking] = await sequelize.query(
            'SELECT id FROM tour_bookings WHERE inquiryId = :inquiryId LIMIT 1',
            {
                replacements: { inquiryId: Number(inquiryId) },
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            }
        );

        if (!existingTourBooking) {
            const trackingToken = crypto.randomBytes(16).toString("hex");
            const cleanInquiryRef = (booking.inquiryRef || String(inquiryId)).replace(/^TI-/, '');
            const bookingRef = `TB-${cleanInquiryRef}`;

            await sequelize.query(
                `INSERT INTO tour_bookings (bookingRef, inquiryId, tourStartDate, totalAmount, depositAmount, remainingAmount, status, trackingToken, acceptedAt, createdAt, updatedAt) 
                 VALUES (:bookingRef, :inquiryId, :tourStartDate, :totalAmount, :depositAmount, :remainingAmount, :status, :trackingToken, NOW(), NOW(), NOW())`,
                {
                    replacements: {
                        bookingRef,
                        inquiryId: Number(inquiryId),
                        tourStartDate: booking.startDate,
                        totalAmount,
                        depositAmount,
                        remainingAmount,
                        status: 'half_paid',
                        trackingToken
                    },
                    transaction: t
                }
            );
        } else {
            await sequelize.query(
                `UPDATE tour_bookings SET status = 'half_paid', depositAmount = :depositAmount, remainingAmount = :remainingAmount, updatedAt = NOW() WHERE inquiryId = :inquiryId`,
                {
                    replacements: {
                        inquiryId: Number(inquiryId),
                        depositAmount,
                        remainingAmount
                    },
                    transaction: t
                }
            );
        }

        // 2. Create tour_payments record if not exists
        const [existingTourPayment] = await sequelize.query(
            'SELECT id FROM tour_payments WHERE payment_no = :payment_no LIMIT 1',
            {
                replacements: { payment_no: paymentNo },
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            }
        );

        if (!existingTourPayment) {
            await sequelize.query(
                `INSERT INTO tour_payments (inquiry_id, customer_id, payment_no, amount, currency, method, status, raw_payload, createdAt, updatedAt) 
                 VALUES (:inquiry_id, :customer_id, :payment_no, :amount, :currency, :method, :status, :raw_payload, NOW(), NOW())`,
                {
                    replacements: {
                        inquiry_id: Number(inquiryId),
                        customer_id: customerId,
                        payment_no: paymentNo,
                        amount: receivedAmount,
                        currency: currency || 'LKR',
                        method: 'online',
                        status: 'success',
                        raw_payload: JSON.stringify({ type: 'client-confirmed', ...req.body })
                    },
                    transaction: t
                }
            );
        }

        await t.commit();
        return res.status(200).json({ success: true, message: "Tour payment logged successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error confirming tour payment:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Client-side fallback to confirm and log vehicle payments immediately.
 * Called from the frontend when PayHere onCompleted fires.
 * This ensures payment is saved even when the PayHere webhook cannot reach localhost.
 */
export const confirmVehiclePayment = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { bookingId, paymentNo, amount, currency } = req.body;

        if (!bookingId || !paymentNo || !amount) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const booking = await VehicleBooking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Vehicle Booking not found" });
        }

        // Verify ownership
        if (booking.customerId !== customerId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // 1. Create vehicle_payment record if not exists
        const [existingPayment] = await sequelize.query(
            'SELECT id FROM vehicle_payment WHERE payment_no = :payment_no LIMIT 1',
            {
                replacements: { payment_no: paymentNo },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existingPayment) {
            await sequelize.query(
                `INSERT INTO vehicle_payment (booking_id, customer_id, payment_no, amount, currency, method, status, raw_payload, createdAt, updatedAt) 
                 VALUES (:booking_id, :customer_id, :payment_no, :amount, :currency, :method, :status, :raw_payload, NOW(), NOW())`,
                {
                    replacements: {
                        booking_id: Number(bookingId),
                        customer_id: customerId,
                        payment_no: paymentNo,
                        amount: Number(amount),
                        currency: currency || 'LKR',
                        method: 'online',
                        status: 'success',
                        raw_payload: JSON.stringify({ type: 'client-confirmed', ...req.body })
                    }
                }
            );
            console.log(`[VEHICLE CONFIRM] Payment record created for Booking #${bookingId}`);
        }

        // 2. Update booking status to confirmed if still pending_payment
        if (booking.status === "pending_payment") {
            await booking.update({
                status: "confirmed",
                depositPaidAt: new Date(),
                payhereOrderId: `VEHICLE_${bookingId}`,
                payherePaymentId: paymentNo,
                paymentMethod: 'online'
            });
            console.log(`[VEHICLE CONFIRM] Booking #${bookingId} status updated to confirmed`);
        }

        return res.status(200).json({ success: true, message: "Vehicle payment logged successfully" });
    } catch (error) {
        console.error("Error confirming vehicle payment:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Deduct tour booking payment fully from wallet.
 */
export const tourPayWallet = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const customerId = req.user.id;
        const { inquiryId } = req.body;

        if (!inquiryId) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Missing inquiryId" });
        }

        const booking = await TourInquiry.findByPk(inquiryId, {
            include: [{ model: Tour }],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Tour Inquiry not found" });
        }

        // Verify ownership
        if (booking.customerId && booking.customerId !== customerId) {
            await t.rollback();
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Set customerId if not set
        if (!booking.customerId) {
            await booking.update({ customerId }, { transaction: t });
        }

        // Update TourInquiry status
        if (booking.status === "progress") {
            await booking.update({ status: "accepted" }, { transaction: t });
        }

        const discountPercentage = Number(booking.Tour.discount || 0);
        const originalPrice = Number(booking.Tour.price || 0);
        const discountedPrice = discountPercentage > 0
            ? originalPrice - (originalPrice * discountPercentage / 100)
            : originalPrice;

        const totalAmount = Number((discountedPrice * booking.numberOfAdults).toFixed(2));
        const advanceAmount = Number((totalAmount * 0.5).toFixed(2));

        // Get or create wallet
        const [wallet] = await CustomerWallet.findOrCreate({
            where: { customerId },
            defaults: { customerId, balance: 0.00 },
            transaction: t
        });

        if (Number(wallet.balance) < advanceAmount) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
        }

        // Deduct from wallet
        const newBalance = Number((Number(wallet.balance) - advanceAmount).toFixed(2));
        await wallet.update({ balance: newBalance }, { transaction: t });

        // Create WalletTransaction
        await WalletTransaction.create({
            walletId: wallet.id,
            amount: -advanceAmount,
            type: 'withdrawal',
            description: `Paid advance for Tour booking ${booking.inquiryRef} (Wallet)`,
            referenceId: String(inquiryId)
        }, { transaction: t });

        // Log wallet payment
        const paymentNo = `WLT-TR-FULL-${inquiryId}-${Date.now()}`;
        await sequelize.query(
            `INSERT INTO tour_payments (inquiry_id, customer_id, payment_no, amount, currency, method, status, raw_payload, createdAt, updatedAt) 
             VALUES (:inquiry_id, :customer_id, :payment_no, :amount, 'LKR', 'wallet', 'success', :raw_payload, NOW(), NOW())`,
            {
                replacements: {
                    inquiry_id: Number(inquiryId),
                    customer_id: customerId,
                    payment_no: paymentNo,
                    amount: advanceAmount,
                    raw_payload: JSON.stringify({ type: 'wallet-payment-full', inquiryId })
                },
                transaction: t
            }
        );

        // 1. Create or update tour_bookings record
        const [existingTourBooking] = await sequelize.query(
            'SELECT id FROM tour_bookings WHERE inquiryId = :inquiryId LIMIT 1',
            {
                replacements: { inquiryId: Number(inquiryId) },
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            }
        );

        const remainingAmount = Number((totalAmount - advanceAmount).toFixed(2));

        if (!existingTourBooking) {
            const trackingToken = crypto.randomBytes(16).toString("hex");
            const cleanInquiryRef = (booking.inquiryRef || String(inquiryId)).replace(/^TI-/, '');
            const bookingRef = `TB-${cleanInquiryRef}`;

            await sequelize.query(
                `INSERT INTO tour_bookings (bookingRef, inquiryId, tourStartDate, totalAmount, depositAmount, remainingAmount, status, trackingToken, acceptedAt, createdAt, updatedAt) 
                 VALUES (:bookingRef, :inquiryId, :tourStartDate, :totalAmount, :depositAmount, :remainingAmount, :status, :trackingToken, NOW(), NOW(), NOW())`,
                {
                    replacements: {
                        bookingRef,
                        inquiryId: Number(inquiryId),
                        tourStartDate: booking.startDate,
                        totalAmount,
                        depositAmount: advanceAmount,
                        remainingAmount,
                        status: 'half_paid',
                        trackingToken
                    },
                    transaction: t
                }
            );
        } else {
            await sequelize.query(
                `UPDATE tour_bookings SET status = 'half_paid', depositAmount = :depositAmount, remainingAmount = :remainingAmount, updatedAt = NOW() WHERE inquiryId = :inquiryId`,
                {
                    replacements: {
                        inquiryId: Number(inquiryId),
                        depositAmount: advanceAmount,
                        remainingAmount
                    },
                    transaction: t
                }
            );
        }

        await t.commit();
        return res.status(200).json({ success: true, message: "Tour booking paid successfully via wallet", paymentNo });
    } catch (error) {
        await t.rollback();
        console.error("Error paying tour with wallet:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
