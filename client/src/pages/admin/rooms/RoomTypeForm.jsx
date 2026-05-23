import { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

function RoomTypeForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoomType = location.state?.selectedPackage || null;

    const [typeName, setTypeName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(selectedRoomType?.id);

    const goBackToPackages = () => {
        navigate("/admin/rooms/roomManagement?tab=packages");
    };

    // Preload fields when editing
    useEffect(() => {
        if (isEditMode) {
            setTypeName(selectedRoomType.type || "");
        } else {
            setTypeName("");
        }
    }, [isEditMode, selectedRoomType]);

    const saveRoomType = async () => {
        let saved = false;
        try {
            if (!typeName || !typeName.trim()) {
                toast.error("Please enter a room type");
                return;
            }

            setIsLoading(true);

            const payload = { type: typeName.trim() };

            const endpoint = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/admin/room-type/${selectedRoomType.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/admin/room-type`;

            const response = isEditMode
                ? await axios.put(endpoint, payload)
                : await axios.post(endpoint, payload);

            saved = true;
            toast.success(response?.data?.message || (isEditMode ? "Room type updated" : "Room type added"));

            setTypeName("");

        } catch (error) {
            toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update room type" : "Failed to add room type"));
        } finally {
            setIsLoading(false);
            if (saved) goBackToPackages();
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link
                    to="/admin/rooms/roomManagement?tab=packages"
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors inline-block"
                >
                    ← Back to Room Management
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                            Category Settings
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-3">
                            {isEditMode ? "Update Room Type" : "New Room Type"}
                        </h2>
                        <p className="text-slate-300 text-xs mt-1">
                            {isEditMode
                                ? "Modify the properties and details of this category"
                                : "Define a new category and configuration for hotel rooms"}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Room Type Name</label>
                            <input
                                type="text"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                placeholder="Enter room type name (e.g. Deluxe, Standard, Suite)"
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                            />
                            <p className="text-[11px] text-slate-400">Please provide a unique, descriptive name for the room category.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link
                                to="/admin/rooms/roomManagement?tab=packages"
                                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm rounded-xl transition duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={saveRoomType}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        {isEditMode ? "Updating..." : "Adding..."}
                                    </>
                                ) : (
                                    isEditMode ? "Update Room Type" : "Add Room Type"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomTypeForm;