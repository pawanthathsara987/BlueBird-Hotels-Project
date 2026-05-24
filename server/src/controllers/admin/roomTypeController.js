import { Amenities, RoomType } from "../../models/index.js";
import supabase from "../../config/supabaseClient.js";

const SUPABASE_BUCKET = "room_type";

// get all room types
const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll({
            include: [
                {
                    model: Amenities,
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                },
            ],
        });

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

        let imageUrl = null;

        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .upload(`${type}/${fileName}`, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Image upload failed",
                    error: uploadError.message,
                });
            }

            const { data: publicUrlData } = supabase.storage
                .from(SUPABASE_BUCKET)
                .getPublicUrl(`${type}/${fileName}`);

            imageUrl = publicUrlData.publicUrl;
        }

        const roomType = await RoomType.create({
            type: type.trim(),
            image_url: imageUrl,
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

        const updateData = {};
        if (type) {
            updateData.type = type.trim();
        }

        if (req.file) {
            // Delete old image from Supabase if exists
            if (roomType.image_url) {
                try {
                    const oldFileName = roomType.image_url.split('/').pop();
                    await supabase.storage
                        .from(SUPABASE_BUCKET)
                        .remove([`${type}/${oldFileName}`]);
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            // Upload new image
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .upload(`${type}/${fileName}`, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Image upload failed",
                    error: uploadError.message,
                });
            }

            const { data: publicUrlData } = supabase.storage
                .from(SUPABASE_BUCKET)
                .getPublicUrl(`${type}/${fileName}`);

            updateData.image_url = publicUrlData.publicUrl;
        }

        await roomType.update(updateData);

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

        // Delete image from Supabase if exists
        if (roomType.image_url) {
            try {
                const fileName = roomType.image_url.split('/').pop();
                await supabase.storage
                    .from(SUPABASE_BUCKET)
                    .remove([`${type}/${fileName}`]);
            } catch (err) {
                console.error("Error deleting image from Supabase:", err);
            }
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
