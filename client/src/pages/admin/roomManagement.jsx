import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";

export default function RoomManagement() {
    const RoomTypes = [
        {
            id: 1,
            name: "deluxe double",
        },
        {
            id: 2,
            name: "deluxe double bed with MdBalcony",
        },
        {
            id: 3,
            name: "family",
        },
    ];

    const Rooms = [
        {
            roomNo: 101,
            type: "deluxe double",
            adults: 2,
            kids: 0,
            price: 156,
            status: "maintenance",
        },
        {
            roomNo: 102,
            type: "deluxe double",
            adults: 2,
            kids: 1,
            price: 165,
            status: "available",
        },
        {
            roomNo: 103,
            type: "deluxe double bed with MdBalcony",
            adults: 2,
            kids: 0,
            price: 180,
            status: "maintenance",
        },
        {
            roomNo: 104,
            type: "family",
            adults: 4,
            kids: 2,
            price: 210,
            status: "available",
        },
        {
            roomNo: 105,
            type: "family",
            adults: 3,
            kids: 1,
            price: 190,
            status: "maintenance",
        },
        {
            roomNo: 106,
            type: "deluxe double bed with MdBalcony",
            adults: 2,
            kids: 0,
            price: 200,
            status: "available",
        },
    ];

    const [buttonType, setButtonType] = useState(true);

    return (
        <div className="m-0 p-0 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="p-5 flex justify-between items-center">
                <h1 className="text-4xl font-bold">Rooms</h1>
                <div className="flex justify-center items-center space-x-3 bg-blue-600 text-white text-lg font-bold p-3 rounded-md cursor-pointer hover:bg-blue-700">
                    <Plus />
                    <button>Add Room</button>
                </div>
            </div>

            {/* Filter */}
            <div className="md:w-[60%] sm:w-[80%] m-auto mt-10 p-5 border flex sm:flex-wrap md:flex-row justify-between bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center space-x-2 w-full md:w-[50%] border rounded-lg p-2 bg-gray-50">
                    <input
                        type="search"
                        placeholder="Search Rooms..."
                        className="outline-none w-full p-2 rounded-lg"
                    />
                    <Search />
                </div>
                <div className="flex justify-between items-center space-x-2 border rounded-lg p-2 bg-gray-50 w-full md:w-[40%] sm:w-full md:mt-0 lg:mt-0 sm:mt-5">
                    <select name="package" className="w-full outline-none p-2 rounded-lg">
                        <option value="all">All Types</option>
                        {RoomTypes.map((RoomType) => (
                            <option key={RoomType.id} value={RoomType.id}>
                                {RoomType.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Room List */}
            <div className="mt-10 mx-5 bg-white border shadow-md rounded-lg">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2">Room Name</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Capacity</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Rooms.map((room) => (
                            <tr className="text-center">
                                <td className="px-4 py-2">{room.roomNo}</td>
                                <td className="px-4 py-2">{room.type}</td>
                                <td className="px-4 py-2">{room.adults} Adults and {room.kids} Kids</td>
                                <td className="px-4 py-2">${room.price} /night</td>
                                <td className="px-4 py-2">
                                    <span className={`${
                                        room.status === "maintenance" ? "text-red-500" : "text-green-500"
                                    }`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                    <div>
                                        {buttonType ? (
                                            <button className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-600">
                                                Edit
                                            </button>
                                        ) : (
                                            <button className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600">
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <FaExchangeAlt
                                        className="w-5 rotate-90 border bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400"
                                        onClick={() => setButtonType(!buttonType)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}