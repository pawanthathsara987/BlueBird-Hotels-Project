import { PackageImage, RoomPackage } from "../../models/index.js";
import supabase from "../../config/supabaseClient.js";

const SUPABASE_BUCKET = "packages";

const getPackageId = (payload) => Number(payload?.packageId ?? payload?.package_id);

const extractStoragePathFromPublicUrl = (publicUrl) => {
    if (!publicUrl || typeof publicUrl !== "string") return null;

    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    const markerIndex = publicUrl.indexOf(marker);

    if (markerIndex !== -1) {
        return decodeURIComponent(publicUrl.substring(markerIndex + marker.length));
    }

    return null;
};

const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.originalname}`;
    const storagePath = `package-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
        });

    if (uploadError) {
        throw new Error(uploadError.message || "Image upload failed");
    }

    const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storagePath);

    return {
        imageUrl: publicUrlData.publicUrl,
        storagePath,
    };
};

const deleteImageFromSupabase = async (publicUrl) => {
    const storagePath = extractStoragePathFromPublicUrl(publicUrl);
    if (!storagePath) return;

    const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove([storagePath]);

    if (error) {
        throw new Error(error.message || "Failed to delete image from storage");
    }
};

const addImages = async (req, res) => {
    try {
        const packageId = getPackageId(req.body);
        const files = Array.isArray(req.files) ? req.files : [];

        if (!packageId || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide packageId and one or more image files",
            });
        }

        const packageRow = await RoomPackage.findByPk(packageId);
        if (!packageRow) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }

        const createdImages = [];

        for (const file of files) {
            const uploadResult = await uploadImageToSupabase(file);

            const created = await PackageImage.create({
                packageId,
                imageUrl: uploadResult.imageUrl,
            });

            createdImages.push(created);
        }

        return res.status(201).json({
            success: true,
            message: "Package images uploaded successfully",
            count: createdImages.length,
            data: createdImages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const getPackageImagesByPackageId = async (req, res) => {
    try {
        const packageId = Number(req.params.packageId);

        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: "Invalid package id",
            });
        }

        const packageRow = await RoomPackage.findByPk(packageId);
        if (!packageRow) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }

        const images = await PackageImage.findAll({
            where: { packageId },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            message: images.length > 0 ? "Package images loaded successfully" : "No package images found",
            count: images.length,
            data: images,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const updatePackageImage = async (req, res) => {
    try {
        const imageId = Number(req.params.id);
        const packageId = getPackageId(req.body);

        if (!imageId || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Invalid image id or missing image file",
            });
        }

        const imageRow = await PackageImage.findByPk(imageId);
        if (!imageRow) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        if (packageId && Number(imageRow.packageId) !== Number(packageId)) {
            return res.status(400).json({
                success: false,
                message: "Image does not belong to the selected package",
            });
        }

        const uploadResult = await uploadImageToSupabase(req.file);

        const oldUrl = imageRow.imageUrl;
        await imageRow.update({
            imageUrl: uploadResult.imageUrl,
        });

        if (oldUrl) {
            try {
                await deleteImageFromSupabase(oldUrl);
            } catch (cleanupError) {
                console.error("Failed to remove old package image from storage:", cleanupError.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Package image updated successfully",
            data: imageRow,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const deletePackageImage = async (req, res) => {
    try {
        const imageId = Number(req.params.id);
        const packageId = getPackageId(req.body);

        if (!imageId) {
            return res.status(400).json({
                success: false,
                message: "Invalid image id",
            });
        }

        const imageRow = await PackageImage.findByPk(imageId);
        if (!imageRow) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        if (packageId && Number(imageRow.packageId) !== Number(packageId)) {
            return res.status(400).json({
                success: false,
                message: "Image does not belong to the selected package",
            });
        }

        const oldUrl = imageRow.imageUrl;
        await imageRow.destroy();

        if (oldUrl) {
            try {
                await deleteImageFromSupabase(oldUrl);
            } catch (cleanupError) {
                console.error("Failed to remove deleted package image from storage:", cleanupError.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Package image deleted successfully",
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
    addImages,
    getPackageImagesByPackageId,
    updatePackageImage,
    deletePackageImage,
};