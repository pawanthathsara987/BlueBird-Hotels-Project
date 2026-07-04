import Customer from "../models/User/Customer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomerOTP from "../models/User/CustomerOTP.js";
import { sendEmail, sendInquiryEmail } from "../services/emailService.js";
import dotenv from "dotenv";
import axios from "axios";
import { response } from "express";
import { Op } from "sequelize";

dotenv.config();

import sequelize from "../config/database.js";
import { Booking, BookedRoom, Room, RoomType, AirPortPickup, VehicleBooking, Vehicle, TourInquiry, Tour, Payment, RoomPayment, BoardType, RoomPrice, AirportPickupVehicle, RoomReview, VehicleReview, TourReview } from "../models/index.js";

export async function registerCustomer(req, res) {

    try {
        const data = req.body;

        if (data.password !== data.confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email: data.email } });
        if (existingCustomer) {
            return res.status(400).json({
                message: "Email already in exists"
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newCustomer = await Customer.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phoneNumber: data.phoneNumber,
            country: data.country,
            idType: data.idType,
            idNumber: data.idNumber,
            address: data.address
        });

        const userResponse = {
            id: newCustomer.id,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
            phoneNumber: newCustomer.phoneNumber,
            country: newCustomer.country,
            idType: newCustomer.idType,
            idNumber: newCustomer.idNumber,
            address: newCustomer.address
        };

        res.status(201).json({
            message: "Customer registered successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Error registering customer:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function loginCustomer(req, res) {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        if (customer.googleAuth) {
            return res.status(400).json({
                message: "Please login using Google"
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const userResponse = {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            country: customer.country,
            idType: customer.idType,
            idNumber: customer.idNumber,
            address: customer.address,
            googleAuth: customer.googleAuth,
            role: "customer"
        };

        const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: "30m" });
        const refreshToken = jwt.sign(userResponse, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Customer logged in successfully",
            token: accessToken,
            user: userResponse
        });

    } catch (error) {
        console.error("Error logging in customer:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function refreshToken(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        try {
            const customer = await Customer.findByPk(decoded.id);
            if (!customer) {
                return res.status(403).json({ message: "Customer not found" });
            }

            const userResponse = {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phoneNumber: customer.phoneNumber,
                country: customer.country,
                idType: customer.idType,
                idNumber: customer.idNumber,
                address: customer.address,
                googleAuth: customer.googleAuth,
                role: "customer"
            };

            const newAccessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });

            res.status(200).json({
                token: newAccessToken,
                accessToken: newAccessToken,
                user: userResponse
            });
        } catch (error) {
            console.error("Refresh token error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

export async function logoutCustomer(req, res) {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax"
        });
        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error logging out customer:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function sendOTP(req, res) {
    try {
        const { email } = req.body;

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        await CustomerOTP.destroy({ where: { email } });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await CustomerOTP.create({
            email,
            otp,
            expiresAt
        });

        await sendEmail({
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`
        });
        res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function verifyOTPAndResetPassword(req, res) {

    try {
        const otp = req.body.otp;
        const email = req.body.email;
        const newPassword = req.body.newPassword;

        const customerOtp = await CustomerOTP.findOne({ where: { email, otp } });
        if (!customerOtp) {
            return res.status(400).json({
                message: "Invalid OTP or OTP has expired"
            });
        }

        await CustomerOTP.destroy({ where: { email } });

        const hashedPassword = await bcrypt.hashSync(newPassword, 10);
        await Customer.update({ password: hashedPassword }, { where: { email } });
        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Error verifying OTP and resetting password:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }

}

export async function googleLogin(req, res) {

    const googleToken = req.body.token;

    if (!googleToken) {
        return res.status(400).json({
            message: "Access token is required"
        });
    }

    try {

        const response = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${googleToken}`
                }
            }
        );

        if (!response.data.email) {
            console.log("NO EMAIL");

            return res.status(400).json({
                message: "No email returned from Google"
            });
        }

        const user = await Customer.findOne({
            where: {
                email: response.data.email
            }
        });

        if (user && !user.googleAuth) {

            return res.status(400).json({
                message: "Please login using email & password"
            });
        }

        let activeUser = user;

        if (activeUser == null) {
            activeUser = await Customer.create({
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                email: response.data.email,
                googleAuth: true
            });
        }

        const userResponse = {
            id: activeUser.id,
            firstName: activeUser.firstName,
            lastName: activeUser.lastName,
            email: activeUser.email,
            phoneNumber: activeUser.phoneNumber,
            country: activeUser.country,
            idType: activeUser.idType,
            idNumber: activeUser.idNumber,
            address: activeUser.address,
            googleAuth: activeUser.googleAuth,
            role: "customer"
        };

        const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign(userResponse, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Customer logged in successfully",
            token: accessToken,
            user: userResponse
        });

    } catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json({
            message: "Google auth failed"
        });
    }
}

