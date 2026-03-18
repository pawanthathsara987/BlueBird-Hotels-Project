const e = require("express");
const Tour = require("../models/tour_package/Tour");

exports.createTour = async (req, res) => {

  try {

    const {
      packageName,
      overview,
      price,
      discount,
      includedItems,
      termsConditions,
      mapLink
    } = req.body;

    // Image saved to disk by multer; build a URL path to store in DB
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const tour = await Tour.create({
      packageName,
      overview,
      price,
      discount,
      image,
      includedItems: typeof includedItems === "string" ? JSON.parse(includedItems) : includedItems,
      termsConditions,
      mapLink
    });

    res.status(201).json({
      success: true,
      message: "Tour added successfully",
      data: tour
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};