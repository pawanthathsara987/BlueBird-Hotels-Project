import { ShopCategory, ShopItem } from "../../models/index.js";

// GET /api/admin/shop-categories (also public GET /api/shop-categories)
export const getAllShopCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.findAll({
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop categories",
      error: error.message,
    });
  }
};

// POST /api/admin/shop-categories (admin only)
export const createShopCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    // Check if category name already exists
    const existing = await ShopCategory.findOne({
      where: { name: trimmedName },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${trimmedName}" already exists`,
      });
    }

    const newCategory = await ShopCategory.create({
      name: trimmedName,
      description: description ? description.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create shop category",
      error: error.message,
    });
  }
};

// PUT /api/admin/shop-categories/:id (admin only)
export const updateShopCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await ShopCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Shop category not found",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();
    const oldName = category.name;

    // Check if name is taken by another category
    if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = await ShopCategory.findOne({
        where: { name: trimmedName },
      });
      if (existing && existing.categoryId !== parseInt(id, 10)) {
        return res.status(400).json({
          success: false,
          message: `Category "${trimmedName}" already exists`,
        });
      }
    }

    // Update category
    await category.update({
      name: trimmedName,
      description: description !== undefined ? (description ? description.trim() : null) : category.description,
    });

    // If the name changed, propagate rename to ShopItem
    if (trimmedName !== oldName) {
      await ShopItem.update(
        { category: trimmedName },
        { where: { category: oldName } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update shop category",
      error: error.message,
    });
  }
};

// DELETE /api/admin/shop-categories/:id (admin only)
export const deleteShopCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ShopCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Shop category not found",
      });
    }

    // Check if category name is currently used by any shop item
    const count = await ShopItem.count({
      where: { category: category.name },
    });

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it is currently assigned to ${count} product(s). Please edit or delete those products first.`,
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete shop category",
      error: error.message,
    });
  }
};
