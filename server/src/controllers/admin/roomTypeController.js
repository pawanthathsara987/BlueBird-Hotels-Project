import { RoomType } from "../../models/index.js";

// get all room types
const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll();

        return res.status(200).json({
            success: true,
            message: roomTypes.length > 0 ? "Room types found" : "Room types not found",
            count: roomTypes.length,
            data: roomTypes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// create room type
const createRoomType = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Type is required",
            });
        }

        const roomType = await RoomType.create({
            type: type.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Room type added successfully",
            data: roomType,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// update room type
const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        const roomType = await RoomType.findByPk(id);

        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: "Room type not found",
            });
        }

        await roomType.update({ type: type.trim() });

        return res.status(200).json({
            success: true,
            message: "Room type updated successfully",
            data: roomType,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// delete room type
const deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;

        const roomType = await RoomType.findByPk(id);

        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: "Room type not found",
            });
        }

        await roomType.destroy();

        return res.status(200).json({
            success: true,
            message: "Room type deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { getAllRoomTypes, createRoomType, updateRoomType, deleteRoomType };
