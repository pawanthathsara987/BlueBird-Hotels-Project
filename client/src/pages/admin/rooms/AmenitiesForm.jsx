import { useEffect, useState } from "react";
import axios from "axios";
import { RiDeleteBinLine } from "react-icons/ri";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AmenitiesForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedAmenity = location.state?.selectedAmenity || null;

    const [name, setName] = useState("");
    const [amenityList, setAmenityList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(selectedAmenity?.id);

    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);

    const goBackToAmenities = () => {
        navigate("/admin/rooms/roomManagement?tab=amenities");
    };

    // Fetch all Room Types on mount
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                setIsLoadingRoomTypes(true);
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-types`);
                setRoomTypes(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch room types:", error);
                toast.error("Failed to load room types");
            } finally {
                setIsLoadingRoomTypes(false);
            }
        };
        fetchRoomTypes();
    }, []);

    // Set fields and extract pre-existing associations in edit mode
    useEffect(() => {
        if (isEditMode && selectedAmenity) {
            setName(selectedAmenity?.name || "");
            setAmenityList([]);
            const assignedTypeIds = selectedAmenity?.RoomTypes?.map(rt => rt.id) || [];
            setSelectedRoomTypes(assignedTypeIds);
        } else {
            setName("");
            setAmenityList([]);
            setSelectedRoomTypes([]);
        }
    }, [isEditMode, selectedAmenity]);

    const handleAdd = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            toast.error("Please enter amenity name");
            return;
        }

        const duplicate = amenityList.some(
            (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (duplicate) {
            toast.error("This amenity is already in the list");
            return;
        }

        setAmenityList((prev) => [
            ...prev,
            { id: Date.now(), name: trimmedName },
        ]);
        setName("");
    };

    const handleRemove = (id) => {
        setAmenityList((prev) => prev.filter((item) => item.id !== id));
    };

    const saveAmenities = async () => {
        if (amenityList.length === 0) {
            toast.error("Add at least one amenity");
            return;
        }

        try {
            setIsLoading(true);

            for (const amenity of amenityList) {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/amenitie`,
                    {
                        name: amenity.name,
                        roomTypeIds: selectedRoomTypes,
                    }
                );
            }

            toast.success("Amenities added successfully");
            setAmenityList([]);
            goBackToAmenities();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add amenities");
        } finally {
            setIsLoading(false);
        }
    };

    const updateAmenity = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            toast.error("Please enter amenity name");
            return;
        }

        if (!selectedAmenity?.id) {
            toast.error("Invalid amenity id");
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/admin/amenitie/${selectedAmenity.id}`,
                {
                    name: trimmedName,
                    roomTypeIds: selectedRoomTypes,
                }
            );

            toast.success(response?.data?.message || "Amenity updated successfully");
            goBackToAmenities();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update amenity");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-3xl mx-auto space-y-6">
                <Link
                    to="/admin/rooms/roomManagement?tab=amenities"
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors inline-block"
                >
                    ← Back to Room Management
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                            Service Options
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-3">
                            {isEditMode ? "Update Amenity" : "Add Amenities"}
                        </h2>
                        <p className="text-slate-300 text-xs mt-1">
                            {isEditMode
                                ? "Edit the name and room type assignments of this amenity"
                                : "Create one or multiple amenities, assign them to room types, and save them together"}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Amenity Name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && (isEditMode ? updateAmenity() : handleAdd())
                                    }
                                    placeholder="Amenity name e.g. WiFi, Sea View, Mini Bar"
                                    disabled={isLoading}
                                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                                />
                                {!isEditMode && (
                                    <button
                                        onClick={handleAdd}
                                        disabled={isLoading}
                                        className="flex items-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {isEditMode
                                    ? "Update this amenity and save changes"
                                    : "Press Enter or click Add to queue this amenity"}
                            </p>
                        </div>

                        {!isEditMode && amenityList.length > 0 ? (
                            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 max-h-48 overflow-y-auto">
                                <p className="text-xs font-bold text-slate-500 mb-2">
                                    Queued ({amenityList.length}) - will save all at once
                                </p>
                                <div className="flex flex-col gap-2">
                                    {amenityList.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm"
                                        >
                                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                            <RiDeleteBinLine
                                                onClick={() => handleRemove(item.id)}
                                                className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                                                size={18}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : !isEditMode ? (
                            <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm bg-slate-50/20">
                                No amenities added yet. Use the input field above to add them to the queue.
                            </div>
                        ) : null}

                        {isEditMode && (
                            <div className="border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-500 bg-slate-50/40">
                                Editing amenity ID: <span className="text-slate-700 font-extrabold">{selectedAmenity?.id}</span>
                            </div>
                        )}

                        {/* Room Types selection section */}
                        <div className="mb-6 border-t border-slate-100 pt-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-slate-700">
                                    Assign to Room Types
                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                        ({selectedRoomTypes.length} selected)
                                    </span>
                                </label>
                                {roomTypes.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedRoomTypes.length === roomTypes.length) {
                                                setSelectedRoomTypes([]);
                                            } else {
                                                setSelectedRoomTypes(roomTypes.map(rt => rt.id));
                                            }
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                                    >
                                        {selectedRoomTypes.length === roomTypes.length ? "Deselect All" : "Select All"}
                                    </button>
                                )}
                            </div>

                            {isLoadingRoomTypes ? (
                                <div className="text-sm text-slate-400 py-2">Loading room types...</div>
                            ) : roomTypes.length === 0 ? (
                                <div className="text-sm text-slate-400 italic py-2">
                                    No room types available. Add room types first under the Room Type tab.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {roomTypes.map((rt) => {
                                        const isChecked = selectedRoomTypes.includes(rt.id);
                                        return (
                                            <label
                                                key={rt.id}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                                                    isChecked
                                                        ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm"
                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        setSelectedRoomTypes(prev =>
                                                            prev.includes(rt.id)
                                                                ? prev.filter(id => id !== rt.id)
                                                                : [...prev, rt.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span className="text-sm font-semibold">{rt.type}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link
                                to="/admin/rooms/roomManagement?tab=amenities"
                                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm rounded-xl transition duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={isEditMode ? updateAmenity : saveAmenities}
                                disabled={isLoading || (!isEditMode && amenityList.length === 0)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        {isEditMode ? "Updating..." : "Saving..."}
                                    </>
                                ) : (
                                    isEditMode ? "Update Amenity" : `Save All (${amenityList.length})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AmenitiesForm;
