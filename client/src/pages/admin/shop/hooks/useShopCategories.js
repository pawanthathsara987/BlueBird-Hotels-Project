import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function useShopCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/shop-categories`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        toast.error("Failed to load shop categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error?.response?.data?.message || "Failed to load shop categories");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name, description) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/shop-categories`, {
        name,
        description,
      });
      if (response.data.success) {
        toast.success("Category added successfully");
        await fetchCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error?.response?.data?.message || "Failed to add category");
      return false;
    }
  };

  const updateCategory = async (id, name, description) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/shop-categories/${id}`, {
        name,
        description,
      });
      if (response.data.success) {
        toast.success("Category updated successfully");
        await fetchCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error?.response?.data?.message || "Failed to update category");
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/shop-categories/${id}`);
      if (response.data.success) {
        toast.success("Category deleted successfully");
        await fetchCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error?.response?.data?.message || "Failed to delete category");
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
