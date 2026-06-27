import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

function RoomForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoom = location.state?.selectedRoom || null;

    const [roomNumber, setRoomNumber] = useState("");
    const [floor, setFloor] = useState("");
    const [occupancyTypeId, setOccupancyTypeId] = useState("");
    const [roomTypeId, setRoomTypeId] = useState("");
    const [status, setStatus] = useState("available");
    const [kidsAllow, setKidsAllow] = useState(false);
    const [kids, setKids] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const [occupancyTypes, setOccupancyTypes] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = Boolean(selectedRoom?.id || selectedRoom?.roomNo || selectedRoom?.roomNumber || selectedRoom?.room_number);

    const goBackToRooms = () => {
        navigate("/admin/rooms/roomManagement?tab=room");
    };

    useEffect(() => {
        if (isEditMode) {
            setRoomNumber(String(selectedRoom.room_number ?? selectedRoom.roomNumber ?? selectedRoom.roomNo ?? ""));
            setFloor(selectedRoom.floor === null || selectedRoom.floor === undefined ? "" : String(selectedRoom.floor));
            setOccupancyTypeId(String(selectedRoom.occupancy_type_id ?? selectedRoom.occupancyTypeId ?? selectedRoom.occupancyType?.id ?? ""));
            setRoomTypeId(String(selectedRoom.room_type_id ?? selectedRoom.roomTypeId ?? selectedRoom.RoomType?.id ?? ""));
            setStatus((selectedRoom.status || selectedRoom.roomStatus || "available").toString().trim().toLowerCase());
            setKidsAllow(Boolean(selectedRoom.kids_allow ?? selectedRoom.kidsAllow ?? false));
            setKids(selectedRoom.kids === null || selectedRoom.kids === undefined ? "" : String(selectedRoom.kids));
        } else {
            setRoomNumber("");
            setFloor("");
            setOccupancyTypeId("");
            setRoomTypeId("");
            setStatus("available");
            setKidsAllow(false);
            setKids("");
            setSelectedAmenities([]);
        }
    }, [isEditMode, selectedRoom]);

    const selectedRoomType = roomTypes.find((roomType) => String(roomType.id) === String(roomTypeId));
    const availableAmenities = selectedRoomType?.Amenities || [];
    const enteredRoomNumber = Number(roomNumber);
    const isDuplicateRoomNumber = Boolean(
        roomNumber !== "" &&
        rooms.some((room) => {
            const existingRoomNumber = Number(room.room_number ?? room.roomNumber);
            const sameNumber = existingRoomNumber === enteredRoomNumber;
            const sameRoom = selectedRoom?.id && String(room.id) === String(selectedRoom.id);

            return sameNumber && !sameRoom;
        })
    );

    const selectedOccupancy = occupancyTypes.find((type) => String(type.id) === String(occupancyTypeId));
    const occupancyCapacity = selectedOccupancy ? Number(selectedOccupancy.capacity || 0) : 0;
    const kidsCountNum = kids !== "" ? Number(kids) : 0;
    const isKidsCountInvalid = Boolean(
        kidsAllow &&
        occupancyCapacity > 0 &&
        (kids === "" || Number.isNaN(kidsCountNum) || kidsCountNum < 1 || kidsCountNum + 1 > occupancyCapacity)
    );

    useEffect(() => {
        if (occupancyCapacity === 1) {
            setKidsAllow(false);
            setKids("");
        }
    }, [occupancyCapacity]);

    useEffect(() => {
        if (!roomTypeId) {
            setSelectedAmenities([]);
            return;
        }

        const roomTypeAmenityIds = (selectedRoomType?.Amenities || []).map((amenity) => Number(amenity.id));
        const existingAmenities = selectedRoom?.RoomAmenities?.map((roomAmenity) => Number(roomAmenity.amenityId ?? roomAmenity.Amenity?.id ?? roomAmenity.amenity?.id))
            || selectedRoom?.roomAmenities?.map((roomAmenity) => Number(roomAmenity.amenityId ?? roomAmenity.Amenity?.id ?? roomAmenity.amenity?.id))
            || [];

        if (isEditMode) {
            if (existingAmenities.length > 0) {
                setSelectedAmenities(existingAmenities.filter((amenityId) => roomTypeAmenityIds.includes(amenityId)));
            } else {
                setSelectedAmenities(roomTypeAmenityIds);
            }
            return;
        }

        setSelectedAmenities((prev) => prev.filter((amenityId) => roomTypeAmenityIds.includes(Number(amenityId))));
    }, [roomTypeId, selectedRoomType, isEditMode, selectedRoom]);

    async function handleSaveRoom() {
        if (!roomNumber || !occupancyTypeId) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (isDuplicateRoomNumber) {
            toast.error("This room number already exists");
            return;
        }

        if (kidsAllow) {
            if (kids === "" || kids === undefined) {
                toast.error("Please enter the allowed kids count");
                return;
            }
            const kidsCount = Number(kids);
            if (Number.isNaN(kidsCount) || kidsCount < 1) {
                toast.error("Please enter a valid kids count (at least 1)");
                return;
            }

            const selectedOccupancy = occupancyTypes.find((type) => String(type.id) === String(occupancyTypeId));
            if (selectedOccupancy) {
                const capacity = Number(selectedOccupancy.capacity || 0);
                if (kidsCount + 1 > capacity) {
                    toast.error(`Kids count must be lower than occupancy capacity. Since at least 1 adult is required, the maximum allowed kids count for this occupancy (${capacity} guests) is ${capacity - 1}.`);
                    return;
                }
            }
        }

        try {
            setIsLoading(true);

            const payload = {
                room_number: Number(roomNumber),
                floor: floor === "" ? null : Number(floor),
                occupancy_type_id: Number(occupancyTypeId),
                room_type_id: roomTypeId === "" ? null : Number(roomTypeId),
                status,
                kids_allow: kidsAllow,
                kids: kidsAllow && kids !== "" ? Number(kids) : null,
                amenities: selectedAmenities,
            };

            if (isEditMode) {
                if (!selectedRoom?.id) {
                    toast.error("Unable to update room: missing room id");
                    return;
                }

                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/rooms/${selectedRoom.id}`, payload);
                toast.success("Room updated successfully");
                goBackToRooms();
                return;
            }

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/rooms`, payload);
            toast.success("Room saved successfully");
            goBackToRooms();
        } catch (error) {
            console.error("Failed to save room:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Failed to save room");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        async function fetchRoomMetadata() {
            try {
                const [occupancyTypesRes, roomTypesRes, roomsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/occupancy-types`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-types`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/rooms`),
                ]);

                setOccupancyTypes(occupancyTypesRes.data?.data || []);
                setRoomTypes(roomTypesRes.data?.data || []);
                setRooms(roomsRes.data?.data || []);
            } catch (error) {
                console.error("Error fetching room metadata:", error);
                toast.error(error?.response?.data?.message || "Failed to load room metadata");
            }
        }

        fetchRoomMetadata();
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
                    <div className="bg-linear-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                            Inventory Settings
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-3">
                            {isEditMode ? "Room Update" : "New Room"}
                        </h2>
                        <p className="text-slate-300 text-xs mt-1">
                            {isEditMode
                                ? "Update the room number, occupancy type, room type, and guest limits"
                                : "Add a physical room number, choose its occupancy type, and assign room settings"}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Room Number</label>
                            <input
                                type="number"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder="Enter room number (e.g. 101, 204)"
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                            />
                            {isDuplicateRoomNumber && (
                                <p className="text-xs font-semibold text-rose-600">
                                    This room number is already in use. Choose another number.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Floor</label>
                            <input
                                type="number"
                                min="0"
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                placeholder="Enter floor number"
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Occupancy Type</label>
                            <select
                                value={occupancyTypeId}
                                onChange={(e) => setOccupancyTypeId(e.target.value)}
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                            >
                                <option value="">Select Occupancy Type</option>
                                {occupancyTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.type} {type.capacity ? `(${type.capacity} guests)` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Room Type</label>
                            <select
                                value={roomTypeId}
                                onChange={(e) => setRoomTypeId(e.target.value)}
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                            >
                                <option value="">Select Room Type</option>
                                {roomTypes.map((roomType) => (
                                    <option key={roomType.id} value={roomType.id}>
                                        {roomType.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between gap-4">
                                <label className="block text-sm font-bold text-slate-700">
                                    Amenities for Selected Room Type
                                    <span className="ml-2 text-xs text-blue-600 font-normal bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        {selectedAmenities.length} selected
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedAmenities.length === availableAmenities.length) {
                                            setSelectedAmenities([]);
                                        } else {
                                            setSelectedAmenities(availableAmenities.map((amenity) => amenity.id));
                                        }
                                    }}
                                    disabled={isLoading || availableAmenities.length === 0}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {selectedAmenities.length === availableAmenities.length ? "Unselect All" : "Select All"}
                                </button>
                            </div>

                            {roomTypeId ? (
                                availableAmenities.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-2">
                                        No amenities are assigned to this room type yet.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {availableAmenities.map((amenity) => {
                                            const amenityId = Number(amenity.id);
                                            const isChecked = selectedAmenities.includes(amenityId);

                                            return (
                                                <label
                                                    key={amenity.id}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                                                        isChecked
                                                            ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm"
                                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 bg-slate-50/50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setSelectedAmenities((prev) =>
                                                                prev.includes(amenityId)
                                                                    ? prev.filter((id) => id !== amenityId)
                                                                    : [...prev, amenityId]
                                                            );
                                                        }}
                                                        disabled={isLoading}
                                                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                                    />
                                                    <span className="text-sm font-semibold">{amenity.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <p className="text-sm text-slate-400 italic py-2">
                                    Select a room type to see the amenities that can be assigned to this room.
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <label className="block text-sm font-bold text-slate-700">Allow Kids</label>
                                    {occupancyCapacity === 1 && (
                                        <p className="text-[10px] text-slate-400 font-semibold animate-fadeIn">
                                            Not available for Single occupancy rooms
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (occupancyCapacity === 1) return;
                                        setKidsAllow((prev) => {
                                            const next = !prev;
                                            if (!next) {
                                                setKids("");
                                            } else {
                                                setKids("1"); // Default count is 1
                                            }
                                            return next;
                                        });
                                    }}
                                    disabled={isLoading || occupancyCapacity === 1}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${kidsAllow ? "bg-blue-600" : "bg-slate-300"} ${
                                        occupancyCapacity === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${kidsAllow ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Kids Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={kids}
                                    onChange={(e) => setKids(e.target.value)}
                                    placeholder="Enter allowed kids count"
                                    disabled={isLoading || !kidsAllow || occupancyCapacity === 1}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50 ${
                                        isKidsCountInvalid
                                            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700"
                                            : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                                    }`}
                                />
                                {isKidsCountInvalid && occupancyCapacity > 0 && (
                                    <p className="text-xs font-semibold text-rose-600 animate-fadeIn">
                                        {kidsCountNum < 1 
                                            ? "Kids count must be at least 1 if kids are allowed." 
                                            : `Kids count must be lower than occupancy capacity. Since at least 1 adult is required, max kids count for this occupancy (${occupancyCapacity} guests) is ${occupancyCapacity - 1}.`
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

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
                                disabled={isLoading || isDuplicateRoomNumber || isKidsCountInvalid}
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
