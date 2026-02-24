import { useState } from "react";
import { Plus } from "lucide-react";

function RoomForm({ closeOpenModel }) {

    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType]     = useState("");
    const [adults, setAdults]         = useState(1);
    const [kids, setKids]             = useState(0);
    const [price, setPrice]           = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]); // ✅ track checked amenities

    // 👉 In real app, fetch this from your database /api/amenities
    const amenities = [
        { id: 1, name: "WiFi",          icon: "📶" },
        { id: 2, name: "Air Condition", icon: "❄️" },
        { id: 3, name: "TV",            icon: "📺" },
        { id: 4, name: "Mini Bar",      icon: "🍷" },
        { id: 5, name: "Balcony",       icon: "🌇" },
        { id: 6, name: "Bathtub",       icon: "🛁" },
        { id: 7, name: "Safe Box",      icon: "🔒" },
        { id: 8, name: "Hair Dryer",    icon: "💨" },
    ];

    // ✅ Toggle amenity selection
    const handleAmenityToggle = (id) => {
        setSelectedAmenities((prev) =>
            prev.includes(id)
                ? prev.filter((a) => a !== id)   // uncheck
                : [...prev, id]                   // check
        );
    };

    const handleAddRoom = () => {
        if (!roomNumber || !roomType || !price) {
            return alert("Please fill in all fields.");
        }

        const newRoom = {
            roomNo:     roomNumber,
            type:       roomType,
            adults,
            kids,
            price:      Number(price),
            status:     "available",
            amenities:  selectedAmenities, // ✅ array of amenity IDs → insert into room_amenities
        };

        console.log("Saving room with amenities:", newRoom);
        // 👉 Replace with your API call:
        // await fetch('/api/rooms', {
        //     method: 'POST',
        //     body: JSON.stringify(newRoom)
        // })
        // Then for each amenity:
        // INSERT INTO room_amenities (room_id, amenity_id) VALUES (...)

        // Reset
        setRoomNumber("");
        setRoomType("");
        setAdults(1);
        setKids(0);
        setPrice("");
        setSelectedAmenities([]);
        closeOpenModel();
    };

    return (
        <>
            {/* Dark Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={closeOpenModel}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">

                    {/* Close Button */}
                    <button
                        onClick={closeOpenModel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                    >
                        ✕
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center mb-6">Add New Room</h2>

                    {/* Room Number */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Room Number</label>
                        <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="Enter room number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 
                                text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Room Type */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Room Type</label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 
                                text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >
                            <option value="">Select room type</option>
                            <option value="deluxe-double">Deluxe Double</option>
                            <option value="deluxe-balcony">Deluxe Double with Balcony</option>
                            <option value="family">Family</option>
                        </select>
                    </div>

                    {/* Adults & Kids */}
                    <div className="flex gap-4 mb-5">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Adults</label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                >−</button>
                                <span className="flex-1 text-center text-sm py-3">{adults}</span>
                                <button
                                    onClick={() => setAdults(adults + 1)}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                >+</button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Kids</label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setKids(Math.max(0, kids - 1))}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                >−</button>
                                <span className="flex-1 text-center text-sm py-3">{kids}</span>
                                <button
                                    onClick={() => setKids(kids + 1)}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Price per Night */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Price per Night ($)</label>
                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-400">
                            <span className="text-gray-400 mr-2 text-sm font-medium">$</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Enter price per night"
                                className="w-full text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* ✅ Amenities Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-3">
                            Amenities
                            <span className="ml-2 text-xs text-blue-500 font-normal">
                                ({selectedAmenities.length} selected)
                            </span>
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {amenities.map((amenity) => {
                                const isChecked = selectedAmenities.includes(amenity.id);
                                return (
                                    <div
                                        key={amenity.id}
                                        onClick={() => handleAmenityToggle(amenity.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
                                            ${isChecked
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        {/* ✅ Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleAmenityToggle(amenity.id)}
                                            className="accent-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-lg">{amenity.icon}</span>
                                        <span className="text-sm font-medium">{amenity.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={closeOpenModel}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg 
                                text-sm font-semibold hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddRoom}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg 
                                text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Add Room
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default RoomForm;
