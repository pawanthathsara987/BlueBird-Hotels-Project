import { Search } from "lucide-react";
import RoomView from './RoomView';
import RoomForm from "./RoomForm";
import AmenitiesView from "./AmenitiesView";
import AmenitiesForm from "./AmenitiesForm";
import { useState } from "react";

export default function RoomManagement() {
    const RoomTypes = [
        { id: 1, name: "deluxe double" },
        { id: 2, name: "deluxe double bed with MdBalcony" },
        { id: 3, name: "family" },
    ];

    const [selectBtn, setSelectBtn] = useState('room');
    const [openModal, setOpenModal] = useState(false);
    const [amenityModal, setAmenityModal] = useState(false); 

    const anyModalOpen = openModal || amenityModal;

    return (
        <div className="relative m-0 p-0 bg-gray-100 min-h-screen">

            {/* ✅ Blur wrapper around all page content */}
            <div className={anyModalOpen ? "blur-sm pointer-events-none" : ""}>

                {/* Header */}
                <div className="p-5 flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Rooms</h1>
                    <div className="flex justify-center items-center rounded-lg border">
                        <div
                            className={`flex justify-center items-center
                                text-[12px] font-bold p-3 rounded-l-lg cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'room'
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-400"}`}
                            onClick={() => setSelectBtn('room')}
                        >
                            Room
                        </div>
                        <div
                            className={`flex justify-center items-center
                                text-[12px] font-bold p-3 rounded-r-lg cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'amenities'
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-400"}`}
                            onClick={() => setSelectBtn('amenities')}
                        >
                            Amenities
                        </div>
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

                {/* Tab Views */}
                {selectBtn === 'room' ?
                    <RoomView onOpenModel={() => setOpenModal(true)} /> :
                    <AmenitiesView onOpenModal={() => setAmenityModal(true)} />
                }

            </div>

            {/* Both modals outside blur div */}
            {openModal    && <RoomForm    closeOpenModel={() => setOpenModal(false)} />}
            {amenityModal && <AmenitiesForm onClose={() => setAmenityModal(false)} />}

        </div>
    );
}