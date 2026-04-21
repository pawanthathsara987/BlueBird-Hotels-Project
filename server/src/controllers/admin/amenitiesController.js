import { col, fn } from "sequelize";
import { Amenities, RoomAmenities } from "../../models/index.js";

// add amenity
const addAmenitie = async (req, res) => {
    try {
        const { name, icon } = req.body;

        if (!name || !icon) {
            return res.status(400).json({
                success: false,
                message: "Name and icon are required",
            });
        }

        const amenity = await Amenities.create({
            name,
            icon,
        });

        return res.status(201).json({
            success: true,
            message: "Amenity added successfully",
            data: amenity,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// get all amenities
const getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenities.findAll();

        return res.status(200).json({
            success: true,
            message: amenities.length > 0 ? "Amenities found" : "Amenities not found",
            count: amenities.length,
            data: amenities,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// update amenity
const updateAmenitie = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;

        const amenity = await Amenities.findByPk(id);

        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: "Amenity not found",
            });
        }

        await amenity.update({ name, icon });

        return res.status(200).json({
            success: true,
            message: "Amenity updated successfully",
            data: amenity,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// delete amenity
const deleteAmenitie = async (req, res) => {
    try {
        const { id } = req.params;

        const amenity = await Amenities.findByPk(id);

        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: "Amenity not found",
            });
        }

        await amenity.destroy();

        return res.status(200).json({
            success: true,
            message: "Amenity deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

const AmenitieswithAssignRoom = async (req, res) => {
    try {
        const amenities = await Amenities.findAll({
            attributes: [
                "id",
                "name",
                "icon",
                [fn("COUNT", col("RoomAmenities.roomId")), "Assign_Rooms"]
            ],
            include: [
                {
                    model: RoomAmenities,
                    attributes: [],
                    required: false
                }
            ],
            group: ["Amenities.id", "Amenities.name", "Amenities.icon"],
            subQuery: false
        });


        res.status(200).json({
            success: true,
            message: amenities.length > 0 ? "" : "Amenities load unsuccessfull",
            data: amenities,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

export {
    addAmenitie,
    getAllAmenities,
    updateAmenitie,
    deleteAmenitie,
    AmenitieswithAssignRoom
}