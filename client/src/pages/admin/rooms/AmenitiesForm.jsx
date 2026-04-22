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

    const goBackToAmenities = () => {
        navigate("/admin/rooms/roomManagement?tab=amenities");
    };

    useEffect(() => {
        if (isEditMode) {
            setName(selectedAmenity?.name || "");
            setAmenityList([]);
        } else {
            setName("");
            setAmenityList([]);
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link
                to="/admin/rooms/roomManagement?tab=amenities"
                className="text-gray-600 hover:text-gray-800 mb-4 inline-block"
            >
                ← Back
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Update Amenity" : "Add Amenities"}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode
                        ? "Update the selected amenity details"
                        : "Add one or more amenities and save them together"}
                </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isEditMode ? "Amenity Update" : "New Amenities"}
                        </h2>
                        <p className="text-gray-300 text-sm">
                            {isEditMode
                                ? "Edit the name, then save changes"
                                : "Use name to queue amenities"}
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && (isEditMode ? updateAmenity() : handleAdd())
                            }
                            placeholder="Amenity name e.g. WiFi"
                            disabled={isLoading}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                        />
                        {!isEditMode && (
                            <button
                                onClick={handleAdd}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                        {isEditMode
                            ? "Update this amenity and save changes"
                            : "Press Enter or click Add to queue amenity"}
                    </p>

                    {!isEditMode && amenityList.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg p-3 mb-5 max-h-48 overflow-y-auto bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 mb-2">
                                Queued ({amenityList.length}) - will save all at once
                            </p>
                            <div className="flex flex-col gap-2">
                                {amenityList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <RiDeleteBinLine
                                            onClick={() => handleRemove(item.id)}
                                            className="text-red-400 hover:text-red-600 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !isEditMode ? (
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-5 text-center text-gray-400 text-sm">
                            No amenities added yet. Use the form above to queue them.
                        </div>
                    ) : null}

                    {isEditMode && (
                        <div className="border border-gray-200 rounded-lg p-4 mb-5 text-sm text-gray-600 bg-gray-50">
                            Editing amenity id: <span className="font-semibold">{selectedAmenity?.id}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/admin/rooms/roomManagement?tab=amenities"
                            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={isEditMode ? updateAmenity : saveAmenities}
                            disabled={isLoading || (!isEditMode && amenityList.length === 0)}
                            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    );
}

export default AmenitiesForm;
