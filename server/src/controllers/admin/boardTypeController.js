import { BoardType } from "../../models/index.js";

// Get all board types
const getAllBoardTypes = async (req, res) => {
    try {
        const boardTypes = await BoardType.findAll({
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: boardTypes.length > 0 ? "Board types retrieved successfully" : "No board types found",
            count: boardTypes.length,
            data: boardTypes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { getAllBoardTypes };
