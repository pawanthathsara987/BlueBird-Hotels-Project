import { Bed, Sparkles, Layers, DollarSign } from "lucide-react";
import RoomView from './RoomView';
import AmenitiesView from "./AmenitiesView";
import RoomTypeView from "./RoomTypeView";
import RoomPriceView from "./RoomPriceView";
import { useState } from "react";

export default function RoomManagement() {

    const lastOpenTab = localStorage.getItem('roomSelectBtn') || 'room';
    const [selectBtn, setSelectBtn] = useState(lastOpenTab);
    
    const saveSelectBtn = (value) => {
        localStorage.setItem('roomSelectBtn', value);
        setSelectBtn(value);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
                
                {/* Premium Dashboard Header Card */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                <Bed size={22} className="animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                                Hotel Properties
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Room Management
                        </h1>
                    </div>

                    {/* Premium Sliding Pill Tab Switcher */}
                    <div className="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50 w-fit self-start lg:self-center shadow-inner">
                        <button
                            onClick={() => saveSelectBtn('room')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                                selectBtn === 'room'
                                    ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                            }`}
                        >
                            <Bed size={16} />
                            <span>Room</span>
                        </button>
                        <button
                            onClick={() => saveSelectBtn('amenities')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                                selectBtn === 'amenities'
                                    ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                            }`}
                        >
                            <Sparkles size={16} />
                            <span>Amenities</span>
                        </button>
                        <button
                            onClick={() => saveSelectBtn('packages')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                                selectBtn === 'packages'
                                    ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                            }`}
                        >
                            <Layers size={16} />
                            <span>Room Type</span>
                        </button>
                        <button
                            onClick={() => saveSelectBtn('prices')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                                selectBtn === 'prices'
                                    ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                            }`}
                        >
                            <DollarSign size={16} />
                            <span>Room Price</span>
                        </button>
                    </div>
                </div>

                {/* View Container Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-1">
                        {selectBtn === 'room' ? (
                            <RoomView />
                        ) : selectBtn === 'amenities' ? (
                            <AmenitiesView />
                        ) : selectBtn === 'packages' ? (
                            <RoomTypeView />
                        ) : (
                            <RoomPriceView />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}