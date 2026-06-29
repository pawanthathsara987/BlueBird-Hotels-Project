import React, { useState, useEffect } from "react";
import { MdSearch as MdSearchIcon, MdCheckCircle as MdCheckCircleIcon, MdClose as MdCloseIcon } from "react-icons/md";
import axios from "axios";

export default function CheckIn() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [pendingCheckIns, setPendingCheckIns] = useState([]);

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

    const fetchPendingCheckIns = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/reception/pending-checkins`
            );
            setPendingCheckIns(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPendingCheckIns();
    }, []);

    const filteredGuests = pendingCheckIns.filter((guest) => {
        const name = `${guest.firstName || ""} ${guest.lastName || ""}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleCheckIn = async (guest) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/reception/check-in/${guest.reservation_id}`
            );
            setSelectedGuest(null);
            fetchPendingCheckIns();
        } catch (err) {
            console.error(err);
        }
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
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${
            theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
        }`}>
            {/* Customizer style overrides */}
            <style>{`
                .light-mode-high-contrast .text-slate-400 {
                    color: #475569 !important;
                }
                .light-mode-high-contrast .text-slate-500 {
                    color: #334155 !important;
                }
            `}</style>

            {/* HEADER */}
            <div className="mb-6">
                <h1 className={`text-3xl font-black tracking-tight ${theme.mode === "dark" ? "text-white" : "text-[#0c325e]"}`}>
                    Check-In Dashboard
                </h1>
                <p className={`text-xs md:text-sm font-medium mt-1 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Manage today’s guest arrivals
                </p>
            </div>

            {/* SEARCH */}
            <div className={`p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-3 border ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-800"
            }`}>
                <MdSearchIcon className="text-slate-400 text-2xl" />
                <input
                    className="w-full outline-none bg-transparent"
                    placeholder="Search guest name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuests.map((guest) => (
                    <div
                        key={guest.firstName + guest.lastName}
                        className={`rounded-2xl shadow-sm hover:shadow-md transition p-5 border ${
                            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-150 text-slate-800"
                        }`}
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>
                                    {guest.firstName} {guest.lastName}
                                </h2>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                                    Pending Check-in
                                </p>
                            </div>
                        </div>

                        {/* ROOMS */}
                        <div className="mt-4">
                            <p className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Rooms</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                {guest.rooms?.split(",").map((room, i) => (
                                    <span
                                        key={i}
                                        className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40 px-3 py-1 rounded-lg text-xs font-extrabold"
                                    >
                                        Room {room}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div className="mt-4 text-xs space-y-1">
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                Check-in: <b className={`${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{guest.checkIn}</b>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                Total Rooms: <b className={`${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{guest.totalRooms}</b>
                            </p>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => handleCheckIn(guest)}
                                className={`flex-1 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition ${currentAccent.bg}`}
                            >
                                <MdCheckCircleIcon />
                                Check In
                            </button>

                            <button
                                onClick={() => setSelectedGuest(guest)}
                                className={`flex-1 py-2.5 rounded-xl font-bold cursor-pointer transition ${
                                    theme.mode === "dark"
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredGuests.length === 0 && (
                <div className={`text-center mt-10 font-bold ${theme.mode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    No pending check-ins found
                </div>
            )}

            {/* MODAL */}
            {selectedGuest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-slate-800 border-slate-100">
                            <h2 className="text-lg font-black uppercase tracking-wide">Guest Details</h2>
                            <button onClick={() => setSelectedGuest(null)} className="cursor-pointer">
                                <MdCloseIcon size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Name:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>{selectedGuest.firstName} {selectedGuest.lastName}</span>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Rooms:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>{selectedGuest.rooms}</span>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Total:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>{selectedGuest.totalRooms}</span>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Check-In:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>{selectedGuest.checkIn}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => handleCheckIn(selectedGuest)}
                            className={`w-full mt-5 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black cursor-pointer transition ${currentAccent.bg}`}
                        >
                            <MdCheckCircleIcon />
                            Confirm Check-In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}