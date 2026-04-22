import axios from "axios";
import { Import } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

function RoomForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoom = location.state?.selectedRoom || null;

    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType] = useState("");
    const [status, setStatus] = useState("available");
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const [packages, setPackages] = useState([]);
    const [amenities, setAmenities] = useState([]);

    const isEditMode = Boolean(selectedRoom?.id || selectedRoom?.roomNo || selectedRoom?.roomNumber);

    const goBackToRooms = () => {
        navigate("/admin/rooms/roomManagement?tab=room");
    };

    useEffect(() => {
        if (isEditMode) {
            setRoomNumber(String(selectedRoom.roomNo || selectedRoom.roomNumber || ""));
            setRoomType(String(selectedRoom.packageId || selectedRoom.RoomPackage?.id || selectedRoom.type || ""));
            const normalizedStatus = (selectedRoom.roomStatus || "available")
                .toString()
                .trim()
                .toLowerCase();

            setStatus(normalizedStatus);

            if (selectedRoom.RoomAmenities) {
                const amenityIds = selectedRoom.RoomAmenities.map(
                    (ra) => ra.amenityId
                );
                setSelectedAmenities(amenityIds);
            } else {
                setSelectedAmenities([]);
            }
        } else {
            setRoomNumber("");
            setRoomType("");
            setStatus("available");
            setSelectedAmenities([]);
        }
    }, [isEditMode, selectedRoom]);

    const isAllSelected = amenities.length > 0 && selectedAmenities.length === amenities.length;
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedAmenities([]);
        } else {
            const allIds = amenities.map(a => a.id);
            setSelectedAmenities(allIds);
        }
    };

    const handleAmenityToggle = (id) => {
        setSelectedAmenities((prev) =>
            prev.includes(id)
                ? prev.filter((a) => a !== id)
                : [...prev, id]
        );
    };

    async function handleSaveRoom() {
        if (!roomNumber || !roomType) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {

            if (isEditMode) {
                if (!selectedRoom?.id) {
                    toast.error("Unable to update room: missing room id");
                    return;
                }

                console.log("SENDING DATA:", {
                    roomNo: roomNumber,
                    packageId: roomType,
                    status: status,
                    amenities: selectedAmenities,
                });

                const res = await axios.put(import.meta.env.VITE_BACKEND_URL + `/admin/rooms/${selectedRoom.id}`, {
                    roomNo: roomNumber,
                    packageId: roomType,
                    status: status,
                    amenities: selectedAmenities,
                });
                console.log("API response:", res.data);
                toast.success("Room updated successfully");
                goBackToRooms();
                return;
            } else {
                const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/admin/rooms", {
                    roomNo: roomNumber,
                    packageId: roomType,
                    status: status,
                    amenities: selectedAmenities,
                });
                console.log("API response:", res.data);
                toast.success("Room saved successfully");
            }

            goBackToRooms();
        } catch (error) {
            console.error("Failed to save room:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Failed to save room");
        }
    }

    useEffect(() => {
        async function fetchPackages() {
            try {
                const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/packages");
                setPackages(res.data.data);
                console.log("API response:", res.data);

            } catch (error) {
                console.error("Error fetching packages:", error);
            }
        }

        fetchPackages();

    }, []);

    useEffect(() => {
        async function fetchAmenities() {
            try {
                const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/amenities");
                setAmenities(res.data.data);
                console.log("API response:", res.data);
            } catch (error) {
                console.error("Error fetching amenities:", error);
            }
        }

        fetchAmenities();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link
                to="/admin/rooms/roomManagement?tab=room"
                className="text-gray-600 hover:text-gray-800 mb-4 inline-block"
            >
                ← Back
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Update Room" : "Add Room"}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode
                        ? "Update room details and save changes"
                        : "Fill in room information and assign amenities"}
                </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isEditMode ? "Room Update" : "New Room"}
                        </h2>
                        <p className="text-gray-300 text-sm">Select room attributes and amenities</p>
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Room Number</label>
                        <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="Enter room number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Room Type</label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >

                            <option value="">Select Room Type</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>{pkg.pname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold">
                                Amenities
                                <span className="ml-2 text-xs text-blue-500 font-normal">
                                    ({selectedAmenities.length} selected)
                                </span>
                            </label>

                            {/* Select All / Unselect All Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedAmenities.length === amenities.length) {
                                        setSelectedAmenities([]);
                                    } else {
                                        setSelectedAmenities(amenities.map(a => a.id));
                                    }
                                }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {selectedAmenities.length === amenities.length ? "Unselect All" : "Select All"}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {amenities.map((amenity) => {
                                const isChecked = selectedAmenities.includes(amenity.id);
                                return (
                                    <div
                                        key={amenity.id}
                                        onClick={() => handleAmenityToggle(amenity.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${isChecked
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
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

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/admin/rooms/roomManagement?tab=room"
                            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSaveRoom}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            {isEditMode ? "Update Room" : "Add Room"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomForm;
