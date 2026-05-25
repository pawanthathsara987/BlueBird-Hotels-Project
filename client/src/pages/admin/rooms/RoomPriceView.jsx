import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, DollarSign, X, Layers, Users, Sparkles } from "lucide-react";

export default function RoomPriceView() {
    const [prices, setPrices] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Metadata for dropdowns
    const [metadata, setMetadata] = useState({
        roomTypes: [],
        occupancyTypes: [],
        boardTypes: []
    });

    // Modals visibility
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Selected items
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [priceToDelete, setPriceToDelete] = useState(null);

    // Form inputs
    const [formInput, setFormInput] = useState({
        roomTypeId: "",
        occupancyTypeId: "",
        boardTypeId: "",
        price: ""
    });

    useEffect(() => {
        fetchPrices();
        fetchMetadata();
        fetchRooms();
    }, []);

    const fetchPrices = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-prices`
            );
            if (response.data && response.data.success) {
                const sortedPrices = (response.data.data || []).sort((a, b) => a.id - b.id);
                setPrices(sortedPrices);
            } else {
                setPrices([]);
            }
        } catch (error) {
            console.error("Error fetching room prices:", error);
            setPrices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-prices/metadata`
            );
            if (response.data && response.data.success) {
                setMetadata(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching pricing metadata:", error);
            toast.error("Failed to load metadata options");
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/rooms`
            );
            if (response.data && response.data.success) {
                setRooms(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching physical rooms:", error);
        }
    };

    // Filter occupancy types that are associated with the selected roomTypeId in the physical inventory
    const getFilteredOccupancyTypes = () => {
        if (!formInput.roomTypeId) return [];

        const roomTypeRooms = rooms.filter(
            (room) => String(room.room_type_id ?? room.roomType?.id ?? "") === String(formInput.roomTypeId)
        );

        const linkedOccupancyIds = new Set(
            roomTypeRooms.map((room) => Number(room.occupancy_type_id ?? room.occupancyType?.id))
        );

        const filtered = metadata.occupancyTypes.filter((ot) => linkedOccupancyIds.has(Number(ot.id)));

        // Fallback: If no rooms are configured for this room type, return all occupancy types
        if (filtered.length === 0) {
            return metadata.occupancyTypes;
        }

        return filtered;
    };

    const handleRoomTypeChange = (e) => {
        const selectedId = e.target.value;
        setFormInput((prev) => {
            const roomTypeRooms = rooms.filter(
                (room) => String(room.room_type_id ?? room.roomType?.id ?? "") === String(selectedId)
            );
            const linkedOccupancyIds = new Set(
                roomTypeRooms.map((room) => Number(room.occupancy_type_id ?? room.occupancyType?.id))
            );

            const isCurrentOccupancyValid = selectedId === "" ||
                linkedOccupancyIds.size === 0 ||
                linkedOccupancyIds.has(Number(prev.occupancyTypeId));

            return {
                ...prev,
                roomTypeId: selectedId,
                occupancyTypeId: isCurrentOccupancyValid ? prev.occupancyTypeId : ""
            };
        });
    };

    // Reset Form Input
    const resetForm = () => {
        setFormInput({
            roomTypeId: "",
            occupancyTypeId: "",
            boardTypeId: "",
            price: ""
        });
        setSelectedPrice(null);
    };

    // Open Modal for Add
    const handleAddClick = () => {
        resetForm();
        setShowFormModal(true);
    };

    // Open Modal for Edit
    const handleEditClick = (priceItem) => {
        setSelectedPrice(priceItem);
        setFormInput({
            roomTypeId: String(priceItem.roomTypeId),
            occupancyTypeId: String(priceItem.occupancyTypeId),
            boardTypeId: String(priceItem.boardTypeId),
            price: String(priceItem.price)
        });
        setShowFormModal(true);
    };

    // Handle Form Submit
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { roomTypeId, occupancyTypeId, boardTypeId, price } = formInput;

        if (!roomTypeId || !occupancyTypeId || !boardTypeId || !price) {
            toast.error("Please fill in all required fields");
            return;
        }

        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            toast.error("Please enter a valid price");
            return;
        }

        try {
            setIsActionLoading(true);
            const payload = {
                roomTypeId: Number(roomTypeId),
                occupancyTypeId: Number(occupancyTypeId),
                boardTypeId: Number(boardTypeId),
                price: priceNum
            };

            let response;
            if (selectedPrice) {
                // Update
                response = await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/room-prices/${selectedPrice.id}`,
                    payload
                );
                toast.success(response.data.message || "Price updated successfully");
            } else {
                // Create
                response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/room-prices`,
                    payload
                );
                toast.success(response.data.message || "Price configured successfully");
            }

            setShowFormModal(false);
            resetForm();
            fetchPrices();
        } catch (error) {
            console.error("Failed to save price:", error);
            const errorMessage = error.response?.data?.message || "Failed to save configuration";
            toast.error(errorMessage);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteClick = (priceItem) => {
        setPriceToDelete(priceItem);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!priceToDelete) return;
        try {
            setIsActionLoading(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-prices/${priceToDelete.id}`
            );
            toast.success(response.data.message || "Pricing combination deleted");
            setShowDeleteModal(false);
            setPriceToDelete(null);
            fetchPrices();
        } catch (error) {
            console.error("Failed to delete room price:", error);
            toast.error(error.response?.data?.message || "Failed to delete configuration");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header / Actions section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div>
                    <h3 className="text-base font-bold text-slate-700">Configured Room Prices</h3>
                    <p className="text-xs text-slate-400">Manage base rates based on room type, occupancy, and meal board options</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Configure Price</span>
                </button>
            </div>

            {/* List Pricing Table */}
            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="flex justify-center items-center">
                        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                </div>
            ) : prices.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                    <p className="text-slate-400 font-medium text-base">No pricing rules configured. Click "Configure Price" to define standard rates.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                    <table className="min-w-full table-auto bg-white">
                        <thead>
                            <tr className="border-b border-slate-150 bg-slate-50 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Room Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Meal Board</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price / Night</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {prices.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                        #{item.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                        <div className="flex items-center gap-3">
                                            {item.roomType?.image_url ? (
                                                <img
                                                    src={item.roomType.image_url}
                                                    alt={item.roomType.type}
                                                    className="w-12 h-10 object-cover rounded-xl border border-slate-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                                    <Layers size={16} />
                                                </div>
                                            )}
                                            <span className="font-semibold text-slate-850">{item.roomType?.type || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100/50">
                                            <Users size={12} />
                                            {item.occupancyType?.type} ({item.occupancyType?.capacity} cap)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100/50">
                                            <Sparkles size={12} />
                                            {item.boardType?.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-black">
                                        $ {Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="p-1.5 text-blue-500 hover:text-blue-750 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                title="Edit price"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="p-1.5 text-rose-500 hover:text-rose-750 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                title="Delete price"
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

            {/* Premium Add / Edit Pricing Modal */}
            {showFormModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-all duration-300"
                        onClick={() => !isActionLoading && setShowFormModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-scaleUp">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white relative">
                                <button
                                    onClick={() => setShowFormModal(false)}
                                    disabled={isActionLoading}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                                    Price Configuration
                                </span>
                                <h2 className="text-xl font-bold text-white mt-3">
                                    {selectedPrice ? "Update Room Price" : "Configure New Rate"}
                                </h2>
                                <p className="text-slate-300 text-xs mt-1">
                                    Create a targeted price configuration based on Room Type, Occupancy capacity and Meal options.
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Room Type</label>
                                    <select
                                        value={formInput.roomTypeId}
                                        onChange={handleRoomTypeChange}
                                        disabled={isActionLoading}
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-700 font-semibold cursor-pointer transition"
                                    >
                                        <option value="">Select Room Type</option>
                                        {metadata.roomTypes.map((rt) => (
                                            <option key={rt.id} value={rt.id}>{rt.type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Occupancy Type</label>
                                    <select
                                        value={formInput.occupancyTypeId}
                                        onChange={(e) => setFormInput({ ...formInput, occupancyTypeId: e.target.value })}
                                        disabled={isActionLoading || !formInput.roomTypeId}
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-700 font-semibold cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {!formInput.roomTypeId 
                                                ? "Select Room Type First" 
                                                : "Select Occupancy Type"
                                            }
                                        </option>
                                        {getFilteredOccupancyTypes().map((ot) => (
                                            <option key={ot.id} value={ot.id}>{ot.type} ({ot.capacity} guests)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Board Type (Meal Package)</label>
                                    <select
                                        value={formInput.boardTypeId}
                                        onChange={(e) => setFormInput({ ...formInput, boardTypeId: e.target.value })}
                                        disabled={isActionLoading}
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-700 font-semibold cursor-pointer transition"
                                    >
                                        <option value="">Select Board Type</option>
                                        {metadata.boardTypes.map((bt) => (
                                            <option key={bt.id} value={bt.id}>{bt.type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nightly Price ($)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                                            $
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formInput.price}
                                            onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
                                            placeholder="Enter rate per night"
                                            disabled={isActionLoading}
                                            required
                                            className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-800 font-semibold transition"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        disabled={isActionLoading}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            selectedPrice ? "Update Price" : "Save Price"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Premium Confirm Delete Popup */}
            {showDeleteModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-all duration-300"
                        onClick={() => !isActionLoading && setShowDeleteModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scaleUp">
                            <p className="text-lg font-bold text-slate-800 mb-2">
                                Delete Pricing Rate
                            </p>
                            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                Are you sure you want to delete this price configuration for <span className="font-bold text-slate-700">"{priceToDelete?.roomType?.type}" ({priceToDelete?.boardType?.type})</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isActionLoading ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
