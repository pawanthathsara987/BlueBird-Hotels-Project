import { Tour, TourItem, TourItemAssignment } from '../../models/index.js';

// Create a new tour item
export const createTourItem = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tour item name is required",
      });
    }

    const tourItem = await TourItem.create({ name });

    res.status(201).json({
      success: true,
      message: "Tour item created successfully",
      data: tourItem,
    });
  } catch (error) {
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
    const { name } = req.body;

    const tourItem = await TourItem.findByPk(itemId);

    if (!tourItem) {
      return res.status(404).json({
        success: false,
        message: "Tour item not found",
      });
    }

    if (name) {
      tourItem.name = name;
    }

    await tourItem.save();

    res.status(200).json({
      success: true,
      message: "Tour item updated successfully",
      data: tourItem,
    });
  } catch (error) {
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
      message: "Tour item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


