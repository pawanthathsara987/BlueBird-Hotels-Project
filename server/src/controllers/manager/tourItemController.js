import { UniqueConstraintError } from "sequelize";
import { TourItem } from '../../models/index.js';

const normalizeTourItemName = (name) => String(name ?? "").trim();

const validateTourItemName = (name) => {
  if (!name) return "Tour item name is required";
  if (name.length < 2) return "Tour item name must be at least 2 characters";
  if (name.length > 100) return "Tour item name must be at most 100 characters";
  return null;
};

// Create a new tour item
export const createTourItem = async (req, res) => {
  try {
    const name = normalizeTourItemName(req.body?.name);

    const validationError = validateTourItemName(name);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const tourItem = await TourItem.create({ name });

    res.status(201).json({
      success: true,
      message: "Tour item created successfully",
      data: tourItem,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        success: false,
        message: "Tour item already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all tour items
export const getAllTourItems = async (req, res) => {
  try {
    const tourItems = await TourItem.findAll();

    res.status(200).json({
      success: true,
      data: tourItems,
      count: tourItems.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific tour item by ID
export const getTourItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const tourItem = await TourItem.findByPk(itemId);

    if (!tourItem) {
      return res.status(404).json({
        success: false,
        message: "Tour item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tourItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a tour item
export const updateTourItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const name = normalizeTourItemName(req.body?.name);

    const validationError = validateTourItemName(name);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const tourItem = await TourItem.findByPk(itemId);

    if (!tourItem) {
      return res.status(404).json({
        success: false,
        message: "Tour item not found",
      });
    }

    tourItem.name = name;

    await tourItem.save();

    res.status(200).json({
      success: true,
      message: "Tour item updated successfully",
      data: tourItem,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        success: false,
        message: "Tour item already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a tour item
export const deleteTourItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const tourItem = await TourItem.findByPk(itemId);

    if (!tourItem) {
      return res.status(404).json({
        success: false,
        message: "Tour item not found",
      });
    }

    await tourItem.destroy();

    res.status(200).json({
      success: true,
      message: "Tour item removed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


