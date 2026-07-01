import { Op } from "sequelize";
import StaffMember from "../models/User/StaffMember.js";
import UserRegisterModel from "../models/User/UserRegisterModel.js";
import Otp from "../models/User/Otp.js";
import QRCode from "qrcode";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import e from "express";
import sequelize from "../config/database.js";
import Role from "../models/User/Role.js";
import DeletedStaffMember from "../models/User/DeletedStaffMember.js";
import supabase from "../config/supabaseClient.js";
dotenv.config();

export async function userLogin(req, res) {
    try {
        const { email, password, role } = req.body;

        if (role) {
            const staffMember = await StaffMember.findOne({
                where: { email: email.trim() },
                include: [
                    {
                        model: Role,
                        where: { roleName: role }
                    }
                ]
            });

            if (!staffMember) {
                return res.status(403).json({
                    message: `You are not authorized to login as a ${role}`
                });
            }
        }

        const user = await UserRegisterModel.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
        const staff = await StaffMember.findOne({
            where: { email: email.trim() },
            include: [Role]
        });

        const tokenPayload = {
            id: staff?.userId || user.id,
            staffId: staff?.staffId || null,
            name: staff?.name || "Staff Member",
            email: email.trim(),
            role: staff?.Role?.roleName || role || "staff"
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        res.json({
            message: "Login successful",
            token: token,
            name: staff?.name || "Staff Member",
            email: email.trim(),
            user: {
                name: staff?.name || "Staff Member",
                email: email.trim(),
                role: staff?.Role?.roleName || role || "staff",
                imageUrl: staff?.imageUrl || null
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}

const uploadImageToSupabase = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage.from("staff-members").upload(
        `images/${fileName}`,
        file.buffer,
        { contentType: file.mimetype, upsert: false }
    );

    if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from("staff-members").getPublicUrl(`images/${fileName}`);
    return data.publicUrl;
};

export async function registerUser(req, res) {

    try {

        const data = req.body;

        console.log(req.body);

        // Check if there is an active staff member with same email, userName, or nicNumber
        const orConditions = [
            { email: data.email.trim() },
            { userName: data.userName.trim() }
        ];
        if (data.nicNumber && data.nicNumber.trim() !== "") {
            orConditions.push({ nicNumber: data.nicNumber.trim() });
        }

        const existingStaff = await StaffMember.findOne({
            where: {
                [Op.or]: orConditions
            }
        });

        if (existingStaff) {
            let conflictField = "email, username, or NIC";
            if (existingStaff.email.toLowerCase() === data.email.trim().toLowerCase()) conflictField = "Email";
            else if (existingStaff.userName.toLowerCase() === data.userName.trim().toLowerCase()) conflictField = "Username";
            else if (data.nicNumber && existingStaff.nicNumber && existingStaff.nicNumber.toLowerCase() === data.nicNumber.trim().toLowerCase()) conflictField = "NIC Number";
            
            return res.status(400).json({
                message: `${conflictField} is already in use by an active staff member.`
            });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImageToSupabase(req.file);
        }

        const staffMember = await StaffMember.create(
            {
                name: data.name,
                userName: data.userName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                roleId: data.roleId,
                nicNumber: data.nicNumber,
                address: data.address,
                imageUrl: imageUrl
            }
        );

        // Reload to get trigger-generated staffId
        await staffMember.reload();

        res.json({
            message: "User registered successfully",
            user: staffMember
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message,
            fullError: error
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

        // Verify if this email actually belongs to a valid staff member
        const staffMember = await StaffMember.findOne({ where: { email: data.email.trim() } });
        if (!staffMember) {
            return res.status(400).json({
                message: "This email is not authorized as a staff member."
            });
        }

        // Verify OTP if the registering role is receptionist, admin, or manager
        if (["receptionist", "admin", "manager"].includes(data.role)) {
            if (!data.otp) {
                return res.status(400).json({
                    message: "Verification code is required"
                });
            }

            const otpRecord = await Otp.findOne({
                where: {
                    email: data.email.trim(),
                    otp: data.otp.trim(),
                    expiresAt: { [Op.gt]: new Date() }
                }
            });

            if (!otpRecord) {
                return res.status(400).json({
                    message: "Invalid or expired verification code"
                });
            }

            // OTP is valid, destroy it so it cannot be reused
            await Otp.destroy({ where: { email: data.email.trim() } });
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

        const users = await StaffMember.findAll({
            include: [
                {
                    model: Role,
                    attributes: ['roleId', 'roleName']
                }
            ]
        });
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
        const staffToUpdate = await StaffMember.findByPk(userId, { include: [Role] });
        if (!staffToUpdate) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const data = req.body;

        if (staffToUpdate.Role?.roleName === 'admin' && data.roleId && parseInt(data.roleId) !== parseInt(staffToUpdate.roleId)) {
            return res.status(403).json({ message: "Admin role cannot be changed" });
        }

        // Check if another active staff member already uses the same email, userName, or nicNumber
        const orConditions = [
            { email: data.email.trim() },
            { userName: data.userName.trim() }
        ];
        if (data.nicNumber && data.nicNumber.trim() !== "") {
            orConditions.push({ nicNumber: data.nicNumber.trim() });
        }

        const existingStaff = await StaffMember.findOne({
            where: {
                [Op.or]: orConditions,
                userId: { [Op.ne]: userId }
            }
        });

        if (existingStaff) {
            let conflictField = "email, username, or NIC";
            if (existingStaff.email.toLowerCase() === data.email.trim().toLowerCase()) conflictField = "Email";
            else if (existingStaff.userName.toLowerCase() === data.userName.trim().toLowerCase()) conflictField = "Username";
            else if (data.nicNumber && existingStaff.nicNumber && existingStaff.nicNumber.toLowerCase() === data.nicNumber.trim().toLowerCase()) conflictField = "NIC Number";
            
            return res.status(400).json({
                message: `Another active staff member is already using this ${conflictField}.`
            });
        }

        let imageUrl = data.imageUrl;

        if (req.file) {
            imageUrl = await uploadImageToSupabase(req.file);

            const oldStaffMember = await StaffMember.findByPk(userId);
            if (oldStaffMember && oldStaffMember.imageUrl) {
                try {
                    const oldPath = oldStaffMember.imageUrl.split("/staff-members/")[1];
                    if (oldPath) {
                        await supabase.storage.from("staff-members").remove([oldPath]);
                    }
                } catch (e) {
                    console.error("Error deleting old profile image:", e);
                }
            }
        }

        await StaffMember.update({
            name: data.name,
            userName: data.userName,
            email: data.email,
            roleId: data.roleId,
            phoneNumber: data.phoneNumber,
            nicNumber: data.nicNumber,
            address: data.address,
            imageUrl: imageUrl
        }, {
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
        const deletedCount = await sequelize.transaction(async (transaction) => {
            const staffMember = await StaffMember.findOne({
                where: { userId: userId },
                transaction
            });

            if (!staffMember) {
                return null;
            }

            await UserRegisterModel.destroy({
                where: { email: staffMember.email },
                transaction
            });

            return StaffMember.destroy({
                where: { userId: userId },
                transaction
            });
        });

        if (deletedCount === null) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully from staff and login records" });
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
                    { phoneNumber: { [Op.like]: `%${query}%` } },
                    { nicNumber: { [Op.like]: `%${query}%` } },
                    { address: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: Role,
                    where: {
                        roleName: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    required: false
                }
            ]
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

        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const targetRole = role || "receptionist";

        const staffMember = await StaffMember.findOne({
            where: { email: email.trim() },
            include: [
                {
                    model: Role,
                    where: { roleName: targetRole }
                }
            ]
        });

        if (!staffMember) {
            return res.json({
                showLogin: false,
                showRegister: false,
                message: `Email is not authorized as a ${targetRole}`
            });
        }

        const registeredUser = await UserRegisterModel.findOne({
            where: { email: email.trim() }
        });

        if (registeredUser) {
            return res.json({
                showLogin: true,
                showRegister: false
            });
        }

        if (["receptionist", "admin", "manager"].includes(targetRole)) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

            await Otp.destroy({ where: { email: email.trim() } });
            await Otp.create({
                email: email.trim(),
                otp: otpCode,
                expiresAt
            });

            const roleCapitalized = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
            try {
                await sendEmail({
                    to: email.trim(),
                    subject: `BlueBird Hotels - ${roleCapitalized} Portal Verification Code`,
                    text: `Your verification code is: ${otpCode}. Please use this code to register your password and log in.`
                });
            } catch (err) {
                console.error("Failed to send verification code email:", err);
                return res.status(500).json({
                    message: "Failed to send verification code email. Please check server logs or email configuration.",
                    error: err.message
                });
            }

            return res.json({
                showLogin: false,
                showRegister: true,
                message: "A verification code has been sent to your email. Please enter it to complete registration."
            });
        }

        return res.json({
            showLogin: false,
            showRegister: true
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

        try {
            await sendEmail({
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP for password reset is: ${otpCode}`
            });
            res.json({
                message: "OTP sent successfully"
            });
        } catch (err) {
            console.error("Failed to send OTP email:", err);
            return res.status(500).json({
                message: "Failed to send OTP email",
                error: err.message
            });
        }

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

        // Retrieve the staff member's role to inform the frontend redirect destination
        const staffMember = await StaffMember.findOne({
            where: { email: email.trim() },
            include: [{ model: Role }]
        });
        const roleName = staffMember?.Role?.roleName || "receptionist";

        res.json({
            message: "Password reset successfully",
            role: roleName
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
}

export async function addUserRoles(req, res) {
    try {
        const { roleName } = req.body;
        const newRole = await Role.create({ roleName: roleName });
        res.json({
            message: "Role added successfully",
            role: newRole
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add role",
            error: error.message
        });
    }
}

export async function getAllRoles(req, res) {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch roles",
            error: error.message
        });
    }
}

export async function searchDeletedUsers(req, res) {

    const query = req.params.query || "";

    try {

        const users = await StaffMember.findAll({
            where: {
                deletedAt: { [Op.ne]: null },
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { userName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } },
                    { phoneNumber: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: Role,
                    attributes: ['roleId', 'roleName']
                }
            ],
            paranoid: false
        });

        const formattedUsers = users.map(user => {
            const u = user.toJSON();
            return {
                ...u,
                roleName: user.Role ? user.Role.roleName : "Staff"
            };
        });

        res.json(formattedUsers);

    } catch (error) {

        res.status(500).json({
            message: "Failed to search deleted users",
            error: error.message
        });
    }
}

export async function getAllDeletedUsers(req, res) {
    try {
        const users = await StaffMember.findAll({
            where: {
                deletedAt: { [Op.ne]: null }
            },
            include: [
                {
                    model: Role,
                    attributes: ['roleId', 'roleName']
                }
            ],
            paranoid: false
        });

        const formattedUsers = users.map(user => {
            const u = user.toJSON();
            return {
                ...u,
                roleName: user.Role ? user.Role.roleName : "Staff"
            };
        });

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch deleted users",
            error: error.message
        });
    }
}

export async function getStaffQRCode(req, res) {
    try {
        const { staffId } = req.params;

        const staff = await StaffMember.findOne({ where: { staffId } });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        const payload = {
            staffId,
            type: "attendance",
            version: 1
        };

        const signature = crypto
            .createHmac("sha256", process.env.QR_SECRET || "default_qr_secret_key_123456")
            .update(JSON.stringify(payload))
            .digest("hex");

        const qrData = JSON.stringify({
            ...payload,
            signature
        });

        // Generate QR code as a PNG Buffer in-memory
        const qrBuffer = await QRCode.toBuffer(qrData, {
            width: 400,
            margin: 2
        });

        // Set response headers and return PNG buffer directly
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24h
        return res.send(qrBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}