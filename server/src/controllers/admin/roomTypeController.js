import { Amenities, RoomType, OccupancyType } from "../../models/index.js";
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
                {
                    model: OccupancyType,
                    as: "occupancyType",
                    attributes: ["id", "type", "capacity"],
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

// get room type details by id
const getRoomTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const roomType = await RoomType.findByPk(id, {
            include: [
                {
                    model: Amenities,
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                },
                {
                    model: OccupancyType,
                    as: "occupancyType",
                    attributes: ["id", "type", "capacity"],
                },
            ],
        });

        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: "Room type not found",
            });
        }

        // List every file inside room_type/{roomTypeId}/ from Supabase Storage
        const { data: files, error: listError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .list(id.toString());

        let images = [];
        if (!listError && files) {
            images = files
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: publicUrlData } = supabase.storage
                        .from(SUPABASE_BUCKET)
                        .getPublicUrl(`${id}/${file.name}`);
                    return publicUrlData.publicUrl;
                });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: roomType.id,
                type: roomType.type,
                image_url: roomType.image_url,
                occupancy_type_id: roomType.occupancy_type_id,
                occupancyType: roomType.occupancyType,
                amenities: roomType.Amenities || roomType.amenities || [],
                images: images
            }
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
        const { type, occupancy_type_id, occupancyTypeId } = req.body;
        const resolvedOccupancyTypeId = occupancy_type_id ?? occupancyTypeId;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Type is required",
            });
        }

        if (!resolvedOccupancyTypeId) {
            return res.status(400).json({
                success: false,
                message: "Occupancy type is required",
            });
        }

        // Step 1 & 2: Insert into MySQL and get the generated roomTypeId
        const roomType = await RoomType.create({
            type: type.trim(),
            image_url: null,
            occupancy_type_id: resolvedOccupancyTypeId ? Number(resolvedOccupancyTypeId) : null,
        });

        const roomTypeId = roomType.id;
        let coverUrl = null;

        // Step 3: Upload every selected image into room_type/{roomTypeId}/
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const fileName = file.originalname;
                const filePath = `${roomTypeId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(SUPABASE_BUCKET)
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) {
                    throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
                }

                const { data: publicUrlData } = supabase.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(filePath);

                return {
                    name: fileName,
                    url: publicUrlData.publicUrl
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            // Step 4: The first uploaded image (or selected cover image) becomes the main image.
            const coverImageName = req.body.coverImageName;
            let coverImage = null;

            if (coverImageName) {
                coverImage = uploadedImages.find(img => img.name === coverImageName);
            }
            if (!coverImage && uploadedImages.length > 0) {
                coverImage = uploadedImages[0];
            }

            if (coverImage) {
                coverUrl = coverImage.url;
                await roomType.update({ image_url: coverUrl });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Room type added successfully",
            data: {
                ...roomType.toJSON(),
                image_url: coverUrl
            },
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
        const { type, occupancy_type_id, occupancyTypeId, cover_url, coverImageName } = req.body;
        const resolvedOccupancyTypeId = occupancy_type_id ?? occupancyTypeId;

        if (!resolvedOccupancyTypeId) {
            return res.status(400).json({
                success: false,
                message: "Occupancy type is required",
            });
        }

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
        updateData.occupancy_type_id = Number(resolvedOccupancyTypeId);

        // Parse existingImages from request body to identify which images the user kept
        let existingImages = [];
        if (req.body.existingImages) {
            try {
                existingImages = JSON.parse(req.body.existingImages);
            } catch {
                existingImages = Array.isArray(req.body.existingImages)
                    ? req.body.existingImages
                    : [req.body.existingImages];
            }
        } else {
            // Default to keeping all current images so we don't accidentally delete anything
            const { data: currentFiles } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .list(id.toString());
            
            existingImages = (currentFiles || [])
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: publicUrlData } = supabase.storage
                        .from(SUPABASE_BUCKET)
                        .getPublicUrl(`${id}/${file.name}`);
                    return publicUrlData.publicUrl;
                });
        }

        // List every file inside room_type/{roomTypeId}/ from Supabase Storage
        const { data: files, error: listError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .list(id.toString());

        if (listError) {
            console.error("Error listing files for room type:", listError);
        }

        const currentUrls = (files || [])
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => {
                const { data: publicUrlData } = supabase.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(`${id}/${file.name}`);
                return {
                    name: file.name,
                    url: publicUrlData.publicUrl
                };
            });

        // Identify which current images were removed by the user, and delete them from Supabase
        const urlsToDelete = currentUrls.filter(item => !existingImages.includes(item.url));
        if (urlsToDelete.length > 0) {
            const filePaths = urlsToDelete.map(item => `${id}/${item.name}`);
            const { error: removeError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .remove(filePaths);

            if (removeError) {
                console.error("Error removing files from Supabase during update:", removeError);
            }
        }

        // If all images are deleted, clear the cover image URL
        const finalImageCount = existingImages.length + (req.files ? req.files.length : 0);
        if (finalImageCount === 0) {
            updateData.image_url = null;
        } else if (cover_url) {
            updateData.image_url = cover_url;
        }

        // Upload additional images
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const fileName = file.originalname;
                const filePath = `${id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(SUPABASE_BUCKET)
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) {
                    throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
                }

                const { data: publicUrlData } = supabase.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(filePath);

                return {
                    name: fileName,
                    url: publicUrlData.publicUrl
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            // If a new cover image is selected
            if (coverImageName) {
                const coverImage = uploadedImages.find(img => img.name === coverImageName);
                if (coverImage) {
                    updateData.image_url = coverImage.url;
                }
            }
        }

        // Fallback: If we have images but cover image URL is not defined (e.g. old cover was deleted, and no new cover was explicitly chosen)
        if (finalImageCount > 0 && !updateData.image_url && !coverImageName) {
            if (existingImages.length > 0) {
                updateData.image_url = existingImages[0];
            }
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

        // Delete all files inside room_type/{roomTypeId}/ from Supabase Storage
        const { data: files, error: listError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .list(id.toString());

        if (listError) {
            console.error("Error listing files for deletion:", listError);
        }

        if (files && files.length > 0) {
            const filePaths = files.map(file => `${id}/${file.name}`);
            const { error: removeError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .remove(filePaths);

            if (removeError) {
                console.error("Error removing files from Supabase Storage:", removeError);
            }
        }

        // Then delete the room type record from MySQL
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

// delete a single gallery image
const deleteRoomTypeImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "imageUrl is required",
            });
        }

        const roomType = await RoomType.findByPk(id);
        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: "Room type not found",
            });
        }

        const filename = imageUrl.split('/').pop();
        const filePath = `${id}/${filename}`;

        // Delete only that file from Supabase Storage
        const { error: removeError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .remove([filePath]);

        if (removeError) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete image from storage",
                error: removeError.message,
            });
        }

        // Do not modify the database unless the deleted image is the current cover image.
        if (roomType.image_url === imageUrl) {
            // If the cover image is deleted, choose another existing image as the new cover.
            const { data: remainingFiles, error: listError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .list(id.toString());

            if (listError) {
                console.error("Error listing remaining files:", listError);
            }

            const validFiles = (remainingFiles || []).filter(f => f.name !== '.emptyFolderPlaceholder');
            if (validFiles.length > 0) {
                const newCoverName = validFiles[0].name;
                const { data: publicUrlData } = supabase.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(`${id}/${newCoverName}`);

                await roomType.update({ image_url: publicUrlData.publicUrl });
            } else {
                // If no images remain: Set image_url = NULL.
                await roomType.update({ image_url: null });
            }
        }

        // Fetch remaining images for response
        const { data: remainingFiles } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .list(id.toString());

        const images = (remainingFiles || [])
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => {
                const { data: publicUrlData } = supabase.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(`${id}/${f.name}`);
                return publicUrlData.publicUrl;
            });

        const updatedRoomType = await RoomType.findByPk(id);

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            data: {
                ...updatedRoomType.toJSON(),
                images: images,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export {
    getAllRoomTypes,
    getRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    deleteRoomTypeImage,
};
