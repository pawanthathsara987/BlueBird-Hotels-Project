import { Op } from "sequelize";
import StaffMember from "../models/User/StaffMember.js";
import UserRegisterModel from "../models/User/UserRegisterModel.js";
import Otp from "../models/User/Otp.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import e from "express";
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

export async function registerUser(req, res) {

    try {

        const data = req.body;

        const staffMember = await StaffMember.create(
            {
                name: data.name,
                userName: data.userName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                role: data.role,
            }
        );

        res.json({
            message: "User registered successfully",
            user: staffMember
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
}

export async function registerStaffMember(req, res) {
    try {

        const data = req.body;

        if (data.password !== data.confirmPassword) {
            return res.status(400).json({
                message: "Password do not match"
            });
        }

        const hashedPassword = bcrypt.hashSync(data.password, 10);

        const newStaffMember = await UserRegisterModel.create({
            email: data.email,
            password: hashedPassword
        });

        res.json({
            message: "Staff member registered successfully",
            user: newStaffMember
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register staff member",
            error: error.message
        });
    }

}

export async function getAllUsers(req, res) {
    try {

        const users = await StaffMember.findAll();
        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
}

export async function updateUser(req, res) {

    const userId = req.params.id;

    try {
        await StaffMember.update(req.body, {
            where: { userId: userId }
        });
        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
}

export async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        const deletedCount = await StaffMember.destroy({
            where: { userId: userId }
        });

        if (!deletedCount) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
}

export async function searchUsers(req, res) {

    const query = req.params.query || "";

    try {

        const users = await StaffMember.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { userName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } },
                    { phoneNumber: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        return res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to search users",
            error: error.message
        });
    }
}

export async function verifyEmail(req, res) {
    try {

        const email = req.body.email;

        const registeredUser = await UserRegisterModel.findOne({
            where: { email: email }
        });

        if (registeredUser) {
            return res.json({
                showLogin: true,
                showRegister: false
            });
        }

        const staffMember = await StaffMember.findOne({
            where: {
                email: email,
                role: "receptionist"
            }
        });

        if (staffMember) {
            return res.json({
                showLogin: false,
                showRegister: true
            });
        }

        return res.json({
            showLogin: false,
            showRegister: false,
            message: "Email is not allowed"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to verify email",
            error: error.message
        });
    }
}

export async function sendOtp(req, res) {

    try {

        const email = req.body.email;
        const user = await UserRegisterModel.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await Otp.destroy({ where: { email: email } });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.create({
            email,
            otp: otpCode,
            expiresAt
        });

        const message = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otpCode}`
        }

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.error("Failed to send OTP email:", err);
                return res.status(500).json({
                    message: "Failed to send OTP email",
                    error: err.message
                });
            } else {
                res.json({
                    message: "OTP sent successfully"
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }

}

export async function verifyOtpAndResetPassword(req, res) {

    try {
        const otp = req.body.otp;
        const email = req.body.email;
        const newPassword = req.body.newPassword;

        const otpRecord = await Otp.findOne({ where: { email: email, otp: otp, expiresAt: { [Op.gt]: new Date() } } });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        await Otp.destroy({ where: { email: email } });
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await UserRegisterModel.update(
            {
                password: hashedPassword
            },
            { where: { email: email } }
        );

        res.json({
            message: "Password reset successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
}