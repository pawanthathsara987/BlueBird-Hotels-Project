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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link
                to="/admin/rooms/roomManagement?tab=packages"
                className="text-gray-600 hover:text-gray-800 mb-4 inline-block"
            >
                ← Back
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Update Room Type" : "Add Room Type"}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode
                        ? "Update room type and save changes"
                        : "Create a new room type"}
                </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isEditMode ? "Update Room Type" : "New Room Type"}
                        </h2>
                        <p className="text-gray-300 text-sm">
                            {isEditMode
                                ? "Update the room type and save changes"
                                : "Create a new room type for rooms to use"}
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Room Type</label>
                        <input
                            type="text"
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            placeholder="Enter room type (e.g. Deluxe, Standard)"
                            disabled={isLoading}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Only one field required for RoomType: `type` */}

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/admin/rooms/roomManagement?tab=packages"
                            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={saveRoomType}
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    );
}

export default RoomTypeForm;