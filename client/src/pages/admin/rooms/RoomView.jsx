import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import DeleteRoomModal from "../../../components/DeleteRoomModal";

const RoomView = () => {

    const [rooms, setRooms] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getRoomId = (room) => room?.id || room?.roomId;

    const getStatusValue = (room) => {
        const rawStatus = room?.status ?? room?.roomStatus ?? room?.state;
        return String(rawStatus || "unknown").toLowerCase();
    };


    useEffect(() => {

        async function fetchRooms() {
            try {
                const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/rooms");
                setRooms(res.data.data);
            } catch (err) {
                console.error("Error fetching rooms:", err);
            }
        }
        fetchRooms();

    }, []);

    const navigate = useNavigate();

    const openDeleteModal = (room) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isDeleting) {
            return;
        }

        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
    };

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
            
            <Link
                to="/admin/rooms/room/add"
                className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                    text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md"
            >
                <Plus />
                <label>Add Room</label>
            </Link>
            {/* Room List */}
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
                    {rooms.map((room) => (
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