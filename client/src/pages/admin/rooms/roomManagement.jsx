import { Search } from "lucide-react";
import RoomView from './RoomView';
import AmenitiesView from "./AmenitiesView";
import PackageView from "./PackageView";
import { useState } from "react";

export default function RoomManagement() {
    const RoomTypes = [
        { id: 1, name: "deluxe double" },
        { id: 2, name: "deluxe double bed with MdBalcony" },
        { id: 3, name: "family" },
    ];

    const lastOpenTab = localStorage.getItem('roomSelectBtn') || 'room';
    const [selectBtn, setSelectBtn] = useState(lastOpenTab);
    
    const saveSelectBtn = (value) => {
        localStorage.setItem('roomSelectBtn', value);
        setSelectBtn(value);
    };


    return (
        <div className="relative m-0 p-0 bg-gray-100 min-h-screen">
            <div>
                {/* Header */}
                <div className="p-5 flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Rooms</h1>
                    <div className="flex justify-center items-center rounded-full border-2 border-blue-600 p-1 bg-white shadow-md">
                        <button
                            className={`px-6 py-2 rounded-full text-13px font-bold cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'room'
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-700 hover:bg-gray-100"}`}
                            onClick={() => saveSelectBtn('room')}
                        >
                            Room
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-13px font-bold cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'amenities'
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-700 hover:bg-gray-100"}`}
                            onClick={() => saveSelectBtn('amenities')}
                        >
                            Amenities
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-13px font-bold cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'packages'
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-700 hover:bg-gray-100"}`}
                            onClick={() => saveSelectBtn('packages')}
                        >
                            Packages
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="w-[90%] md:w-[65%] mx-auto mt-8 px-6 py-4 flex flex-col md:flex-row gap-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    
                    {/* Search Input */}
                    <div className="flex items-center gap-3 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <input
                            type="search"
                            placeholder="Search rooms..."
                            className="outline-none w-full bg-transparent text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {/* Divider - visible only on md+ */}
                    <div className="hidden md:block w-px bg-gray-200 self-stretch" />

                    {/* Select Filter */}
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:w-[38%] focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                        <select
                            name="package"
                            className="w-full outline-none bg-transparent text-sm text-gray-700 cursor-pointer"
                        >
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
                {selectBtn === 'room' ? (
                    <RoomView />
                ) : selectBtn === 'amenities' ? (
                    <AmenitiesView />
                ) : (
                    <PackageView />
                )}

            </div>

        </div>
    );
}