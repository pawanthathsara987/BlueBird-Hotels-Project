import { Plus } from "lucide-react";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const RoomView = () => {
    const navigate = useNavigate();

    const Rooms = [
        {
            roomNo: 101,
            type: "deluxe double",
            status: "maintenance",
        },
        {
            roomNo: 102,
            type: "deluxe double",
            status: "available",
        },
        {
            roomNo: 103,
            type: "deluxe double bed with MdBalcony",
            status: "maintenance",
        },
        {
            roomNo: 104,
            type: "family",
            status: "available",
        },
        {
            roomNo: 105,
            type: "family",
            status: "maintenance",
        },
        {
            roomNo: 106,
            type: "deluxe double bed with MdBalcony",
            status: "available",
        },
    ];

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
                        <th className="px-4 py-2">Room Name</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Rooms.map((room) => (
                        <tr key={room.roomNo} className="text-center">
                            <td className="px-4 py-2">{room.roomNo}</td>
                            <td className="px-4 py-2">{room.type}</td>
                            <td className="px-4 py-2">
                                <span className={`${
                                    room.status === "maintenance" ? "text-red-500" : "text-green-500"
                                }`}>
                                    {room.status}
                                </span>
                            </td>
                            <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                <button
                                    onClick={() => navigate("/admin/rooms/room/edit", { state: { selectedRoom: room } })}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Edit room"
                                >
                                    <RiEditLine />
                                </button>
                                <RiDeleteBinLine className="text-red-500 hover:text-red-700"/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RoomView;