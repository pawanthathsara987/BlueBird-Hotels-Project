import Customer from "../models/User/Customer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomerOTP from "../models/User/CustomerOTP.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { response } from "express";
dotenv.config();


const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    }
);

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

        const hashedPassword = await bcrypt.hashSync(data.password, 10);

        const newCustomer = await Customer.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phoneNumber: data.phoneNumber,
            country: data.country
        });

        const userResponse = {
            id: newCustomer.customerId,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
            phoneNumber: newCustomer.phoneNumber,
            country: newCustomer.country
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
            id: customer.customerId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            country: customer.country
        };

        const token = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        console.log(token);
        res.status(200).json({
            message: "Customer logged in successfully",
            token: token,
            user: userResponse
        });

    } catch (error) {
        console.error("Error logging in customer:", error);
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

        const message = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(message);
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

export async function googleLogin(req, res){

    const accessToken = req.body.token;

    if(!accessToken){
        return res.status(400).json({
            message: "Access token is required"
        });
    }

    try{

        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log(response.data);

        const user = await Customer.findOne({ where: { email: response.data.email } });

        if (user && !user.googleAuth) {
            return res.status(400).json({
                message: "Please login using email & password"
            });
        }

        if(user == null){
            const newCustomer = await Customer.create({
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                email: response.data.email,
                googleAuth: true
            });

            const userResponse = {
                id: newCustomer.customerId,
                firstName: newCustomer.firstName,
                lastName: newCustomer.lastName,
                email: newCustomer.email
            };
            const token = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

            res.status(200).json({
                message: "Customer logged in successfully",
                token: token,
                user: userResponse
            });
        } else {
            const userResponse = {
                id: user.customerId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };
            const token = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

            res.status(200).json({
                message: "Customer logged in successfully",
                token: token,
                user: userResponse
            });
        }

    } catch (error) {
        console.error("Error during Google login:", error);
        res.status(401).json({
            message: "Google authentication failed"
        });
    }
}