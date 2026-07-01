import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight, MdList, MdAdd } from "react-icons/md";
import NewBookingFlow from "./NewBookingFlow";

export default function Booking() {
    const [activeTab, setActiveTab] = useState("list");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allBookings, setAllBookings] = useState([]);

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab === "new") {
            setActiveTab("new");
        } else {
            setActiveTab("list");
        }
    }, [location.search]);
    const [isLoading, setIsLoading] = useState(true);

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

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/roombook/bookings");
            if (response.data.success) {
                const flatList = [];
                response.data.data.forEach(res => {
                    if (res.bookedRooms && Array.isArray(res.bookedRooms)) {
                        res.bookedRooms.forEach(br => {
                            let statusStr = br.status;
                            if (statusStr === 'reserved') statusStr = 'Confirmed';
                            else if (statusStr === 'checked_in') statusStr = 'Checked In';
                            else if (statusStr === 'checked_out') statusStr = 'Checked Out';
                            else if (statusStr === 'cancelled') statusStr = 'Cancelled';
                            else if (statusStr) statusStr = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);

                            flatList.push({
                                id: `${res.id}-${br.id}`,
                                guestName: res.Customer ? `${res.Customer.firstName} ${res.Customer.lastName}` : 'Unknown',
                                roomNumber: br.Room ? br.Room.roomNumber : 'N/A',
                                roomType: br.Room && br.Room.roomType ? (br.Room.roomType.type || 'Standard') : 'Standard',
                                checkInDate: br.checkIn,
                                checkOutDate: br.checkOut,
                                status: statusStr || "Pending",
                                price: res.total_price ? `Rs. ${res.total_price}` : 'N/A',
                                phone: res.Customer ? res.Customer.phoneNumber : 'N/A',
                            });
                        });
                    }
                });
                setAllBookings(flatList);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "list") {
            fetchBookings();
        }
    }, [activeTab]);

    // Filter bookings by date
    const filteredBookings = useMemo(() => {
        return allBookings.filter((booking) => {
            const matchesDate =
                booking.checkInDate === selectedDate || booking.checkOutDate === selectedDate ||
                (selectedDate >= booking.checkInDate && selectedDate <= booking.checkOutDate);
            const matchesSearch =
                booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.roomNumber && booking.roomNumber.toString().includes(searchTerm));
            return matchesDate && matchesSearch;
        });
    }, [selectedDate, searchTerm, allBookings]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Checked In":
                return "bg-green-500/10 text-green-500 border border-green-500/20";
            case "Confirmed":
                return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            case "Pending":
                return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
            case "Checked Out":
                return theme.mode === "dark" ? "bg-slate-800 text-slate-400 border border-slate-700/50" : "bg-slate-100 text-slate-600 border border-slate-200";
            default:
                return theme.mode === "dark" ? "bg-slate-800 text-slate-400 border border-slate-700/50" : "bg-slate-100 text-slate-600 border border-slate-200";
        }
    };

    const handlePreviousDate = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate.toISOString().split("T")[0]);
    };

    const handleNextDate = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate.toISOString().split("T")[0]);
    };

    const formatDate = (dateString) => {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", options);
    };

    // Accent colors config
    const accentColors = {
        indigo: { bg: "bg-indigo-600 hover:bg-indigo-700", text: "text-indigo-600 dark:text-indigo-400" },
        teal: { bg: "bg-teal-600 hover:bg-teal-700", text: "text-teal-600 dark:text-teal-400" },
        violet: { bg: "bg-violet-600 hover:bg-violet-700", text: "text-violet-600 dark:text-violet-400" },
        amber: { bg: "bg-amber-600 hover:bg-amber-700", text: "text-amber-600 dark:text-amber-400" },
        rose: { bg: "bg-rose-600 hover:bg-rose-700", text: "text-rose-600 dark:text-rose-400" },
        slate: { bg: "bg-slate-700 hover:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
    };
    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    return (
        <div className={`w-full px-4 md:px-6 lg:px-8 py-6 min-h-screen transition-colors duration-300 ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
            }`}>
            <style>{`
                .light-mode-high-contrast .text-slate-400 {
                    color: #475569 !important;
                }
                .light-mode-high-contrast .text-slate-500 {
                    color: #334155 !important;
                }
            `}</style>

            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.mode === "dark" ? "text-white" : "text-[#0c325e]"}`}>
                        Bookings Management
                    </h1>
                    <p className={`text-xs md:text-sm font-medium mt-1 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Manage walk-in bookings and view existing reservations
                    </p>
                </div>
                <div className={`p-1 rounded-xl flex items-center gap-2 border ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                    }`}>
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'list'
                            ? (theme.mode === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-blue-600 shadow-sm")
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <MdList className="text-lg" /> View Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'new'
                            ? (theme.mode === "dark" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-green-600 shadow-sm")
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <MdAdd className="text-lg" /> New Booking
                    </button>
                </div>
            </div>

            {activeTab === "new" ? (
                <NewBookingFlow onBookingSuccess={() => setActiveTab("list")} />
            ) : (
                <>
                    {/* Filter Section */}
                    <div className={`rounded-2xl border p-4 md:p-6 mb-6 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                        }`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            {/* Date Navigation */}
                            <div className="flex items-center gap-2 md:gap-4">
                                <button
                                    onClick={handlePreviousDate}
                                    className={`p-2 rounded-xl transition cursor-pointer ${theme.mode === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
                                    title="Previous Date"
                                >
                                    <MdChevronLeft className="text-xl md:text-2xl" />
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={`w-full px-3 md:px-4 py-2 text-sm border rounded-xl focus:outline-none ${theme.mode === "dark"
                                            ? "bg-slate-900 border-slate-800 text-white focus:border-slate-600"
                                            : "bg-white border-slate-200 text-slate-800 focus:border-blue-500"
                                            }`}
                                    />
                                </div>
                                <button
                                    onClick={handleNextDate}
                                    className={`p-2 rounded-xl transition cursor-pointer ${theme.mode === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
                                    title="Next Date"
                                >
                                    <MdChevronRight className="text-xl md:text-2xl" />
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-2.5 md:top-3 text-slate-400 text-lg md:text-xl" />
                                <input
                                    type="text"
                                    placeholder="Search by guest name or room..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-sm border rounded-xl focus:outline-none ${theme.mode === "dark"
                                        ? "bg-slate-900 border-slate-800 text-white focus:border-slate-600"
                                        : "bg-white border-slate-200 text-slate-800 focus:border-blue-500"
                                        }`}
                                />
                            </div>

                            {/* Date Display */}
                            <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border ${theme.mode === "dark"
                                ? "bg-teal-950/20 border-teal-900/30 text-teal-400"
                                : "bg-blue-50 border-blue-100 text-blue-900"
                                }`}>
                                <MdCalendarToday className="text-lg md:text-xl flex-shrink-0" />
                                <span className="font-extrabold text-sm md:text-base">{formatDate(selectedDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                        }`}>
                        {filteredBookings.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className={theme.mode === "dark" ? "bg-slate-900 border-b border-slate-800" : "bg-slate-50 border-b border-slate-100"}>
                                            <tr>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Guest Name
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Room
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Room Type
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Check-In
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Check-Out
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Status
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Price
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Phone
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {filteredBookings.map((booking, index) => (
                                                <tr
                                                    key={booking.id}
                                                    className={
                                                        theme.mode === "dark"
                                                            ? (index % 2 === 0 ? "bg-slate-900" : "bg-slate-800/40")
                                                            : (index % 2 === 0 ? "bg-white" : "bg-slate-50/40")
                                                    }
                                                >
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm font-bold ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>
                                                        {booking.guestName}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm font-extrabold ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                                                        Room {booking.roomNumber}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                                                        {booking.roomType}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                                                        {formatDate(booking.checkInDate)}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                                                        {formatDate(booking.checkOutDate)}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm font-black ${theme.mode === "dark" ? "text-teal-400" : "text-[#0d9488]"}`}>
                                                        {booking.price}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                                                        {booking.phone}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4 p-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {filteredBookings.map((booking) => (
                                        <div key={booking.id} className="pt-4 first:pt-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{booking.guestName}</p>
                                                    <p className={`text-xs ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>Room {booking.roomNumber}</p>
                                                </div>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Type</p>
                                                    <p className={`font-semibold ${theme.mode === "dark" ? "text-slate-200" : "text-slate-700"}`}>{booking.roomType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Price</p>
                                                    <p className={`font-semibold ${theme.mode === "dark" ? "text-slate-200" : "text-slate-700"}`}>{booking.price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Check-In</p>
                                                    <p className={`text-[10px] ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>{formatDate(booking.checkInDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Check-Out</p>
                                                    <p className={`text-[10px] ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>{formatDate(booking.checkOutDate)}</p>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                                                Phone: <span className="font-semibold">{booking.phone}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="p-6 md:p-8 text-center">
                                <p className={`text-base md:text-lg font-bold ${theme.mode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                                    No bookings found for {formatDate(selectedDate)}
                                </p>
                                <p className="text-slate-500 text-xs md:text-sm mt-2">Try selecting a different date or adjusting your search</p>
                            </div>
                        )}
                    </div>

                    {/* Summary statistics */}
                    {filteredBookings.length > 0 && (
                        <div className={`mt-6 rounded-2xl border p-4 md:p-6 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                            }`}>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                <div className="border-l-4 border-blue-500 pl-3 md:pl-4">
                                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider">Total Bookings</p>
                                    <p className={`text-2xl md:text-3xl font-black mt-1 ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{filteredBookings.length}</p>
                                </div>
                                <div className="border-l-4 border-emerald-500 pl-3 md:pl-4">
                                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider">Checked In</p>
                                    <p className="text-2xl md:text-3xl font-black text-emerald-500 mt-1">
                                        {filteredBookings.filter((b) => b.status === "Checked In").length}
                                    </p>
                                </div>
                                <div className="border-l-4 border-amber-500 pl-3 md:pl-4">
                                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider">Pending</p>
                                    <p className="text-2xl md:text-3xl font-black text-amber-500 mt-1">
                                        {filteredBookings.filter((b) => b.status === "Pending").length}
                                    </p>
                                </div>
                                <div className="border-l-4 border-blue-600 pl-3 md:pl-4">
                                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider">Confirmed</p>
                                    <p className="text-2xl md:text-3xl font-black text-blue-500 mt-1">
                                        {filteredBookings.filter((b) => b.status === "Confirmed").length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
