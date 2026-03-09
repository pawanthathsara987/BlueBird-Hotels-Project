import { Plus } from "lucide-react";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";

const AmenitiesView = ({ onOpenModal }) => {

    const Amenities = [
        { id: 1, name: "WiFi",             assignedRooms: 6 },
        { id: 2, name: "Air Condition",    assignedRooms: 4 },
        { id: 3, name: "TV",               assignedRooms: 6 },
        { id: 4, name: "Mini Bar",         assignedRooms: 3 },
        { id: 5, name: "Balcony",          assignedRooms: 2 },
        { id: 6, name: "Bathtub",          assignedRooms: 2 },
        { id: 7, name: "Safe Box",         assignedRooms: 5 },
        { id: 8, name: "Hair Dryer",       assignedRooms: 6 },
        { id: 9, name: "TV",               assignedRooms: 6 },
        { id: 10, name: "Mini Bar",         assignedRooms: 3 },
        { id: 11, name: "Balcony",          assignedRooms: 2 },
        { id: 12, name: "Bathtub",          assignedRooms: 2 },
        { id: 13, name: "Safe Box",         assignedRooms: 5 },
        { id: 14, name: "Hair Dryer",       assignedRooms: 6 },
    ];

    return (
        <div className="mt-10 mx-5 rounded-lg">

            {/* Add Button */}
            <div
                className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                    text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md cursor-pointer hover:bg-blue-500"
                onClick={onOpenModal}
            >
                <Plus />
                <label className="cursor-pointer">Add Amenity</label>
            </div>

            {/* Amenities Table */}
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Amenity Name</th>
                        <th className="px-4 py-2">Assigned Rooms</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Amenities.map((amenity) => (
                        <tr key={amenity.id} className="text-center border-t">
                            <td className="px-4 py-2 text-gray-500">{amenity.id}</td>   
                            <td className="px-4 py-2 font-medium">{amenity.name}</td>
                            <td className="px-4 py-2">
                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                    {amenity.assignedRooms} Rooms
                                </span>
                            </td>
                            <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                <RiEditLine className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                                <RiDeleteBinLine className="text-red-500 hover:text-red-700 cursor-pointer" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AmenitiesView;