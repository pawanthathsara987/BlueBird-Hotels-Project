import express from "express";
import {
    registerCustomer,
    loginCustomer,
    sendOTP,
    verifyOTPAndResetPassword,
    googleLogin,
    refreshToken,
    logoutCustomer,
    updateCustomerProfile,
    changePassword,
    getCustomerProfile,
    getCustomerBookings,
    getCustomerRentals,
    getCustomerTours,
    getCustomerPayments,
    submitRoomStayReview,
    submitVehicleReview,
    submitTourReview,
    getCustomerDashboardReviews,
    getPublicReviews,
    cancelCustomerBooking,
    cancelCustomerRental,
    cancelSingleBookedRoom,
    cancelAirportPickup,
    handleContactInquiry,
    getCustomerWallet
} from "../controllers/customerController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const customerRouter = express.Router();

// ── PUBLIC routes (no token required) ────────────────────────────────────────
customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/send-otp", sendOTP);
customerRouter.post("/reset-password", verifyOTPAndResetPassword);
customerRouter.post("/google-login", googleLogin);
customerRouter.post("/refresh", refreshToken);
customerRouter.post("/logout", logoutCustomer);
customerRouter.post("/contact", handleContactInquiry);
customerRouter.get("/public-reviews", getPublicReviews);

// ── PROTECTED routes (valid customer JWT required) ────────────────────────────
customerRouter.put("/update-profile", requireAuth, requireRole("customer"), updateCustomerProfile);
customerRouter.put("/change-password", requireAuth, requireRole("customer"), changePassword);

customerRouter.get("/profile", requireAuth, requireRole("customer"), getCustomerProfile);
customerRouter.get("/bookings", requireAuth, requireRole("customer"), getCustomerBookings);
customerRouter.get("/rentals", requireAuth, requireRole("customer"), getCustomerRentals);
customerRouter.get("/tours", requireAuth, requireRole("customer"), getCustomerTours);
customerRouter.get("/payments", requireAuth, requireRole("customer"), getCustomerPayments);
customerRouter.get("/reviews", requireAuth, requireRole("customer"), getCustomerDashboardReviews);
customerRouter.get("/wallet", requireAuth, requireRole("customer"), getCustomerWallet);


customerRouter.post("/bookings/:id/cancel", requireAuth, requireRole("customer"), cancelCustomerBooking);
customerRouter.post("/bookings/:bookingId/rooms/:bookedRoomId/cancel", requireAuth, requireRole("customer"), cancelSingleBookedRoom);
customerRouter.post("/bookings/:bookingId/reviews", requireAuth, requireRole("customer"), submitRoomStayReview);
customerRouter.post("/rentals/:id/review", requireAuth, requireRole("customer"), submitVehicleReview);
customerRouter.post("/tours/:id/review", requireAuth, requireRole("customer"), submitTourReview);
customerRouter.post("/bookings/:bookingId/airport-pickup/cancel", requireAuth, requireRole("customer"), cancelAirportPickup);
customerRouter.post("/rentals/:id/cancel", requireAuth, requireRole("customer"), cancelCustomerRental);


export default customerRouter;