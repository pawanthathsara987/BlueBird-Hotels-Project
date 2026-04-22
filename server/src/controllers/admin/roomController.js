import roomModel from "../../models/roomModel.js";
import roomAmenities from "../../models/roomAmenities.js";
import packageModel from "../../models/packageModel.js";

export async function addRoom(req, res) {

    try {
        const { roomNo, status, packageId, amenities } = req.body;

        if (!roomNo || !status || !packageId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newRoom = await roomModel.create({
            roomNo,
            status,
            packageId,
            amenities,
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: newRoom
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create room",
            error: error.message
        });
    }

}