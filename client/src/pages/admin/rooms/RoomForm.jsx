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
    const [roomTypes, setRoomTypes] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (!roomType) {
            if (!isEditMode) {
                setSelectedAmenities([]);
            }
            return;
        }

        const selectedPackage = packages.find((pkg) => String(pkg.id) === String(roomType));
        const selectedTypeName = selectedPackage?.pname?.trim().toLowerCase();

        if (!selectedTypeName) {
            return;
        }

        const matchedRoomType = roomTypes.find((type) => String(type.type || "").trim().toLowerCase() === selectedTypeName);

        if (matchedRoomType?.Amenities) {
            setSelectedAmenities(matchedRoomType.Amenities.map((amenity) => amenity.id));
        } else if (matchedRoomType) {
            setSelectedAmenities([]);
        }
    }, [roomType, packages, roomTypes, isEditMode]);

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
            setIsLoading(true);

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
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        async function fetchPackagesAndTypes() {
            try {
                const [packagesRes, roomTypesRes] = await Promise.all([
                    axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/packages"),
                    axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/room-types"),
                ]);

                const roomTypeList = roomTypesRes.data?.data || [];
                setRoomTypes(roomTypeList);

                const packageList = packagesRes.data?.data || [];

                if (packageList.length > 0) {
                    setPackages(packageList);
                } else {
                    setPackages(
                        roomTypeList.map((roomType) => ({
                            id: roomType.id,
                            pname: roomType.type,
                            discount: 0,
                        }))
                    );
                }

                console.log("API response:", {
                    packages: packagesRes.data,
                    roomTypes: roomTypesRes.data,
                });

            } catch (error) {
                console.error("Error fetching packages:", error);
            }
        }

        fetchPackagesAndTypes();

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
        <div className="p-6 bg-slate-50/50 min-h-screen animate-fadeIn">
            <div className="max-w-3xl mx-auto space-y-6">
                <Link
                    to="/admin/rooms/roomManagement?tab=room"
                    onClick={(e) => {
                        if (isLoading) {
                            e.preventDefault();
                        }
                    }}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors inline-block"
                >
                    ← Back to Room Management
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                            Inventory Settings
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-3">
                            {isEditMode ? "Room Update" : "New Room"}
                        </h2>
                        <p className="text-slate-300 text-xs mt-1">
                            {isEditMode
                                ? "Update the specifications and guest amenities for this room"
                                : "Add a physical room number, choose its category type, and assign standard amenities"}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Room Number Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Room Number</label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder="Enter room number (e.g. 101, 204)"
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                            />
                        </div>

                        {/* Room Type Dropdown */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Room Type</label>
                            <select
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                            >
                                <option value="">Select Room Type</option>
                                {packages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.pname} {Number(pkg.discount || 0) > 0 ? `(${pkg.discount}% OFF)` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Dropdown */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                            >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        {/* Amenities Checkboxes */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-bold text-slate-700">
                                    Amenities
                                    <span className="ml-2 text-xs text-blue-600 font-normal bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        {selectedAmenities.length} selected
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    disabled={isLoading || amenities.length === 0}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {selectedAmenities.length === amenities.length ? "Unselect All" : "Select All"}
                                </button>
                            </div>

                            {amenities.length === 0 ? (
                                <p className="text-sm text-slate-400 italic py-2">No amenities created yet. Configure them under the Amenities tab.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-3.5">
                                    {amenities.map((amenity) => {
                                        const isChecked = selectedAmenities.includes(amenity.id);
                                        return (
                                            <div
                                                key={amenity.id}
                                                onClick={() => !isLoading && handleAmenityToggle(amenity.id)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                                                    isChecked
                                                        ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm"
                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 bg-slate-50/50"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleAmenityToggle(amenity.id)}
                                                    disabled={isLoading}
                                                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span className="text-base leading-none">{amenity.icon}</span>
                                                <span className="text-sm font-semibold">{amenity.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Form Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link
                                to="/admin/rooms/roomManagement?tab=room"
                                onClick={(e) => {
                                    if (isLoading) {
                                        e.preventDefault();
                                    }
                                }}
                                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm rounded-xl transition duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSaveRoom}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Saving...
                                    </>
                                ) : (
                                    isEditMode ? "Update Room" : "Add Room"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomForm;
