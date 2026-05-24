import axios from "axios";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import DeleteRoomModal from "../../../components/DeleteRoomModal";
import Loader from "../../../components/Loader";

const RoomView = () => {

    const [rooms, setRooms] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Helper functions to handle different room data structures
    const getRoomId = (room) => room?.id || room?.roomId;

    // Function to extract status value from different possible fields
    const getStatusValue = (room) => {
        const rawStatus = room?.status ?? room?.roomStatus ?? room?.state;
        return String(rawStatus || "unknown").toLowerCase();
    };

    // Fetch rooms from the backend, with search term
    useEffect(() => {
        async function fetchRooms() {
            setLoading(true);
            try {
                let url = import.meta.env.VITE_BACKEND_URL + "/admin/rooms";

                if (searchTerm.trim() !== "") {
                    url = import.meta.env.VITE_BACKEND_URL + `/admin/rooms/search/${searchTerm}`;
                }

                const res = await axios.get(url);
                setRooms(res.data.data || []);

            } catch (err) {
                console.error("Error fetching rooms:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRooms();
    }, [searchTerm]);

    // Memoized filtered rooms based on status filter
    const filteredRooms = useMemo(() => {
        return rooms
            .slice()
            .sort((left, right) => {
                const leftNumber = Number(left?.room_number ?? left?.roomNumber ?? 0);
                const rightNumber = Number(right?.room_number ?? right?.roomNumber ?? 0);

                return leftNumber - rightNumber;
            })
            .filter((room) => {
            const statusValue = getStatusValue(room);

            if (statusFilter === "all") {
                return true;
            }
            return statusValue === statusFilter;
        })
    }, [rooms, statusFilter]);

    // Handlers for delete action    
    const openDeleteModal = (room) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    // Handler to close delete modal
    const closeDeleteModal = () => {
        if (isDeleting) return;
        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
    };

    // Handler for confirming deletion
    const handleDeleteRoom = async () => {
        const roomId = getRoomId(selectedRoom);

        if (!roomId) {
            toast.error("Unable to delete room: missing room id");
            return;
        }

        try {
            setIsDeleting(true);
            await axios.delete(import.meta.env.VITE_BACKEND_URL + `/admin/rooms/${roomId}`);

            setRooms((prevRooms) => prevRooms.filter((room) => getRoomId(room) !== roomId));
            toast.success("Room deleted successfully");
            closeDeleteModal();
        } catch (error) {
            console.error("Failed to delete room:", error?.response?.data || error);
            toast.error(error?.response?.data?.message || "Failed to delete room");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            
            {/* Search, Filter, and Action Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-300">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="search"
                        placeholder="Search rooms by number or status..."
                        className="outline-none w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1 md:flex-none">
                        <SlidersHorizontal size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="outline-none bg-transparent text-sm font-bold text-slate-600 pr-4 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <Link
                        to="/admin/rooms/room/add"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Add Room</span>
                    </Link>
                </div>
            </div>

            {/* Content Body */}
            {loading ? (
                <div className="py-16"><Loader /></div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                    <p className="text-slate-400 font-medium text-base">No rooms match the search criteria or status filter.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Room Number</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Room Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Floor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Guests</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                             {filteredRooms.map((room) => {
                                const status = getStatusValue(room);
                                return (
                                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            Room {room.room_number ?? room.roomNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                            {room.roomType?.type || room.RoomType?.type || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                            {room.occupancyType?.type || room.OccupancyType?.type || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                            Floor {room.floor ?? "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {(() => {
                                                const capacity = room.occupancyType?.capacity || room.OccupancyType?.capacity || 0;
                                                const hasKids = room.kids_allow ?? room.kidsAllow;
                                                const kidsCount = hasKids ? (room.kids ?? 0) : 0;
                                                const adultsCount = Math.max(1, capacity - kidsCount);

                                                if (hasKids && kidsCount > 0) {
                                                    return (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-semibold text-slate-700">{adultsCount} {adultsCount === 1 ? "Adult" : "Adults"}</span>
                                                            <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md w-fit border border-blue-100/50 mt-0.5">
                                                                {kidsCount} {kidsCount === 1 ? "Kid" : "Kids"} Allowed
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {capacity} {capacity === 1 ? "Adult" : "Adults"}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                                status === "available"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                                    : status === "occupied"
                                                        ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                                        : "bg-amber-50 text-amber-700 border-amber-200/60"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                    status === "available"
                                                        ? "bg-emerald-500"
                                                        : status === "occupied"
                                                            ? "bg-rose-500"
                                                            : "bg-amber-500"
                                                }`} />
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3.5">
                                                <button
                                                    onClick={() => navigate("/admin/rooms/room/edit", { state: { selectedRoom: room } })}
                                                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                    title="Edit room"
                                                >
                                                    <RiEditLine size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(room)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                    title="Delete room"
                                                >
                                                    <RiDeleteBinLine size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <DeleteRoomModal
                isOpen={isDeleteModalOpen}
                room={selectedRoom}
                isDeleting={isDeleting}
                onCancel={closeDeleteModal}
                onConfirm={handleDeleteRoom}
            />
        </div>
    );
}

export default RoomView;