export async function updateCustomerProfile(req, res) {
    try {
        const customerId = req.user.id;
        const { firstName, lastName, phoneNumber, country, idType, idNumber, address } = req.body;

        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        if (firstName !== undefined) customer.firstName = firstName;
        if (lastName !== undefined) customer.lastName = lastName;
        if (phoneNumber !== undefined) customer.phoneNumber = phoneNumber;
        if (country !== undefined) customer.country = country;
        if (idType !== undefined) customer.idType = idType;
        if (idNumber !== undefined) customer.idNumber = idNumber;
        if (address !== undefined) customer.address = address;

        await customer.save();

        const userResponse = {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            country: customer.country,
            idType: customer.idType,
            idNumber: customer.idNumber,
            address: customer.address,
            googleAuth: customer.googleAuth,
            role: "customer"
        };

        const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign(userResponse, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Profile updated successfully",
            token: accessToken,
            user: userResponse
        });

    } catch (error) {
        console.error("Error updating customer profile:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function changePassword(req, res) {
    try {
        const customerId = req.user.id;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                message: "New passwords do not match"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters long"
            });
        }

        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        if (customer.googleAuth) {
            return res.status(400).json({
                message: "Accounts registered with Google Authentication cannot change their password"
            });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Incorrect current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        customer.password = hashedPassword;
        await customer.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getCustomerProfile(req, res) {
    try {
        const customerId = req.user.id;
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        console.error("Error fetching customer profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getCustomerBookings(req, res) {
    try {
        const customerId = req.user.id;
        const bookings = await Booking.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: BookedRoom,
                    as: "bookedRooms",
                    include: [
                        {
                            model: Room,
                            as: undefined,
                            attributes: ["id", "room_number", "floor", "status", "room_type_id"],
                            include: [
                                {
                                    model: RoomType,
                                    as: "roomType",
                                    attributes: ["id", "type", "image_url"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: RoomReview,
                    as: "stayReview",
                    required: false
                },
                {
                    model: RoomPayment,
                    as: "payments",
                    attributes: ["id", "payment_no", "amount", "currency", "method", "status", "createdAt"],
                    required: false
                },
                {
                    model: AirPortPickup,
                    as: "airportPickup",
                    required: false
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        const airportPickups = await AirPortPickup.findAll({
            include: [{
                model: Booking,
                as: 'booking',
                where: { customer_id: customerId },
                attributes: []
            }]
        });

        const pickupVehicle = await AirportPickupVehicle.findOne({
            order: [["price", "ASC"]]
        });
        const airportPickupFee = pickupVehicle ? parseFloat(pickupVehicle.price) : 15000;

        res.status(200).json({
            success: true,
            data: bookings,
            airportPickups,
            airportPickupFee
        });
    } catch (error) {
        console.error("Error fetching customer bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function submitRoomReview(req, res) {
    const t = await sequelize.transaction();
    try {
        const customerId = req.user.id;
        const { bookingId } = req.params;
        const { hotelRating, comment } = req.body;

        const hotelScore = Number(hotelRating);

        if (!bookingId) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "bookingId is required" });
        }

        if (!Number.isInteger(hotelScore) || hotelScore < 1 || hotelScore > 5) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Hotel rating must be between 1 and 5" });
        }

        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            include: [{ model: BookedRoom, as: 'bookedRooms' }],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
        }

        const hasCheckedOutRoom = booking.bookedRooms?.some(r => (r.status || "").toLowerCase() === "checked_out");
        const statusLower = (booking.status || "").toLowerCase();
        const isCompleted = statusLower === "completed" || statusLower === "checked_out" || hasCheckedOutRoom;

        if (!isCompleted) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "You can only review a booking after check-out" });
        }

        const existingReview = await RoomReview.findOne({
            where: { booking_id: bookingId, customer_id: customerId },
            transaction: t
        });

        if (existingReview) {
            await t.rollback();
            return res.status(409).json({ success: false, message: "A review for this booking has already been submitted" });
        }

        const review = await RoomReview.create({
            booking_id: booking.id,
            customer_id: customerId,
            hotel_rating: hotelScore,
            comment: comment?.trim() || null
        }, { transaction: t });

        await t.commit();
        return res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
    } catch (error) {
        await t.rollback();
        console.error("Error submitting room review:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function submitVehicleReview(req, res) {
    const t = await sequelize.transaction();
    try {
        const customerId = req.user.id;
        const { id } = req.params; // vehicle booking id
        const { vehicleRating, driverRating, comment } = req.body;

        const vScore = Number(vehicleRating);
        const dScore = driverRating ? Number(driverRating) : null;

        if (!Number.isInteger(vScore) || vScore < 1 || vScore > 5) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Vehicle rating must be between 1 and 5" });
        }
        if (dScore !== null && (!Number.isInteger(dScore) || dScore < 1 || dScore > 5)) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Driver rating must be between 1 and 5" });
        }

        const booking = await VehicleBooking.findOne({ where: { id, customerId }, transaction: t });
        if (!booking) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Rental booking not found or not authorized" });
        }
        if (![ "completed", "returned" ].includes(booking.status)) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "You can only review a completed rental" });
        }

        const existing = await VehicleReview.findOne({ where: { vehicle_booking_id: id, customer_id: customerId }, transaction: t });
        if (existing) {
            await t.rollback();
            return res.status(409).json({ success: false, message: "Review already submitted for this rental" });
        }

        const review = await VehicleReview.create({
            vehicle_booking_id: Number(id),
            customer_id: customerId,
            vehicle_rating: vScore,
            driver_rating: dScore,
            comment: comment?.trim() || null
        }, { transaction: t });

        await t.commit();
        return res.status(201).json({ success: true, message: "Vehicle review submitted", data: review });
    } catch (error) {
        await t.rollback();
        console.error("Error submitting vehicle review:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function submitTourReview(req, res) {
    const t = await sequelize.transaction();
    try {
        const customerId = req.user.id;
        const { id } = req.params; // tour inquiry id
        const { tourRating, guideRating, comment } = req.body;

        const tScore = Number(tourRating);
        const gScore = guideRating ? Number(guideRating) : null;

        if (!Number.isInteger(tScore) || tScore < 1 || tScore > 5) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Tour rating must be between 1 and 5" });
        }
        if (gScore !== null && (!Number.isInteger(gScore) || gScore < 1 || gScore > 5)) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Guide rating must be between 1 and 5" });
        }

        const inquiry = await TourInquiry.findOne({ where: { id, customerId }, transaction: t });
        if (!inquiry) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Tour booking not found or not authorized" });
        }
        if (inquiry.status !== "accepted") {
            await t.rollback();
            return res.status(400).json({ success: false, message: "You can only review a completed (accepted) tour" });
        }

        const existing = await TourReview.findOne({ where: { tour_booking_id: id, customer_id: customerId }, transaction: t });
        if (existing) {
            await t.rollback();
            return res.status(409).json({ success: false, message: "Review already submitted for this tour" });
        }

        const review = await TourReview.create({
            tour_booking_id: Number(id),
            customer_id: customerId,
            tour_rating: tScore,
            guide_rating: gScore,
            comment: comment?.trim() || null
        }, { transaction: t });

        await t.commit();
        return res.status(201).json({ success: true, message: "Tour review submitted", data: review });
    } catch (error) {
        await t.rollback();
        console.error("Error submitting tour review:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Keep old name as alias for backward compatibility
export const submitRoomStayReview = submitRoomReview;


export async function getCustomerDashboardReviews(req, res) {
    try {
        const customerId = req.user.id;

        // Fetch all three review types simultaneously from their respective tables
        const [roomReviews, tourReviews, vehicleReviews] = await Promise.all([
            RoomReview.findAll({
                where: { customer_id: customerId },
                include: [
                    {
                        model: Booking,
                        as: "booking",
                        attributes: ["id"]
                    }
                ],
                order: [["createdAt", "DESC"]]
            }),
            TourReview.findAll({
                where: { customer_id: customerId },
                include: [
                    {
                        model: TourInquiry,
                        as: "inquiry",
                        include: [
                            {
                                model: Tour,
                                attributes: ["packageName"]
                            }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]]
            }),
            VehicleReview.findAll({
                where: { customer_id: customerId },
                include: [
                    {
                        model: VehicleBooking,
                        as: "booking",
                        include: [
                            {
                                model: Vehicle,
                                as: "vehicle",
                                attributes: ["brand", "model"]
                            }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]]
            })
        ]);

        // 1. Normalize Room / Hotel Stay Reviews
        const formattedRoomReviews = roomReviews.map(rev => ({
            id: `room-${rev.id}`,
            type: "Room",
            title: "Hotel Stay Accommodation",
            subtitle: rev.booking_id ? `Booking Ref: #${rev.booking_id}` : "Verified Stay",
            rating: rev.hotel_rating,
            secondaryRating: null,
            secondaryRatingLabel: null,
            comment: rev.comment ? rev.comment.trim() : null,
            date: rev.createdAt
        }));

        // 2. Normalize Tour Package Reviews
        const formattedTourReviews = tourReviews.map(rev => ({
            id: `tour-${rev.id}`,
            type: "Tour",
            title: rev.inquiry?.Tour?.packageName || "Custom Tour Excursion",
            subtitle: rev.tour_booking_id ? `Tour Ref: #${rev.tour_booking_id}` : "Guided Tour Journey",
            rating: rev.tour_rating,
            secondaryRating: rev.guide_rating,
            secondaryRatingLabel: "Guide",
            comment: rev.comment ? rev.comment.trim() : null,
            date: rev.createdAt
        }));

        // 3. Normalize Vehicle Rental Reviews
        const formattedVehicleReviews = vehicleReviews.map(rev => {
            const vehicle = rev.booking?.vehicle;
            const carTitle = vehicle ? `${vehicle.brand} ${vehicle.model}` : "Private Transport Rental";
            return {
                id: `vehicle-${rev.id}`,
                type: "Vehicle",
                title: carTitle,
                subtitle: rev.vehicle_booking_id ? `Rental Ref: #${rev.vehicle_booking_id}` : "Vehicle Service Logistics",
                rating: rev.vehicle_rating,
                secondaryRating: rev.driver_rating,
                secondaryRatingLabel: "Driver",
                comment: rev.comment ? rev.comment.trim() : null,
                date: rev.createdAt
            };
        });

        // Merge and sort combined datasets chronologically
        const integratedReviews = [
            ...formattedRoomReviews,
            ...formattedTourReviews,
            ...formattedVehicleReviews
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            data: integratedReviews
        });

    } catch (error) {
        console.error("Error fetching aggregated dashboard reviews:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getCustomerRentals(req, res) {
    try {
        const customerId = req.user.id;
        const rentals = await VehicleBooking.findAll({
            where: { customerId: customerId },
            include: [
                { model: Vehicle, as: "vehicle" },
                { model: Payment, as: "payments" },
                { model: VehicleReview, as: "review", required: false }
            ],
            order: [["createdAt", "DESC"]]
        });

        // Attach vehicle_refunds for each rental
        const refunds = rentals.length > 0
            ? await sequelize.query(
                `SELECT * FROM vehicle_refunds WHERE bookingId IN (:ids)`,
                { replacements: { ids: rentals.map(r => r.id) }, type: sequelize.QueryTypes.SELECT }
              )
            : [];

        const data = rentals.map(r => ({
            ...r.toJSON(),
            refund: refunds.find(rf => rf.bookingId === r.id) || null
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error fetching customer rentals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getCustomerTours(req, res) {
    try {
        const customerId = req.user.id;
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const inquiries = await TourInquiry.findAll({
            where: {
                [Op.or]: [
                    { customerId: customer.id },
                    { email: customer.email }
                ]
            },
            include: [
                {
                    model: Tour,
                    attributes: ["packageName", "location", "price", "image"]
                },
                {
                    model: TourReview,
                    as: "review",
                    required: false
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        if (inquiries.length > 0) {
            const inquiryRefs = inquiries.map(i => i.inquiryRef);
            const refunds = await sequelize.query(
                `SELECT * FROM tour_refunds WHERE inquiryRef IN (:inquiryRefs)`,
                {
                    replacements: { inquiryRefs },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            const inquiriesWithRefunds = inquiries.map(inquiry => {
                const refund = refunds.find(r => r.inquiryRef === inquiry.inquiryRef) || null;
                const jsonVal = inquiry.toJSON();
                return {
                    ...jsonVal,
                    refund,
                    review: jsonVal.review || null
                };
            });

            res.status(200).json({ success: true, data: inquiriesWithRefunds });
        } else {
            res.status(200).json({ success: true, data: [] });
        }
    } catch (error) {
        console.error("Error fetching customer tours:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getCustomerPayments(req, res) {
    try {
        const customerId = req.user.id;

        const roomPayments = await RoomPayment.findAll({
            where: { customer_id: customerId },
            order: [["createdAt", "DESC"]]
        });

        const vehiclePayments = await Payment.findAll({
            include: [
                {
                    model: VehicleBooking,
                    as: "booking",
                    where: { customerId: customerId },
                    attributes: ["bookingNo"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        const tourPayments = await sequelize.query(
            `SELECT tp.*, ti.inquiryRef 
             FROM tour_payments tp 
             JOIN tour_inquiries ti ON tp.inquiry_id = ti.id 
             WHERE tp.customer_id = :customerId`,
            {
                replacements: { customerId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        const mappedRoomPayments = roomPayments.map(p => ({
            id: `PAY-RM-${p.id}`,
            refNo: p.payment_no || `RM-${p.id}`,
            date: p.createdAt,
            category: "Room Booking",
            description: `Room Booking Payment`,
            bookingRef: `#${p.booking_id}`,
            method: p.method || "online",
            currency: p.currency || "LKR",
            amount: parseFloat(p.amount),
            isRefund: false,
            status: p.status === "success" ? "Succeeded" : p.status === "pending" ? "Pending" : "Failed"
        }));

        const mappedVehiclePayments = vehiclePayments.map(p => {
            const raw = p.raw_payload || {};
            const typeStr = raw.type ? raw.type.charAt(0).toUpperCase() + raw.type.slice(1) : "Online";
            const isRefund = raw.type === "refund";
            return {
                id: `PAY-VH-${p.id}`,
                refNo: p.payment_no || `VH-${p.id}`,
                date: p.createdAt,
                category: "Vehicle Rental",
                description: `Vehicle Rental – ${typeStr}`,
                bookingRef: `#${p.booking?.bookingNo || p.booking_id}`,
                method: p.method || "online",
                currency: p.currency || "LKR",
                amount: parseFloat(p.amount),
                isRefund: isRefund,
                notes: raw.notes || null,
                status: isRefund ? "Refunded" : p.status === "success" ? "Succeeded" : p.status === "pending" ? "Pending" : "Failed"
            };
        });

        const mappedTourPayments = tourPayments.map(p => ({
            id: `PAY-TR-${p.id}`,
            refNo: p.payment_no || `TR-${p.id}`,
            date: p.createdAt,
            category: "Tour Package",
            description: "Tour Package Advance Payment",
            bookingRef: `#${p.inquiryRef || p.inquiry_id}`,
            method: p.method || "online",
            currency: p.currency || "LKR",
            amount: parseFloat(p.amount),
            isRefund: false,
            status: p.status === "success" ? "Succeeded" : p.status === "pending" ? "Pending" : "Failed"
        }));

        const allPayments = [...mappedRoomPayments, ...mappedVehiclePayments, ...mappedTourPayments].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        // Compute summary totals
        const totalPaid = allPayments
            .filter(p => p.status === "Succeeded" && !p.isRefund)
            .reduce((sum, p) => sum + p.amount, 0);
        const totalRefunded = allPayments
            .filter(p => p.status === "Refunded" || p.isRefund)
            .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = allPayments
            .filter(p => p.status === "Pending")
            .reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({
            success: true,
            data: allPayments,
            summary: {
                totalPaid: parseFloat(totalPaid.toFixed(2)),
                totalRefunded: parseFloat(totalRefunded.toFixed(2)),
                totalPending: parseFloat(totalPending.toFixed(2)),
                totalTransactions: allPayments.length
            }
        });
    } catch (error) {
        console.error("Error fetching customer payments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function cancelCustomerBooking(req, res) {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const booking = await Booking.findOne({
            where: { id, customer_id: customerId },
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found or not authorized to cancel" });
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
            await t.rollback();
            return res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}` });
        }

        await booking.update({ status: "cancelled" }, { transaction: t });

        await BookedRoom.update(
            { status: "cancelled" },
            {
                where: { booking_id: id },
                transaction: t
            }
        );

        await RoomPayment.update(
            { status: "failed" },
            {
                where: { booking_id: id, status: "pending" },
                transaction: t
            }
        );

        await t.commit();
        res.status(200).json({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function cancelCustomerRental(req, res) {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const customerId = req.user.id;

        const rental = await VehicleBooking.findOne({
            where: { id, customerId },
            include: [{ model: Payment, as: "payments" }],
            transaction: t
        });

        if (!rental) {
            await t.rollback();
            return res.status(404).json({ message: "Rental booking not found or not authorized to cancel" });
        }

        if (["cancelled", "completed", "ongoing", "returned"].includes(rental.status)) {
            await t.rollback();
            return res.status(400).json({ message: `Cannot cancel a rental in status: ${rental.status}` });
        }

        await rental.update({
            status: "cancelled",
            cancelledBy: customerId,
            cancelledAt: new Date(),
            cancellationReason: reason || "Cancelled by customer via dashboard"
        }, { transaction: t });

        // Refund eligibility: 5+ days before pickupDatetime
        const successPayment = rental.payments?.find(p => p.status === "success");
        if (successPayment) {
            const pickupDate = new Date(rental.pickupDatetime);
            const today = new Date();
            const daysBeforePickup = Math.ceil((pickupDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const isEligible = daysBeforePickup >= 5;
            const depositAmount = parseFloat(successPayment.amount || 0);
            const refundAmount = isEligible ? depositAmount : 0;
            const refundRef = "VRF-" + (await import("crypto")).default.randomBytes(6).toString("hex").toUpperCase();

            // Ensure vehicle_refunds table exists
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS vehicle_refunds (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    bookingId INT NOT NULL,
                    bookingNo VARCHAR(50),
                    refundRef VARCHAR(30) NOT NULL UNIQUE,
                    isEligible TINYINT(1) NOT NULL DEFAULT 0,
                    daysBeforePickup INT NOT NULL DEFAULT 0,
                    depositAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
                    refundAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
                    status VARCHAR(30) NOT NULL DEFAULT 'requested',
                    clientReason TEXT,
                    managerNote TEXT,
                    requestedAt DATETIME NOT NULL,
                    processedAt DATETIME,
                    createdAt DATETIME NOT NULL,
                    updatedAt DATETIME NOT NULL
                )
            `, { transaction: t });

            await sequelize.query(`
                INSERT INTO vehicle_refunds
                    (bookingId, bookingNo, refundRef, isEligible, daysBeforePickup, depositAmount, refundAmount,
                     status, clientReason, requestedAt, createdAt, updatedAt)
                VALUES
                    (:bookingId, :bookingNo, :refundRef, :isEligible, :daysBeforePickup, :depositAmount, :refundAmount,
                     'requested', :clientReason, NOW(), NOW(), NOW())
            `, {
                replacements: {
                    bookingId: rental.id,
                    bookingNo: rental.bookingNo,
                    refundRef,
                    isEligible: isEligible ? 1 : 0,
                    daysBeforePickup: daysBeforePickup > 0 ? daysBeforePickup : 0,
                    depositAmount,
                    refundAmount,
                    clientReason: reason || "Customer cancelled rental."
                },
                transaction: t
            });

            console.log(`[VEHICLE REFUND] Created ${refundRef} for booking ${rental.bookingNo} — eligible: ${isEligible}`);
        }

        await t.commit();
        res.status(200).json({ success: true, message: "Rental booking cancelled successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error cancelling rental booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function cancelSingleBookedRoom(req, res) {
    const t = await sequelize.transaction();
    try {
        const { bookingId, bookedRoomId } = req.params;
        const customerId = req.user.id;

        // 1. Fetch booking
        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found or not authorized to cancel" });
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
            await t.rollback();
            return res.status(400).json({ message: `Cannot cancel room from a booking that is already ${booking.status}` });
        }

        // 2. Fetch the booked room entry
        const roomEntry = await BookedRoom.findOne({
            where: { id: bookedRoomId, booking_id: bookingId },
            include: [
                {
                    model: Room,
                    as: undefined,
                    attributes: ["id", "room_number", "room_type_id", "occupancy_type_id"]
                }
            ],
            transaction: t
        });

        if (!roomEntry) {
            await t.rollback();
            return res.status(404).json({ message: "Booked room entry not found" });
        }

        if (roomEntry.status === "cancelled" || roomEntry.status === "checked_out") {
            await t.rollback();
            return res.status(400).json({ message: `This room is already ${roomEntry.status}` });
        }

        // 3. Calculate check-in hours difference
        const now = new Date();
        const checkInDate = new Date(roomEntry.checkIn);
        const diffMs = checkInDate - now;
        const diffHrs = diffMs / (1000 * 60 * 60);

        // 4. Calculate stay nights for this room
        const checkOutDate = new Date(roomEntry.checkOut);
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.max(1, Math.round(Math.abs(checkOutDate - checkInDate) / msPerDay));

        // 5. Look up dynamic nightly rate for room type + board type + occupancy
        const board = await BoardType.findOne({
            where: { type: roomEntry.board_type || "Room Only" },
            transaction: t
        });

        const roomPrice = await RoomPrice.findOne({
            where: {
                roomTypeId: roomEntry.Room?.room_type_id,
                occupancyTypeId: roomEntry.Room?.occupancy_type_id,
                boardTypeId: board ? board.id : 1
            },
            transaction: t
        });

        const nightlyPrice = roomPrice ? parseFloat(roomPrice.price) : (parseFloat(booking.total_price) / nights);
        const roomStayCost = roomEntry.price > 0 ? parseFloat(roomEntry.price) : (nightlyPrice * nights);
        const resolvedNightlyRate = roomEntry.price > 0 ? (roomStayCost / nights) : nightlyPrice;

        // 6. Calculate refund/deduction according to policy (48 hours free cancellation rule)
        let refundAmount = 0;
        let policyApplied = "";

        if (diffHrs >= 48) {
            // Free cancellation: 100% refund
            refundAmount = roomStayCost;
            policyApplied = "Free cancellation (>= 48h prior). 100% refunded.";
        } else {
            // Cancellation within 48h: Subject to 1-night charge penalty
            const refundableNights = Math.max(0, nights - 1);
            refundAmount = resolvedNightlyRate * refundableNights;
            policyApplied = "Late cancellation (< 48h prior). 1-night penalty charge applied.";
        }

        // 7. Update booked room status
        await roomEntry.update({ status: "cancelled" }, { transaction: t });

        // 8. Adjust booking total price
        const currentTotal = parseFloat(booking.total_price);
        const newTotal = Math.max(0, currentTotal - refundAmount);
        
        // Recalculate tax if tax exists
        let newTax = 0;
        if (booking.tax_percentage > 0) {
            newTax = newTotal * (booking.tax_percentage / 100);
        }

        await booking.update({
            total_price: newTotal,
            tax: newTax
        }, { transaction: t });

        // 9. If all rooms under this booking are now cancelled, set overall booking status to cancelled
        const activeRoomsCount = await BookedRoom.count({
            where: {
                booking_id: bookingId,
                status: { [Op.notIn]: ["cancelled", "checked_out"] }
            },
            transaction: t
        });

        if (activeRoomsCount === 0) {
            await booking.update({ status: "cancelled" }, { transaction: t });
            
            // Also mark pending payments as failed
            await RoomPayment.update(
                { status: "failed" },
                {
                    where: { booking_id: bookingId, status: "pending" },
                    transaction: t
                }
            );
        }

        await t.commit();
        res.status(200).json({
            success: true,
            message: "Room cancelled successfully",
            policyApplied,
            refundAmount,
            newTotal
        });

    } catch (error) {
        await t.rollback();
        console.error("Error cancelling single room from booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function cancelAirportPickup(req, res) {
    const t = await sequelize.transaction();
    try {
        const { bookingId } = req.params;
        const customerId = req.user.id;

        // 1. Fetch booking
        const booking = await Booking.findOne({
            where: { id: bookingId, customer_id: customerId },
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found or not authorized to cancel airport pickup" });
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
            await t.rollback();
            return res.status(400).json({ message: `Cannot cancel airport pickup for a stay booking that is already ${booking.status}` });
        }

        // 2. Fetch airport pickup record
        const pickup = await AirPortPickup.findOne({
            where: { booking_id: bookingId },
            transaction: t
        });

        if (!pickup) {
            await t.rollback();
            return res.status(404).json({ message: "Airport pickup reservation not found for this booking" });
        }

        if (pickup.status === "CANCELLED") {
            await t.rollback();
            return res.status(400).json({ message: "Airport pickup is already cancelled" });
        }

        // 3. Update pickup status to CANCELLED
        await pickup.update({ status: "CANCELLED" }, { transaction: t });

        // 4. Pickup is paid at the hotel, so cancelling it must not change the room booking total
        const pickupPrice = 0;
        const currentTotal = parseFloat(booking.total_price);
        const newTotal = currentTotal;
        const newTax = booking.tax || 0;

        await booking.update({
            total_price: newTotal,
            tax: newTax
        }, { transaction: t });

        await t.commit();
        res.status(200).json({
            success: true,
            message: "Airport pickup cancelled successfully",
            refundAmount: pickupPrice,
            newTotal
        });

    } catch (error) {
        await t.rollback();
        console.error("Error cancelling airport pickup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const handleContactInquiry = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, email, message)"
            });
        }

        const emailSent = await sendInquiryEmail({ name, email, message });

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to dispatch email notification."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inquiry message received and email dispatched successfully"
        });

    } catch (error) {
        console.error("Error handling contact inquiry:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
