import { RoomPackage } from "../../models/index.js";

// Add package
const createPackage = async (req, res) => {
    try {
        const { pname, pprice, pimage, pmaxAdults, pmaxKids } = req.body;

        const crt_package = await RoomPackage.create({
            pname,
            pprice,
            pimage,
            maxAdults: pmaxAdults,
            maxKids: pmaxKids,
        });

        return res.status(201).json({
            success: true,
            message: "package added Successful",
            data: crt_package,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",  
            error: error.message,
        });
    }
}

// get all packages
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
            message: "Packages found",
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
}


// update package
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { pname, pprice, pimage, pmaxAdults, pmaxKids } = req.body;

        const package_ = await RoomPackage.findByPk(id);

        if (!package_) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }


        await package_.update({
            pname,
            pprice,
            pimage,
            maxAdults: pmaxAdults,
            maxKids: pmaxKids,
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
}


// delete package
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
}

export {
    createPackage,
    getAllPackages,
    updatePackage,
    deletePackage
}