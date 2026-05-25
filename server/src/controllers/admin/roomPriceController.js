import { RoomPrice, OccupancyType, RoomType, BoardType } from "../../models/index.js";

// Fetch all configured room prices with associated metadata
export const getAllRoomPrices = async (req, res) => {
    try {
        const prices = await RoomPrice.findAll({
            include: [
                {
                    model: OccupancyType,
                    as: "occupancyType",
                    attributes: ["id", "type", "capacity"],
                },
                {
                    model: RoomType,
                    as: "roomType",
                    attributes: ["id", "type", "image_url"],
                },
                {
                    model: BoardType,
                    as: "boardType",
                    attributes: ["id", "type"],
                }
            ],
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: prices.length > 0 ? "Room prices loaded successfully" : "No room prices configured yet",
            count: prices.length,
            data: prices,
        });
    } catch (error) {
        console.error("GET ALL ROOM PRICES ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load room prices",
            error: error.message,
        });
    }
};

// Fetch metadata options (Occupancy, Room Types, Board Types) & Auto-seed standard Board Types if empty
export const getRoomPriceMetadata = async (req, res) => {
    try {
        // 1. Auto-seed standard Board Types if table is empty
        const boardTypesCount = await BoardType.count();
        if (boardTypesCount === 0) {
            const defaultBoardTypes = [
                { type: "Room Only" },
                { type: "Bed & Breakfast" },
                { type: "Half Board" },
                { type: "Full Board" }
            ];
            await BoardType.bulkCreate(defaultBoardTypes);
            console.log("🌱 Standard Board Types seeded successfully");
        }

        // 2. Fetch all metadata
        const [occupancyTypes, roomTypes, boardTypes] = await Promise.all([
            OccupancyType.findAll({ order: [["type", "ASC"]] }),
            RoomType.findAll({ order: [["type", "ASC"]] }),
            BoardType.findAll({ order: [["type", "ASC"]] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                occupancyTypes,
                roomTypes,
                boardTypes
            }
        });
    } catch (error) {
        console.error("GET ROOM PRICE METADATA ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load pricing metadata",
            error: error.message,
        });
    }
};

// Configure a new room price
export const createRoomPrice = async (req, res) => {
    try {
        const { occupancyTypeId, roomTypeId, boardTypeId, price } = req.body;

        // Validation
        if (!occupancyTypeId || !roomTypeId || !boardTypeId || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid price (greater than or equal to 0)",
            });
        }

        // Check if combination already exists
        const existingPrice = await RoomPrice.findOne({
            where: {
                occupancyTypeId: Number(occupancyTypeId),
                roomTypeId: Number(roomTypeId),
                boardTypeId: Number(boardTypeId)
            }
        });

        if (existingPrice) {
            return res.status(400).json({
                success: false,
                message: "A price configuration for this exact room category, occupancy type, and board type combination already exists.",
            });
        }

        // Save
        const newPrice = await RoomPrice.create({
            occupancyTypeId: Number(occupancyTypeId),
            roomTypeId: Number(roomTypeId),
            boardTypeId: Number(boardTypeId),
            price: priceNum,
        });

        // Load associated data for returning to UI
        const populatedPrice = await RoomPrice.findByPk(newPrice.id, {
            include: [
                { model: OccupancyType, as: "occupancyType" },
                { model: RoomType, as: "roomType" },
                { model: BoardType, as: "boardType" }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Room price configured successfully",
            data: populatedPrice,
        });
    } catch (error) {
        console.error("CREATE ROOM PRICE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to configure room price",
            error: error.message,
        });
    }
};

// Update an existing room price
export const updateRoomPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { occupancyTypeId, roomTypeId, boardTypeId, price } = req.body;

        const priceRecord = await RoomPrice.findByPk(id);
        if (!priceRecord) {
            return res.status(404).json({
                success: false,
                message: "Room price record not found",
            });
        }

        // Validation
        if (!occupancyTypeId || !roomTypeId || !boardTypeId || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid price",
            });
        }

        // Check if combination already exists on ANOTHER record
        const existingPrice = await RoomPrice.findOne({
            where: {
                occupancyTypeId: Number(occupancyTypeId),
                roomTypeId: Number(roomTypeId),
                boardTypeId: Number(boardTypeId)
            }
        });

        if (existingPrice && existingPrice.id !== Number(id)) {
            return res.status(400).json({
                success: false,
                message: "A price configuration for this exact combination already exists.",
            });
        }

        // Update
        await priceRecord.update({
            occupancyTypeId: Number(occupancyTypeId),
            roomTypeId: Number(roomTypeId),
            boardTypeId: Number(boardTypeId),
            price: priceNum,
        });

        // Load associated data for return
        const populatedPrice = await RoomPrice.findByPk(priceRecord.id, {
            include: [
                { model: OccupancyType, as: "occupancyType" },
                { model: RoomType, as: "roomType" },
                { model: BoardType, as: "boardType" }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Room price updated successfully",
            data: populatedPrice,
        });
    } catch (error) {
        console.error("UPDATE ROOM PRICE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update room price",
            error: error.message,
        });
    }
};

// Delete a room price
export const deleteRoomPrice = async (req, res) => {
    try {
        const { id } = req.params;

        const priceRecord = await RoomPrice.findByPk(id);
        if (!priceRecord) {
            return res.status(404).json({
                success: false,
                message: "Room price record not found",
            });
        }

        await priceRecord.destroy();

        return res.status(200).json({
            success: true,
            message: "Room price configuration deleted successfully",
        });
    } catch (error) {
        console.error("DELETE ROOM PRICE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete room price configuration",
            error: error.message,
        });
    }
};
