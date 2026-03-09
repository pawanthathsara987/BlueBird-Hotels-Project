import {Op} from "sequelize";
import StaffMember  from "../models/User/StaffMember.js";
import dotenv from 'dotenv';
dotenv.config();


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

export async function getAllUsers(req, res) {
    try{

        const users = await StaffMember.findAll();
        res.json(users);

    }catch(error) {
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