import { RoomPackage } from "../../models/index.js";
import supabase from "../../config/supabaseClient.js";
import multer from "multer";

// Configure multer to store in memory (required for Supabase)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Add package
const createPackage = async (req, res) => {
    try {
        const { pname, pprice, maxAdults, maxKids } = req.body;

        // Validate required fields
        if (!pname || !pprice || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Upload image to Supabase
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const { data, error: uploadError } = await supabase.storage
            .from("packages")
            .upload(`images/${fileName}`, req.file.buffer, {
                contentType: req.file.mimetype,
            });

        if (uploadError) {
            return res.status(400).json({
                success: false,
                message: "Image upload failed",
                error: uploadError.message,
            });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from("packages")
            .getPublicUrl(`images/${fileName}`);

        const pimage = publicUrlData.publicUrl;

        // Save to database with Supabase URL
        const crt_package = await RoomPackage.create({
            pname: pname.trim(),
            pprice: Number(pprice),
            pimage,
            maxAdults: Number(maxAdults) || 2,
            maxKids: Number(maxKids) || 0,
        });

        return res.status(201).json({
            success: true,
            message: "Package added successfully",
            data: crt_package,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
};

// Get all packages
const getAllPackages = async (req, res) => {
    try {
        const packages = await RoomPackage.findAll();

        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No packages found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Packages loaded successfully",
            count: packages.length,
            data: packages,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
};

// Update package
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { pname, pprice, maxAdults, maxKids } = req.body;

        const package_ = await RoomPackage.findByPk(id);

        if (!package_) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }

        let pimage = package_.pimage; // Keep old image by default

        // If new file is uploaded
        if (req.file) {
            // Delete old image from Supabase if it exists
            if (package_.pimage) {
                try {
                    const oldFileName = package_.pimage.split('/').pop();
                    await supabase.storage
                        .from("packages")
                        .remove([`images/${oldFileName}`]);
                } catch (err) {
                    console.error("Error deleting old image:", err);
                    // Continue anyway, don't fail the update
                }
            }

            // Upload new image
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from("packages")
                .upload(`images/${fileName}`, req.file.buffer, {
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
                .from("packages")
                .getPublicUrl(`images/${fileName}`);

            pimage = publicUrlData.publicUrl;
        }

        // Update package
        await package_.update({
            pname: pname.trim(),
            pprice: Number(pprice),
            pimage,
            maxAdults: Number(maxAdults),
            maxKids: Number(maxKids),
        });

        return res.status(200).json({
            success: true,
            message: "Package updated successfully",
            data: package_,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
};

// Delete package
const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const package_ = await RoomPackage.findByPk(id);

        if (!package_) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }

        // Delete image from Supabase
        if (package_.pimage) {
            try {
                const fileName = package_.pimage.split('/').pop();
                await supabase.storage
                    .from("packages")
                    .remove([`images/${fileName}`]);
            } catch (err) {
                console.error("Error deleting image:", err);
                // Continue anyway, don't fail the deletion
            }
        }

        // Delete from database
        await package_.destroy();

        return res.status(200).json({
            success: true,
            message: "Package deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",
            error: error.message,
        });
    }
};

export {
    createPackage,
    getAllPackages,
    updatePackage,
    deletePackage
};