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
    cancelCustomerBooking,
    cancelCustomerRental,
    cancelSingleBookedRoom
} from "../controllers/customerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const customerRouter = express.Router();

customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/send-otp", sendOTP);
customerRouter.post("/reset-password", verifyOTPAndResetPassword);
customerRouter.post("/google-login", googleLogin);
customerRouter.post("/refresh", refreshToken);
customerRouter.post("/logout", logoutCustomer);
customerRouter.put("/update-profile", requireAuth, updateCustomerProfile);
customerRouter.put("/change-password", requireAuth, changePassword);

customerRouter.get("/profile", requireAuth, getCustomerProfile);
customerRouter.get("/bookings", requireAuth, getCustomerBookings);
customerRouter.get("/rentals", requireAuth, getCustomerRentals);
customerRouter.get("/tours", requireAuth, getCustomerTours);
customerRouter.get("/payments", requireAuth, getCustomerPayments);
customerRouter.post("/bookings/:id/cancel", requireAuth, cancelCustomerBooking);
customerRouter.post("/bookings/:bookingId/rooms/:bookedRoomId/cancel", requireAuth, cancelSingleBookedRoom);
customerRouter.post("/rentals/:id/cancel", requireAuth, cancelCustomerRental);

export default customerRouter;