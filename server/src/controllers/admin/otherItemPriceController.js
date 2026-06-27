import { OtherItemPrice } from "../../models/index.js";

// Get all other item prices
const getAllOtherItemPrices = async (req, res) => {
    try {
        const itemPrices = await OtherItemPrice.findAll({
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: itemPrices.length > 0 ? "Other item prices retrieved successfully" : "No item prices found",
            count: itemPrices.length,
            data: itemPrices,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Create new other item price
const createOtherItemPrice = async (req, res) => {
    try {
        const { item_name, price, status } = req.body;

        if (!item_name) {
            return res.status(400).json({
                success: false,
                message: "Item name is required",
            });
        }

        if (price === undefined || price === null || isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Valid price is required",
            });
        }

        const newItemPrice = await OtherItemPrice.create({
            item_name,
            price: Number(price),
            status: status !== undefined ? Boolean(status) : true,
        });

        return res.status(201).json({
            success: true,
            message: "Extra charge item added successfully",
            data: newItemPrice,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update other item price
const updateOtherItemPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, price, status } = req.body;

        const itemPrice = await OtherItemPrice.findByPk(id);

        if (!itemPrice) {
            return res.status(404).json({
                success: false,
                message: "Item price record not found",
            });
        }

        const updateData = {};
        if (item_name !== undefined) updateData.item_name = item_name;
        if (price !== undefined && price !== null && !isNaN(Number(price))) updateData.price = Number(price);
        if (status !== undefined) updateData.status = Boolean(status);

        await itemPrice.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Extra charge item updated successfully",
            data: itemPrice,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete other item price
const deleteOtherItemPrice = async (req, res) => {
    try {
        const { id } = req.params;

        const itemPrice = await OtherItemPrice.findByPk(id);

        if (!itemPrice) {
            return res.status(404).json({
                success: false,
                message: "Item price record not found",
            });
        }

        await itemPrice.destroy();

        return res.status(200).json({
            success: true,
            message: "Extra charge item deleted successfully",
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
    getAllOtherItemPrices,
    createOtherItemPrice,
    updateOtherItemPrice,
    deleteOtherItemPrice,
};
