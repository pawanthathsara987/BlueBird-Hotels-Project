import { Op } from "sequelize";
import { Amenities, OccupancyType, Room, RoomAmenities, RoomType } from "../../models/index.js";
import roomModel from "../../models/room/roomModel.js";

export async function getAllRooms(req, res) {
    try {
        const rooms = await roomModel.findAll({
            include: [
                {
                    model: OccupancyType,
                    as: "occupancyType",
                },
                {
                    model: RoomType,
                    as: "roomType",
                },
                {
                    model: RoomAmenities,
                    include: [
                        {
                            model: Amenities,
                        },
                    ],
                },
            ],
            order: [["id", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            message: rooms.length > 0 ? "Rooms found" : "Rooms not found",
            count: rooms.length,
            data: rooms,
        });
    } catch (error) {
        console.error("GET ROOMS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch rooms",
            error: error.message,
        });
    }
}

export async function searchRooms(req, res) {
    try {
        const query = String(req.params.query || "").trim();

        const rooms = await roomModel.findAll({
            where: {
                [Op.or]: [
                    { room_number: { [Op.like]: `%${query}%` } },
                    { status: { [Op.like]: `%${query}%` } },
                ],
            },
            include: [
                {
                    model: OccupancyType,
                    as: "occupancyType",
                },
                {
                    model: RoomType,
                    as: "roomType",
                },
                {
                    model: RoomAmenities,
                    include: [
                        {
                            model: Amenities,
                        },
                    ],
                },
            ],
            order: [["id", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            message: rooms.length > 0 ? "Rooms found" : "Rooms not found",
            count: rooms.length,
            data: rooms,
        });
    } catch (error) {
        console.error("SEARCH ROOMS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search rooms",
            error: error.message,
        });
    }
}

export async function addRoom(req, res) {

    try {
        const {
            room_number,
            roomNumber,
            occupancy_type_id,
            occupancyTypeId,
            room_type_id,
            roomTypeId,
            floor,
            status,
            kids_allow,
            kidsAllow,
            kids,
            amenities,
            amenityIds,
            selectedAmenities,
        } = req.body;

        const resolvedRoomNumber = room_number ?? roomNumber;
        const resolvedOccupancyTypeId = occupancy_type_id ?? occupancyTypeId;
        const resolvedRoomTypeId = room_type_id ?? roomTypeId ?? null;
        const resolvedFloor = floor === "" || floor === undefined ? null : Number(floor);
        const resolvedKidsAllow = kids_allow ?? kidsAllow ?? false;
        const resolvedKids = kids === "" || kids === undefined ? null : Number(kids);
        const resolvedAmenities = Array.isArray(amenities)
            ? amenities
            : Array.isArray(amenityIds)
                ? amenityIds
                : Array.isArray(selectedAmenities)
                    ? selectedAmenities
                    : [];

        if (!resolvedRoomNumber || !resolvedOccupancyTypeId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newRoom = await roomModel.create({
            room_number: Number(resolvedRoomNumber),
            occupancy_type_id: Number(resolvedOccupancyTypeId),
            room_type_id: resolvedRoomTypeId ? Number(resolvedRoomTypeId) : null,
            floor: Number.isNaN(resolvedFloor) ? null : resolvedFloor,
            status: status || "available",
            kids_allow: Boolean(resolvedKidsAllow),
            kids: Number.isNaN(resolvedKids) ? null : resolvedKids,
        });

        if (resolvedAmenities.length > 0) {
            await RoomAmenities.bulkCreate(
                resolvedAmenities.map((amenityId) => ({
                    roomId: newRoom.id,
                    amenityId: Number(amenityId),
                }))
            );
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

export async function updateRoom(req, res) {
    const roomId = req.params.id;

    try {
        const {
            room_number,
            roomNumber,
            occupancy_type_id,
            occupancyTypeId,
            room_type_id,
            roomTypeId,
            floor,
            status,
            kids_allow,
            kidsAllow,
            kids,
            amenities,
            amenityIds,
            selectedAmenities,
        } = req.body;

        const resolvedRoomNumber = room_number ?? roomNumber;
        const resolvedOccupancyTypeId = occupancy_type_id ?? occupancyTypeId;
        const resolvedRoomTypeId = room_type_id ?? roomTypeId ?? null;
        const resolvedFloor = floor === "" || floor === undefined ? null : Number(floor);
        const resolvedKidsAllow = kids_allow ?? kidsAllow ?? false;
        const resolvedKids = kids === "" || kids === undefined ? null : Number(kids);
        const resolvedAmenities = Array.isArray(amenities)
            ? amenities
            : Array.isArray(amenityIds)
                ? amenityIds
                : Array.isArray(selectedAmenities)
                    ? selectedAmenities
                    : [];

        const existingRoom = await roomModel.findOne({
            where: { room_number: resolvedRoomNumber }
        });

        if (existingRoom && existingRoom.id != roomId) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        await roomModel.update(
            {
                room_number: Number(resolvedRoomNumber),
                occupancy_type_id: Number(resolvedOccupancyTypeId),
                room_type_id: resolvedRoomTypeId ? Number(resolvedRoomTypeId) : null,
                floor: Number.isNaN(resolvedFloor) ? null : resolvedFloor,
                status: status || "available",
                kids_allow: Boolean(resolvedKidsAllow),
                kids: Number.isNaN(resolvedKids) ? null : resolvedKids,
            },
            {
                where: { id: roomId }
            }
        );

        await RoomAmenities.destroy({ where: { roomId: roomId } });

        if (resolvedAmenities.length > 0) {
            await RoomAmenities.bulkCreate(
                resolvedAmenities.map((amenityId) => ({
                    roomId: roomId,
                    amenityId: Number(amenityId),
                }))
            );
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

