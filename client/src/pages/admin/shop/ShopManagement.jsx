import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";

import useShopItems from "./hooks/useShopItems";
import useShopCategories from "./hooks/useShopCategories";
import ShopHeader from "./components/ShopHeader";
import ShopStats from "./components/ShopStats";
import ShopFilters from "./components/ShopFilters";
import ShopTable from "./components/ShopTable";

import AddEditItemModal from "./modals/AddEditItemModal";
import ViewItemDetailsModal from "./modals/ViewItemDetailsModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import ManageCategoriesModal from "./modals/ManageCategoriesModal";

export default function ShopManagement() {
  const { items, loading, fetchItems } = useShopItems();
  const {
    categories,
    loading: loadingCategories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useShopCategories();
  
  // Filter/Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Delete confirmation states
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category change handlers to keep items list in sync
  const handleAddCategory = async (name, description) => {
    return await addCategory(name, description);
  };

  const handleUpdateCategory = async (id, name, description) => {
    const success = await updateCategory(id, name, description);
    if (success) {
      fetchItems(); // Reload items because their category names may have changed
    }
    return success;
  };

  const handleDeleteCategory = async (id) => {
    return await deleteCategory(id);
  };

  // Handle modal triggers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (item) => {
    setViewingItem(item);
  };

  const handleDeleteTrigger = (item) => {
    setItemToDelete(item);
    setShowDeletePopup(true);
  };

  const closeDeletePopup = () => {
    if (isDeleting) return;
    setShowDeletePopup(false);
    setItemToDelete(null);
  };

  // Perform actual item deletion
  const handleDeleteItem = async () => {
    if (!itemToDelete?.itemId) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/admin/shop-items/${itemToDelete.itemId}`
      );
      if (response.data.success) {
        toast.success("Shop item deleted successfully");
        setShowDeletePopup(false);
        setItemToDelete(null);
        fetchItems();
      } else {
        toast.error("Failed to delete shop item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error?.response?.data?.message || "Failed to delete shop item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Form submission handler (Create or Update)
  const handleFormSubmit = async (formDataToSend) => {
    try {
      setIsSubmitting(true);
      
      if (editingItem) {
        // Edit mode
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/admin/shop-items/${editingItem.itemId}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data.success) {
          toast.success("Shop item updated successfully");
          setIsModalOpen(false);
          fetchItems();
        } else {
          toast.error("Failed to update shop item");
        }
      } else {
        // Add mode
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/admin/shop-items`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data.success) {
          toast.success("Shop item added successfully");
          setIsModalOpen(false);
          fetchItems();
        } else {
          toast.error("Failed to add shop item");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message || "Failed to save shop item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Sort logic
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "qty-low") return a.availableQuantity - b.availableQuantity;
      if (sortBy === "qty-high") return b.availableQuantity - a.availableQuantity;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="p-4 md:p-6 space-y-6 text-slate-700">
      {/* Header section */}
      <ShopHeader 
        onAddClick={handleOpenAddModal} 
        onManageCategoriesClick={() => setIsCategoriesModalOpen(true)}
      />

      {/* Metrics Banner */}
      <ShopStats items={items} />

      {/* Filters and Search toolbar */}
      <ShopFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
      />

      {/* List / Table Area */}
      {loading ? (
        <div className="py-24 text-center animate-fadeIn">
          <Loader />
          <p className="text-slate-400 text-sm mt-4 font-medium">Loading shop items...</p>
        </div>
      ) : (
        <ShopTable
          items={filteredItems}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTrigger}
        />
      )}

      {/* Details modal view */}
      <ViewItemDetailsModal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
      />

      {/* Add / Edit Form Modal */}
      <AddEditItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeletePopup}
        onClose={closeDeletePopup}
        onConfirm={handleDeleteItem}
        title={
          <span>
            Delete shop item <span className="text-rose-600">"{itemToDelete?.name}"</span>?
          </span>
        }
        message="This action is permanent and cannot be undone. All associated image assets in Supabase storage will also be deleted."
        isLoading={isDeleting}
      />

      {/* Categories Management Modal */}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        loadingCategories={loadingCategories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
