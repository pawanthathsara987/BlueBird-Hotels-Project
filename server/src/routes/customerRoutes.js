import express from "express";
import { registerCustomer, loginCustomer, sendOTP, verifyOTPAndResetPassword, googleLogin, refreshToken, logoutCustomer } from "../controllers/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/send-otp", sendOTP);
customerRouter.post("/reset-password", verifyOTPAndResetPassword);
customerRouter.post("/google-login", googleLogin);
customerRouter.post("/refresh", refreshToken);
customerRouter.post("/logout", logoutCustomer);

export default customerRouter;