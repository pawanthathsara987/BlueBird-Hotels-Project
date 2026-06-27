import { OccupancyType } from "../../models/index.js";

const getAllOccupancyTypes = async (req, res) => {
    try {
        const occupancyTypes = await OccupancyType.findAll({
            order: [["type", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: occupancyTypes.length > 0 ? "Occupancy types found" : "Occupancy types not found",
            count: occupancyTypes.length,
            data: occupancyTypes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { getAllOccupancyTypes };