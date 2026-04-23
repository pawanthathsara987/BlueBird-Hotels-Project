import { Search } from "lucide-react";
import RoomView from './RoomView';
import AmenitiesView from "./AmenitiesView";
import PackageView from "./PackageView";
import { useState } from "react";

export default function RoomManagement() {

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