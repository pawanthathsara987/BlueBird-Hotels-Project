import axios from "axios";
import { Plus, Search, Tag, Activity, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AddEditItemModal from "../../../components/admin/Extra Charges/AddEditItemModal";
import ConfirmDeleteModal from "../../../components/admin/Extra Charges/ConfirmDeleteModal";

const OtherItemPriceView = () => {
    const [isLoading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [currentItem, setCurrentItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation state
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getItems();
    }, []);

    const getItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/other-item-prices`);
            if (response.data && response.data.data) {
                setItems(response.data.data);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Error fetching other item prices:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch items";
            toast.error(errorMessage);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on search and status
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesStatus = true;
            if (statusFilter === "active") {
                matchesStatus = item.status === true;
            } else if (statusFilter === "inactive") {
                matchesStatus = item.status === false;
            }
            return matchesSearch && matchesStatus;
        });
    }, [items, searchTerm, statusFilter]);

    // Open Modal for Add
    const openAddModal = () => {
        setModalMode("add");
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (item) => {
        setModalMode("edit");
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    // Handle Form Submit
    const handleFormSubmit = async (formData) => {
        setIsSaving(true);
        try {
            if (modalMode === "add") {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/other-item-prices`, formData);
                toast.success(response?.data?.message || "Item added successfully");
            } else {
                const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/other-item-prices/${currentItem.id}`, formData);
                toast.success(response?.data?.message || "Item updated successfully");
            }
            setIsModalOpen(false);
            getItems();
        } catch (error) {
            console.error("Error saving item:", error);
            const errMsg = error.response?.data?.message || "Failed to save item details";
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Status directly from table
    const toggleItemStatus = async (item) => {
        try {
            const newStatus = !item.status;
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/other-item-prices/${item.id}`, {
                status: newStatus
            });
            toast.success(`"${item.item_name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
            
            // Optimistic update
            setItems(prevItems => 
                prevItems.map(i => i.id === item.id ? { ...i, status: newStatus } : i)
            );
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to update status");
        }
    };

    // Open Delete confirmation dialog
    const openDeletePopup = (item) => {
        setItemToDelete(item);
        setShowDeletePopup(true);
    };

    const closeDeletePopup = () => {
        if (isDeleting) return;
        setShowDeletePopup(false);
        setItemToDelete(null);
    };

    // Delete item request
    const deleteItem = async () => {
        if (!itemToDelete?.id) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/other-item-prices/${itemToDelete.id}`);
            toast.success(response?.data?.message || "Item deleted successfully");
            setShowDeletePopup(false);
            setItemToDelete(null);
            getItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            const errMsg = error.response?.data?.message || "Failed to delete item";
            toast.error(errMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header section with counts and CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Tag size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-700">Extra Charges & Items</h3>
                        <p className="text-xs text-slate-400">
                            Manage pricing for miscellaneous services and items (e.g. Airport pickup, extra bed, etc.)
                        </p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Add Extra Charge</span>
                </button>
            </div>

            {/* Filters and Search toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-3 flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-300">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="search"
                        placeholder="Search items by name..."
                        className="outline-none w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-full md:w-64">
                        <Activity size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="outline-none bg-transparent text-sm font-bold text-slate-600 pr-4 cursor-pointer w-full"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List / Table Area */}
            {isLoading ? (
                <div className="py-24 text-center">
                    <div className="flex justify-center items-center">
                        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 font-medium">Loading extra charge details...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                    <p className="text-slate-400 font-semibold text-base mb-2">
                        {items.length === 0 
                            ? 'No Extra Charge items registered yet.' 
                            : 'No items match your search criteria.'
                        }
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {items.length === 0 
                            ? 'Click the "Add Extra Charge" button above to register an item like airport pickup or tour package add-on.'
                            : 'Try adjusting your filters or search keywords.'
                        }
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                                <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Price (USD)</th>
                                <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors duration-200">
                                    <td className="px-6 py-4.5 text-sm font-bold text-slate-400">
                                        #{item.id}
                                    </td>
                                    <td className="px-6 py-4.5 text-sm font-bold text-slate-800">
                                        {item.item_name}
                                    </td>
                                    <td className="px-6 py-4.5 text-sm font-extrabold text-blue-600">
                                        ${parseFloat(item.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <button
                                            onClick={() => toggleItemStatus(item)}
                                            title="Click to toggle status"
                                            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-300 cursor-pointer shadow-sm ${
                                                item.status 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100/50" 
                                                    : "bg-rose-50 text-rose-600 border-rose-200/50 hover:bg-rose-100/50"
                                            }`}
                                        >
                                            {item.status ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4.5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                                                title="Edit details"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => openDeletePopup(item)}
                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer"
                                                title="Delete item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AddEditItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                modalMode={modalMode}
                initialData={currentItem}
                isSaving={isSaving}
            />

            {/* Generic Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeletePopup}
                onClose={closeDeletePopup}
                onConfirm={deleteItem}
                title={
                    <span>
                        Delete extra charge item <span className="text-rose-600">"{itemToDelete?.item_name}"</span>?
                    </span>
                }
                message="This action is permanent and cannot be undone. Bookings using this item may rely on existing values."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default OtherItemPriceView;
