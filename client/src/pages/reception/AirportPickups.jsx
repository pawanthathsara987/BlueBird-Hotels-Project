import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    MdLocalTaxi,
    MdSearch,
    MdPerson,
    MdDirectionsCar,
    MdCheckCircle,
    MdAccessTime,
    MdLocationOn,
    MdAdd,
    MdClose,
    MdCheck,
    MdTrendingUp
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function AirportPickups() {
    const [pickups, setPickups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterToday, setFilterToday] = useState(false);

    // Theme state
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("saas_dashboard_theme");
        return saved ? JSON.parse(saved) : {
            mode: "light",
            accent: "indigo",
            cardStyle: "sleek",
            font: "sans"
        };
    });

    useEffect(() => {
        const updateTheme = () => {
            const saved = localStorage.getItem("saas_dashboard_theme");
            if (saved) setTheme(JSON.parse(saved));
        };
        window.addEventListener("theme_changed", updateTheme);
        window.addEventListener("storage", updateTheme);
        return () => {
            window.removeEventListener("theme_changed", updateTheme);
            window.removeEventListener("storage", updateTheme);
        };
    }, []);

    const accentColors = {
        indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600 hover:bg-indigo-750", bgLight: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-100 dark:border-indigo-950" },
        emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600 hover:bg-emerald-700", bgLight: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-950" },
        violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-600 hover:bg-violet-750", bgLight: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-950" },
        amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-600 hover:bg-amber-700", bgLight: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-950" },
        rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600 hover:bg-rose-700", bgLight: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-950" },
        slate: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-700 hover:bg-slate-800", bgLight: "bg-slate-100 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-850" },
    };

    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getCardStyle = () => {
        let style = "p-5 transition-all duration-300 relative overflow-hidden ";
        if (theme.mode === "dark") {
            style += "bg-slate-900 text-slate-100 ";
        } else {
            style += "bg-white text-slate-800 ";
        }
        if (theme.cardStyle === "sleek") {
            style += "shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md hover:border-slate-200/60 dark:hover:border-slate-700/80 rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "border border-slate-200/80 dark:border-slate-850 shadow-none rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border border-white/20 dark:border-slate-800/40 shadow-lg rounded-3xl ";
        }
        return style;
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [pickupsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/airport-pickups`)
            ]);

            if (pickupsRes.data.success) {
                setPickups(pickupsRes.data.data);
            }
        } catch (error) {
            console.error("Error loading pickups data:", error);
            toast.error("Failed to load airport pickup details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update Status on Backend
    const handleStatusChange = async (pickupId, status) => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/reception/airport-pickups/${pickupId}/status`, { status });
            if (res.data.success) {
                toast.success(`Pickup marked as ${status.toLowerCase()}`);
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status.");
        }
    };



    // Filters & Mappings
    const todayStr = new Date().toISOString().split("T")[0];

    const filteredPickups = pickups.filter((p) => {
        const guestName = p.booking?.Customer
            ? `${p.booking.Customer.firstName} ${p.booking.Customer.lastName}`.toLowerCase()
            : "unknown";
        const matchesSearch = guestName.includes(searchTerm.toLowerCase());
        const matchesToday = filterToday ? p.pickup_date === todayStr : true;
        return matchesSearch && matchesToday;
    });

    const getStatusColor = (status) => {
        if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
        if (status === "CANCELLED") return "bg-rose-500/10 text-rose-500 border border-rose-500/25";
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
    };

    // Statistics counts
    const totalCount = pickups.length;
    const todayCount = pickups.filter(p => p.pickup_date === todayStr).length;
    const completedCount = pickups.filter(p => p.status === "COMPLETED").length;
    const confirmedCount = pickups.filter(p => p.status === "CONFIRMED").length;

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
            }`}>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-2xl mb-6 relative overflow-hidden">
                <div className="space-y-1">
                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-[#0c325e]"}`}>
                        <MdLocalTaxi className={currentAccent.text} size={28} />
                        Airport Pickup Schedule
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        View scheduled airport pickups, track arrivals, and monitor request statuses.
                    </p>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pickups</p>
                    <h3 className="text-2xl font-black mt-1">{isLoading ? "..." : totalCount}</h3>
                </div>
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Pickups</p>
                    <h3 className="text-2xl font-black text-blue-500 mt-1">{isLoading ? "..." : todayCount}</h3>
                </div>
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Confirmed</p>
                    <h3 className="text-2xl font-black text-amber-500 mt-1">{isLoading ? "..." : confirmedCount}</h3>
                </div>
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed</p>
                    <h3 className="text-2xl font-black text-emerald-500 mt-1">{isLoading ? "..." : completedCount}</h3>
                </div>
            </div>

            {/* Filters Row */}
            <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                <div className="relative w-full md:w-80">
                    <MdSearch className="absolute left-3 top-3 text-slate-400 text-lg" />
                    <input
                        className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none bg-transparent dark:border-slate-800 focus:border-blue-500"
                        placeholder="Search guest name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setFilterToday(false)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${!filterToday
                            ? `${currentAccent.bg} text-white border-transparent`
                            : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                    >
                        All Requests
                    </button>
                    <button
                        onClick={() => setFilterToday(true)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${filterToday
                            ? `${currentAccent.bg} text-white border-transparent`
                            : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                    >
                        Today's Schedule
                    </button>
                </div>
            </div>

            {/* Pickups Table */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-slate-500 mt-2 text-xs font-bold">Loading schedule...</p>
                    </div>
                ) : filteredPickups.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-bold text-sm">
                        No pickup requests scheduled.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={theme.mode === "dark" ? "bg-slate-900 border-b border-slate-850" : "bg-slate-50 border-b border-slate-100"}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Booking ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Guest</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Passengers</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                {filteredPickups.map((pickup) => {
                                    const guestName = pickup.booking?.Customer
                                        ? `${pickup.booking.Customer.firstName} ${pickup.booking.Customer.lastName}`
                                        : "N/A";
                                    const phone = pickup.booking?.Customer?.phoneNumber || "N/A";
                                    const email = pickup.booking?.Customer?.email || "N/A";

                                    return (
                                        <tr key={pickup.id} className={theme.mode === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50/50"}>
                                            <td className="px-6 py-4 font-bold text-blue-500">#{pickup.booking_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-800 dark:text-slate-200">{guestName}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">📞 {phone}</div>
                                                <div className="text-[10px] text-slate-500">✉️ {email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <MdAccessTime size={13} className="text-slate-400" />
                                                    <span>{pickup.pickup_date} at {pickup.pickup_time.slice(0, 5)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-0.5">
                                                    <MdLocationOn size={13} className="text-slate-400" />
                                                    <span>{pickup.pickup_location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">{pickup.passenger_count} Passenger(s)</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(pickup.status)}`}>
                                                    {pickup.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {pickup.status === "CONFIRMED" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(pickup.id, "COMPLETED")}
                                                                className="px-3 py-1 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer flex items-center gap-1"
                                                                title="Mark Completed"
                                                            >
                                                                <MdCheck size={12} /> Complete
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(pickup.id, "CANCELLED")}
                                                                className="px-3 py-1 text-[10px] font-bold border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer flex items-center gap-1"
                                                                title="Cancel Pickup"
                                                            >
                                                                <MdClose size={12} /> Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {pickup.status !== "CONFIRMED" && (
                                                        <span className="text-slate-400 italic text-[10px]">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



        </div>
    );
}
