import React, { useState, useMemo } from "react";
import { Filter, Calendar, Maximize2, Layers, Users, Building2, Bed, Activity, Clock } from "lucide-react";

export default function RoomStatusGrid({ loading, rooms = [], roomTypes = [] }) {
    // Filters & view states
    const [selectedFloor, setSelectedFloor] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
    const [timeRange, setTimeRange] = useState("Today");
    const [isMaximized, setIsMaximized] = useState(false);

    // Active tooltip room ID
    const [hoveredRoomId, setHoveredRoomId] = useState(null);

    // Extract unique floors
    const floors = useMemo(() => {
        const uniqueFloors = new Set(rooms.map(r => r.floor).filter(Boolean));
        return Array.from(uniqueFloors).sort((a, b) => a - b);
    }, [rooms]);

    // Enhance room data with visual dashboard statuses mapping to the exact reference image colors
    const enrichedRooms = useMemo(() => {
        return rooms.map((room) => {
            let dashboardStatus = "not_booked"; // default white/gray
            
            // Map SQL database statuses to the image legend states
            const dbStatus = String(room.status || "available").toLowerCase();
            
            if (dbStatus === "occupied") {
                dashboardStatus = "booked"; // solid green
            } else if (dbStatus === "maintenance") {
                dashboardStatus = "canceled"; // solid red
            } else {
                // Check if the room has an active booking that is in "pending" status
                const hasPendingBooking = room.bookedRooms?.some(
                    (br) => br.booking?.status === "pending" && br.status !== "cancelled"
                );
                
                if (hasPendingBooking) {
                    dashboardStatus = "pending"; // orange/amber pending state
                } else {
                    dashboardStatus = "not_booked"; // available (gray/white)
                }
            }

            return {
                ...room,
                dashboardStatus
            };
        });
    }, [rooms]);

    // Apply filtering
    const filteredRooms = useMemo(() => {
        return enrichedRooms
            .filter(room => {
                if (selectedFloor !== "all" && String(room.floor) !== String(selectedFloor)) return false;
                if (selectedType !== "all" && String(room.room_type_id || room.roomType?.id) !== String(selectedType)) return false;
                if (selectedStatus !== "all" && room.dashboardStatus !== selectedStatus) return false;
                return true;
            })
            .sort((a, b) => Number(a.room_number || 0) - Number(b.room_number || 0));
    }, [enrichedRooms, selectedFloor, selectedType, selectedStatus]);

    return (
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 transition-all duration-300 relative ${isMaximized ? "fixed inset-4 z-50 overflow-y-auto" : ""}`}>
            
            {/* Widget Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" />
                        Room Status
                    </h2>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Interactive live room allocation matrix</p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    
                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                                showFiltersDropdown || selectedFloor !== "all" || selectedType !== "all" || selectedStatus !== "all"
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Filter size={14} />
                            <span>Filter</span>
                            {(selectedFloor !== "all" || selectedType !== "all" || selectedStatus !== "all") && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                        </button>

                        {/* Advanced Filters Dropdown popup */}
                        {showFiltersDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFiltersDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-20 space-y-3.5 animate-fadeIn">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-black text-slate-700">Filter Grid</span>
                                        <button 
                                            onClick={() => {
                                                setSelectedFloor("all");
                                                setSelectedType("all");
                                                setSelectedStatus("all");
                                                setShowFiltersDropdown(false);
                                            }}
                                            className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer"
                                        >
                                            Reset All
                                        </button>
                                    </div>

                                    {/* Filter Floor */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Floor</label>
                                        <select
                                            value={selectedFloor}
                                            onChange={(e) => setSelectedFloor(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 text-xs font-semibold text-slate-600 outline-none"
                                        >
                                            <option value="all">All Floors</option>
                                            {floors.map(f => (
                                                <option key={f} value={f}>Floor {f}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filter Room Type */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Room Type</label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 text-xs font-semibold text-slate-600 outline-none"
                                        >
                                            <option value="all">All Room Types</option>
                                            {roomTypes.map(rt => (
                                                <option key={rt.id} value={rt.id}>{rt.type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filter Visual Status */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 text-xs font-semibold text-slate-600 outline-none"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="booked">Booked (Green)</option>
                                            <option value="canceled">Canceled (Red)</option>
                                            <option value="pending">Pending (Mint)</option>
                                            <option value="not_booked">Not Booked (Gray)</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Date Dropdown */}
                    <div className="relative flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                        <Calendar size={14} className="text-slate-400" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-transparent text-xs font-extrabold text-slate-600 outline-none pr-3 cursor-pointer"
                        >
                            <option value="Today">Today</option>
                            <option value="Week">This Week</option>
                            <option value="Month">This Month</option>
                        </select>
                    </div>

                    {/* Resize Button */}
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer hover:bg-slate-50"
                        title={isMaximized ? "Minimize Widget" : "Maximize Widget"}
                    >
                        <Maximize2 size={14} />
                    </button>

                </div>
            </div>

            {/* Loading state / Empty grid state */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="flex justify-center items-center mb-3">
                        <span className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                    <p className="text-slate-400 text-sm font-semibold">Retrieving rooms matrix...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-slate-150 rounded-2xl bg-slate-50/20">
                    <p className="text-slate-400 text-sm font-semibold">No configured rooms match the selected filters.</p>
                </div>
            ) : (
                /* Dynamic Room Grid matching the 11-column aesthetic layout exactly */
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3 md:gap-4 p-1">
                    {filteredRooms.map((room) => {
                        // Extract color styles based on the mapped status representation
                        let blockStyle = "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:scale-105 border border-slate-200/50 shadow-inner"; // Not Booked (white-gray)
                        
                        if (room.dashboardStatus === "booked") {
                            blockStyle = "bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:scale-105 shadow-md shadow-emerald-500/10 border border-transparent"; // Mapped to booked (Green)
                        } else if (room.dashboardStatus === "canceled") {
                            blockStyle = "bg-rose-500 text-white font-bold hover:bg-rose-600 hover:scale-105 shadow-md shadow-rose-500/10 border border-transparent"; // Mapped to maintenance/canceled (Red)
                        } else if (room.dashboardStatus === "pending") {
                            blockStyle = "bg-emerald-50/80 text-emerald-700 font-bold border border-emerald-200/70 hover:bg-emerald-100/70 hover:scale-105 shadow-sm"; // Faint pending green
                        }

                        // Pad room numbers for visual harmony (e.g. 1 -> 01, 101 -> 101)
                        const displayNum = String(room.room_number ?? room.roomNumber ?? "00").padStart(2, "0");

                        return (
                            <div
                                key={room.id}
                                onMouseEnter={() => setHoveredRoomId(room.id)}
                                onMouseLeave={() => setHoveredRoomId(null)}
                                className={`relative h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 ease-out cursor-pointer ${blockStyle}`}
                            >
                                <span>{displayNum}</span>

                                {/* Sleek Tooltip card overlay details */}
                                {hoveredRoomId === room.id && (
                                    <div className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-35 animate-scaleUp pointer-events-none">
                                        {/* Caret arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
                                        
                                        <div className="space-y-3 text-left">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                <span className="text-xs font-black text-white">Room {displayNum}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                                    room.dashboardStatus === "booked" ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/20" :
                                                    room.dashboardStatus === "canceled" ? "bg-rose-500/10 text-rose-400 border-rose-400/20" :
                                                    room.dashboardStatus === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-400/20" :
                                                    "bg-slate-500/10 text-slate-400 border-slate-400/20"
                                                }`}>
                                                    {room.dashboardStatus === "booked" ? "Booked" :
                                                     room.dashboardStatus === "canceled" ? "Offline" :
                                                     room.dashboardStatus === "pending" ? "Pending" :
                                                     "Available"}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-[11px] text-slate-300 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Layers size={11} className="text-slate-500" />
                                                    <span>Type: <strong>{room.roomType?.type || "Standard"}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 size={11} className="text-slate-500" />
                                                    <span>Floor: <strong>{room.floor ?? "1"}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={11} className="text-slate-500" />
                                                    <span>Capacity: <strong>{room.occupancyType?.capacity ?? "2"} Guests</strong></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Bed size={11} className="text-slate-500" />
                                                    <span>Status: <strong>{room.status || "Available"}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sleek Legend at the bottom exact replica of the user image */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400 font-semibold gap-4">
                <div className="flex flex-wrap items-center gap-5 sm:gap-6 bg-slate-50/70 py-2.5 px-5 rounded-2xl border border-slate-100 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0 shadow-sm" />
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-rose-500 flex-shrink-0 shadow-sm" />
                        <span>Canceled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200/50 flex-shrink-0 shadow-sm" />
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm" />
                        <span>Not Booked</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-blue-50/40 px-3.5 py-2 rounded-xl border border-blue-100/30">
                    <Clock size={12} className="text-blue-500" />
                    <span>Showing filtered system statistics in real-time</span>
                </div>
            </div>

        </div>
    );
}
