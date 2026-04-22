import roomModel from "../../models/room_package/roomModel.js";
import roomAmenities from "../../models/room_package/roomAmenities.js";
import packageModel from "../../models/room_package/packageModel.js";
import amenitiesModel from "../../models/room_package/amenitiesModel.js";
import { Op } from "sequelize";

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
            roomNumber: roomNo,
            status,
            packageId,
        });

        if (amenities && amenities.length > 0) {
            const records = amenities.map((amenityId) => ({
                roomId: newRoom.id,
                amenityId: amenityId,
            }));

            await roomAmenities.bulkCreate(records);
        }

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: newRoom
        });


    } catch (error) {

        console.error("ADD ROOM ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create room",
            error: error.message
        });
    }

}


export async function getAllRooms(req, res) {
    try {

        const rooms = await roomModel.findAll({
            include: [
                {
                    model: packageModel,
                    attributes: ["id", "pname"]
                },
                {
                    model: roomAmenities,
                    include: [
                        {
                            model: amenitiesModel,
                            attributes: ["id", "name"]
                        }
                    ]
                }
            ],
            order: [["roomNumber", "ASC"]]
        });
        return res.json({
            success: true,
            data: rooms
        });

    } catch (error) {
        console.error("GET ALL ROOMS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch rooms",
            error: error.message
        });
    }
}

export async function updateRoom(req, res) {
    const roomId = req.params.id;

    try {
        const { roomNo, status, packageId, amenities } = req.body;
        console.log("UPDATE ROOM DATA:", req.body);

        const existingRoom = await roomModel.findOne({
            where: { roomNumber: roomNo }
        });

        if (existingRoom && existingRoom.id != roomId) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        await roomModel.update(
            {
                roomNumber: roomNo,
                roomStatus: status, 
                packageId,
            },
            {
                where: { id: roomId }
            }
        );

        await roomAmenities.destroy({ where: { roomId } });

        if (amenities && amenities.length > 0) {
            const records = amenities.map((amenityId) => ({
                roomId,
                amenityId,
            }));

            await roomAmenities.bulkCreate(records);
        }

        return res.json({
            success: true,
            message: "Room updated successfully"
        });

    } catch (error) {
        console.error("UPDATE ROOM ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update room",
            error: error.message
        });
    }
}

export async function deleteRoom(req, res) {
    const roomId = req.params.id;
    try {
        await roomAmenities.destroy({ where: { roomId } });
        await roomModel.destroy({ where: { id: roomId } });
        return res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("DELETE ROOM ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete room",
            error: error.message
        });
    }
}

export async function searchRooms(req, res) {

    const query = req.params.query || "";

    try {

        const rooms = await roomModel.findAll({
            where: {
                [Op.or]: [
                    { roomNumber: { [Op.like]: `%${query}%` } },
                    { roomStatus: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        return res.json({
            success: true,
            data: rooms
        });

    } catch (error) {
        console.error("SEARCH ROOMS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search rooms",
            error: error.message
        });
    }
}