import { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { Plus } from "lucide-react";
import { IoMdClose } from "react-icons/io";

function AmenitiesForm({ closeOpenModal }) {

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [amenityList, setAmenityList] = useState([]);

    // Add to local list (not database yet)
    const handleAdd = () => {
        if (!name.trim()) return alert("Please enter amenity name");

        setAmenityList((prev) => [
            ...prev,
            { id: Date.now(), name, icon }
        ]);

        // Reset fields for next entry
        setName("");
        setIcon("");
    };

    // Remove from local list
    const handleRemove = (id) => {
        setAmenityList((prev) => prev.filter((item) => item.id !== id));
    };

    // Save ALL to database at once
    const handleSaveAll = () => {
        if (amenityList.length === 0) return alert("Please add at least one amenity");
        
        setAmenityList([]);
        closeOpenModal();
    };

    return (
        <>
            {/* Dark Overlay */}
            <div
                className="fixed inset-0 bg-transparent bg-opacity-40 z-40"
                onClick={closeOpenModal}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border">

                    {/* Close Button */}
                    <button
                        onClick={closeOpenModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                    >
                        <IoMdClose />
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center mb-6">Add Amenities</h2>

                    {/* Input Row */}
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="Icon 📶"
                            className="w-17.5 border border-gray-300 rounded-lg px-3 py-3 
                                text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                        />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder="Amenity name e.g. WiFi"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 
                                text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {/* Add to list button */}
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 
                                text-white rounded-lg text-sm font-semibold transition"
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Press Enter or click Add to queue amenity</p>

                    {/* Added Amenities Preview Panel */}
                    {amenityList.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3 mb-5 max-h-48 overflow-y-auto bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 mb-2">
                                Queued ({amenityList.length}) — will save all at once
                            </p>
                            <div className="flex flex-col gap-2">
                                {amenityList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{item.icon || null}</span>
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
                    )}

                    {/* Empty state */}
                    {amenityList.length === 0 && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-5 text-center text-gray-400 text-sm">
                            No amenities added yet. Use the form above to queue them.
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={closeOpenModal}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg 
                                text-sm font-semibold hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        {/* ✅ Save ALL to database */}
                        <button
                            onClick={handleSaveAll}
                            disabled={amenityList.length === 0}
                            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition
                                ${amenityList.length > 0
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Save All ({amenityList.length})
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default AmenitiesForm;