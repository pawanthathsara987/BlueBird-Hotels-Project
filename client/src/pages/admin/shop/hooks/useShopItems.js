import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function useShopItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/shop-items`);
      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        toast.error("Failed to load shop items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error(error?.response?.data?.message || "Failed to load shop items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    setItems,
    loading,
    fetchItems,
  };
}
