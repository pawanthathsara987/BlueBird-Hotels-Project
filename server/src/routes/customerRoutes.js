import express from "express";
import { registerCustomer, loginCustomer, sendOTP, verifyOTPAndResetPassword } from "../controllers/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/send-otp", sendOTP);
customerRouter.post("/reset-password", verifyOTPAndResetPassword);


export default customerRouter;