import crypto from 'crypto';
import sequelize from '../config/database.js';
import { Reservation, Customer, BookedRoom, Room, RoomType, RoomPayment, AirPortPickup } from "../models/index.js";
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
            const booking = await Reservation.findByPk(order_id);

            if (!booking) {
                console.warn(`[PAYHERE WARNING] Booking ID #${order_id} not found in database.`);
                return res.status(404).send("Booking not found");
            }

            // Verify payment currency matches LKR
            if (payhere_currency !== "LKR") {
                console.warn(`[PAYHERE WARNING] Currency mismatch for Booking #${order_id}. Expected: LKR, Received: ${payhere_currency}`);
                return res.status(400).send("Currency verification failed");
            }

            // Verify payment amount matches 50% of booking total price (advance payment)
            const expectedAmount = Number((Number(booking.total_price) * 0.5).toFixed(2));
            const receivedAmount = Number(parseFloat(payhere_amount).toFixed(2));
            if (Math.abs(receivedAmount - expectedAmount) > 0.05) {
                console.warn(`[PAYHERE WARNING] Payment amount mismatch for Booking #${order_id}. Expected: ${expectedAmount}, Received: ${receivedAmount}`);
                return res.status(400).send("Payment amount verification failed");
            }

            // Log successful payment details in RoomPayment model
            try {
                const existingPayment = await RoomPayment.findOne({ where: { payment_no: payment_id } });
                if (!existingPayment) {
                    await RoomPayment.create({
                        booking_id: Number(order_id),
                        customer_id: booking.customer_id,
                        payment_no: payment_id,
                        amount: parseFloat(payhere_amount),
                        currency: payhere_currency,
                        method: 'online',
                        status: 'success',
                        raw_payload: req.body
                    });
                    console.log(`[PAYHERE DB] Logged successful payment #${payment_id} for Booking #${order_id}`);
                } else {
                    console.log(`[PAYHERE DB] Payment #${payment_id} was already logged.`);
                }
            } catch (dbErr) {
                console.error("[PAYHERE DB ERROR] Failed to log payment in database:", dbErr);
            }

            // Only transition and email if currently pending
            if (booking.status === "pending") {
                console.log(`[PAYHERE SUCCESS] Booking #${order_id} verified. Updating status to confirmed.`);
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
            
            const booking = await Reservation.findByPk(order_id);
            if (booking && booking.status === "pending") {
                console.log(`[PAYHERE FAILURE] Booking #${order_id} failed or cancelled on PayHere. Transitioning status to cancelled.`);
                
                const t = await sequelize.transaction();
                try {
                    await booking.update({ status: "cancelled" }, { transaction: t });
                    await BookedRoom.update({ status: "cancelled" }, { where: { booking_id: order_id }, transaction: t });
                    
                    // Mark any pending RoomPayment records as failed
                    await RoomPayment.update(
                        { status: "failed" },
                        { where: { booking_id: Number(order_id), status: "pending" }, transaction: t }
                    );

                    // Cancel associated airport pickup
                    await AirPortPickup.update(
                        { status: "CANCELLED" },
                        { where: { booking_id: Number(order_id) }, transaction: t }
                    );
                    
                    await t.commit();
                    console.log(`[PAYHERE DB] Successfully cancelled failed payment Booking #${order_id}`);
                } catch (dbErr) {
                    await t.rollback();
                    console.error("[PAYHERE DB ERROR] Failed to cancel booking on payment failure:", dbErr);
                }
            }
        }

        return res.status(200).send("OK");

    } catch (error) {
        console.error("❌ PayHere Notification Webhook Error:", error);
        return res.status(500).send("Webhook internal processing error");
    }
};
