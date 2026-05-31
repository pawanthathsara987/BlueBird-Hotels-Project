import crypto from 'crypto';
import { Reservation, Customer, BookedRoom, Room, RoomType, RoomPayment } from "../models/index.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";

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
                    }
                } catch (emailErr) {
                    console.error("[PAYHERE EMAIL ERROR] Failed to send receipt email:", emailErr);
                }
            } else {
                console.log(`[PAYHERE IGNORE] Booking #${order_id} is already in state: ${booking.status}`);
            }
        } else {
            console.log(`[PAYHERE UPDATE] Non-successful status code received: ${status_code} for Booking #${order_id}`);
        }

        return res.status(200).send("OK");

    } catch (error) {
        console.error("❌ PayHere Notification Webhook Error:", error);
        return res.status(500).send("Webhook internal processing error");
    }
};
