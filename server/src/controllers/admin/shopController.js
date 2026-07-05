import supabase from "../../config/supabaseClient.js";
import { ShopItem } from "../../models/index.js";

const SHOP_BUCKET = "shop-items";

const parseImageUrls = (imageUrlField) => {
  if (!imageUrlField) return [];
  try {
    const parsed = JSON.parse(imageUrlField);
    return Array.isArray(parsed) ? parsed : [imageUrlField];
  } catch {
    return [imageUrlField];
  }
};

/**
 * Upload single file to Supabase
 */
const uploadImageToSupabase = async (file) => {
  if (!file) return null;

  // Clean filename to prevent weird characters issues
  const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage.from(SHOP_BUCKET).upload(
    `images/${fileName}`,
    file.buffer,
    {
      contentType: file.mimetype,
      upsert: false,
    }
  );

  if (error) {
    throw new Error(`Image upload failed to Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(SHOP_BUCKET).getPublicUrl(`images/${fileName}`);
  return data.publicUrl;
};

/**
 * Delete single file from Supabase
 */
const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes(`/${SHOP_BUCKET}/`)) return;

  const oldPath = imageUrl.split(`/${SHOP_BUCKET}/`)[1];
  if (!oldPath) return;

  try {
    const { error } = await supabase.storage.from(SHOP_BUCKET).remove([oldPath]);
    if (error) {
      console.error(`Failed to delete old image from Supabase: ${error.message}`);
    }
  } catch (err) {
    console.error(`Error deleting image from Supabase: ${err.message}`);
  }
};

// GET /api/admin/shop-items
export const getAllShopItems = async (req, res) => {
  try {
    const items = await ShopItem.findAll({
      order: [["createdAt", "DESC"]],
    });

    // Parse the imageUrl JSON string for frontend use
    const formattedItems = items.map((item) => {
      const itemData = item.toJSON();
      itemData.images = parseImageUrls(itemData.imageUrl);
      return itemData;
    });

    return res.status(200).json({
      success: true,
      count: formattedItems.length,
      data: formattedItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop items",
      error: error.message,
    });
  }
};

// GET /api/admin/shop-items/:id
export const getShopItemById = async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shop item not found",
      });
    }

    const itemData = item.toJSON();
    itemData.images = parseImageUrls(itemData.imageUrl);

    return res.status(200).json({
      success: true,
      data: itemData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop item",
      error: error.message,
    });
  }
};

// POST /api/admin/shop-items
export const createShopItem = async (req, res) => {
  try {
    const { name, description, category, price, availableQuantity } = req.body;

    if (!name || !category || price === undefined || availableQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing: name, category, price, availableQuantity",
      });
    }

    const uploadedUrls = [];

    // Upload files to Supabase if any exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImageToSupabase(file);
        if (url) uploadedUrls.push(url);
      }
    }

    // Save shop item to database
    // Store image URLs as serialized JSON string. First image is the main image.
    const newShopItem = await ShopItem.create({
      name,
      description: description || null,
      category,
      price: parseFloat(price),
      imageUrl: uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : JSON.stringify([]),
      availableQuantity: parseInt(availableQuantity, 10),
    });

    const itemData = newShopItem.toJSON();
    itemData.images = uploadedUrls;

    return res.status(201).json({
      success: true,
      message: "Shop item created successfully",
      data: itemData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create shop item",
      error: error.message,
    });
  }
};

// PUT /api/admin/shop-items/:id
export const updateShopItem = async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shop item not found",
      });
    }

    const { name, description, category, price, availableQuantity } = req.body;

    // existingImages tells us which of the old images were kept by the user
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch {
        existingImages = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      }
    }

    const currentImages = parseImageUrls(item.imageUrl);

    // Identify which current images were removed by the user, and delete them from Supabase
    const imagesToDelete = currentImages.filter((url) => !existingImages.includes(url));
    for (const url of imagesToDelete) {
      await deleteImageFromSupabase(url);
    }

    // Upload new files, if any
    const newUploadedUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImageToSupabase(file);
        if (url) newUploadedUrls.push(url);
      }
    }

    // Combine existing images and newly uploaded images
    const updatedImages = [...existingImages, ...newUploadedUrls];

    // Update database
    await item.update({
      name: name !== undefined ? name : item.name,
      description: description !== undefined ? description : item.description,
      category: category !== undefined ? category : item.category,
      price: price !== undefined ? parseFloat(price) : item.price,
      availableQuantity: availableQuantity !== undefined ? parseInt(availableQuantity, 10) : item.availableQuantity,
      imageUrl: JSON.stringify(updatedImages),
    });

    const itemData = item.toJSON();
    itemData.images = updatedImages;

    return res.status(200).json({
      success: true,
      message: "Shop item updated successfully",
      data: itemData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update shop item",
      error: error.message,
    });
  }
};

// DELETE /api/admin/shop-items/:id
export const deleteShopItem = async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shop item not found",
      });
    }

    // Delete all associated images from Supabase storage
    const images = parseImageUrls(item.imageUrl);
    for (const url of images) {
      await deleteImageFromSupabase(url);
    }

    // Delete item from database
    await item.destroy();

    return res.status(200).json({
      success: true,
      message: "Shop item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete shop item",
      error: error.message,
    });
  }
};
