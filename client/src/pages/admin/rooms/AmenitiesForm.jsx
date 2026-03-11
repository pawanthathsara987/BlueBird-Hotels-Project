import { useEffect, useState } from "react";
import axios from "axios";
import { RiDeleteBinLine } from "react-icons/ri";
import { Plus } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

function AmenitiesForm({ closeOpenModal, onAmenitiesAdded, selectedAmenity }) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [amenityList, setAmenityList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(selectedAmenity?.id);

    useEffect(() => {
        if (isEditMode) {
            setName(selectedAmenity?.name || "");
            setIcon(selectedAmenity?.icon || "");
            setAmenityList([]);
        } else {
            setName("");
            setIcon("");
            setAmenityList([]);
        }
    }, [isEditMode, selectedAmenity]);

    const handleAdd = () => {
        const trimmedName = name.trim();
        const trimmedIcon = icon.trim();

        if (!trimmedName || !trimmedIcon) {
            toast.error("Please enter both icon and amenity name");
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
            { id: Date.now(), name: trimmedName, icon: trimmedIcon },
        ]);
        setName("");
        setIcon("");
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
                        icon: amenity.icon,
                    }
                );
            }

            toast.success("Amenities added successfully");
            setAmenityList([]);
            onAmenitiesAdded?.();
            closeOpenModal?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add amenities");
        } finally {
            setIsLoading(false);
        }
    };

    const updateAmenity = async () => {
        const trimmedName = name.trim();
        const trimmedIcon = icon.trim();

        if (!trimmedName || !trimmedIcon) {
            toast.error("Please enter both icon and amenity name");
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
                    icon: trimmedIcon,
                }
            );

            toast.success(response?.data?.message || "Amenity updated successfully");
            onAmenitiesAdded?.();
            closeOpenModal?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update amenity");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
                onClick={isLoading ? undefined : closeOpenModal}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border">
                    <button
                        onClick={closeOpenModal}
                        disabled={isLoading}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold disabled:opacity-50"
                    >
                        <IoMdClose />
                    </button>

                    <h2 className="text-2xl font-bold text-center mb-6">
                        {isEditMode ? "Update Amenity" : "Add Amenities"}
                    </h2>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="Icon"
                            disabled={isLoading}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center disabled:bg-gray-100"
                        />
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
                                            <span className="text-lg">{item.icon}</span>
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

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={closeOpenModal}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={isEditMode ? updateAmenity : saveAmenities}
                            disabled={isLoading || (!isEditMode && amenityList.length === 0)}
                            className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white transition bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </>
    );
}

export default AmenitiesForm;