import axios from "axios";
import { Plus, Search } from "lucide-react";
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
                setRooms(res.data.data);

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
        return rooms.filter((room) => {
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


    // Handler to close delete modal, preventing closure during deletion process    
    const closeDeleteModal = () => {
        if (isDeleting) {
            return;
        }

        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
    };


    // Handler for confirming deletion of a room, with error handling
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
        <div className="mt-10 mx-5 rounded-lg">
            <div className="w-[90%] md:w-[65%] mx-auto mt-8 px-6 py-4 flex flex-col md:flex-row gap-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    <input
                        type="search"
                        placeholder="Search rooms..."
                        className="outline-none w-full bg-transparent text-sm text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                </select>
            </div>
            <Link
                to="/admin/rooms/room/add"
                className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                    text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md"
            >
                <Plus />
                <label>Add Room</label>
            </Link>

            {loading ? (
                <Loader />
            ) : (
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2">Room No</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map((room) => (
                            <tr key={room.id} className="text-center border-t">

                                <td className="px-4 py-2">{room.roomNumber}</td>

                                <td className="px-4 py-2">
                                    {room.RoomPackage?.pname || "N/A"}
                                </td>

                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-white text-xs ${getStatusValue(room) === "available"
                                        ? "bg-green-500"
                                        : getStatusValue(room) === "occupied"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                        }`}>
                                        {getStatusValue(room)}
                                    </span>
                                </td>

                                <td className="px-4 py-2 flex justify-center gap-3">
                                    <button
                                        onClick={() => navigate("/admin/rooms/room/edit", { state: { selectedRoom: room } })}
                                        className="text-blue-500"
                                    >
                                        <RiEditLine size={18} />
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(room)}
                                        className="text-red-500">
                                        <RiDeleteBinLine size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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