import { Search } from "lucide-react";
import TourView from './TourView';
import TourItemView from "./TourItemView";
import { useState } from "react";

export default function TourManagement() {
    const lastOpenTab = localStorage.getItem('tourSelectBtn') || 'tours';
    const [selectBtn, setSelectBtn] = useState(lastOpenTab);
    const [searchQuery, setSearchQuery] = useState("");
    
    const saveSelectBtn = (value) => {
        localStorage.setItem('tourSelectBtn', value);
        setSelectBtn(value);
    };

    return (
        <div className="relative m-0 p-0 bg-gray-100 min-h-screen">
            <div>
                {/* Header */}
                <div className="p-5 flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Tours</h1>
                    <div className="flex justify-center items-center rounded-full border-2 border-blue-600 p-1 bg-white shadow-md">
                        <button
                            className={`px-6 py-2 rounded-full text-13px font-bold cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'tours'
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-700 hover:bg-gray-100"}`}
                            onClick={() => saveSelectBtn('tours')}
                        >
                            Tours
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-13px font-bold cursor-pointer
                                transition-all duration-300 ease-in-out
                                ${selectBtn == 'items'
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-700 hover:bg-gray-100"}`}
                            onClick={() => saveSelectBtn('items')}
                        >
                            Items
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
                            placeholder={selectBtn === 'tours' ? "Search tours..." : "Search items..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="outline-none w-full bg-transparent text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                </div>
                

                
                {/* Tab Views */}
                {selectBtn === 'tours' ? (
                    <TourView searchQuery={searchQuery} />
                ) : (
                    <TourItemView searchQuery={searchQuery} />
                )}

            </div>

        </div>
    );
}
