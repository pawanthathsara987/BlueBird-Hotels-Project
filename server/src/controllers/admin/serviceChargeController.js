import { ServiceCharge } from "../../models/index.js";

// Get all service charges
const getAllServiceCharges = async (req, res) => {
    try {
        const serviceCharges = await ServiceCharge.findAll({
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: serviceCharges.length > 0 ? "Service charges retrieved successfully" : "No service charges found",
            count: serviceCharges.length,
            data: serviceCharges,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


// Update service charge
const updateServiceCharge = async (req, res) => {
    try {
        const { id } = req.params;
        const { service_name, service_Code, price, status } = req.body;

        const serviceCharge = await ServiceCharge.findByPk(id);

        if (!serviceCharge) {
            return res.status(404).json({
                success: false,
                message: "Service charge record not found",
            });
        }

        const updateData = {};
        if (price !== undefined && price !== null && !isNaN(Number(price))) updateData.price = Number(price);
        if (status !== undefined) updateData.status = Boolean(status);

        await serviceCharge.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Service charge updated successfully",
            data: serviceCharge,
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
    getAllServiceCharges,
    updateServiceCharge,
};
