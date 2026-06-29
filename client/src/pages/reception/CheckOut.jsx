import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch as MdSearchIcon, MdLogout as MdLogoutIcon, MdClose as MdCloseIcon } from "react-icons/md";

export default function CheckOut() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [checkOutGuests, setCheckOutGuests] = useState([]);

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

    const fetchCheckOuts = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/reception/pending-checkouts`
            );
            setCheckOutGuests(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCheckOuts();
    }, []);

    const filteredGuests = checkOutGuests.filter((g) => {
        const name = `${g.firstName} ${g.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleCheckOut = async (guest) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/reception/bookings/${guest.booking_id}/checkout`
            );
            setSelectedGuest(null);
            fetchCheckOuts();
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
                    Check-Out Dashboard
                </h1>
                <p className={`text-xs md:text-sm font-medium mt-1 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Manage guest departures
                </p>
            </div>

            {/* SEARCH */}
            <div className={`p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-3 border ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-800"
            }`}>
                <MdSearchIcon className="text-slate-400 text-2xl" />
                <input
                    className="w-full outline-none bg-transparent"
                    placeholder="Search guest..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuests.map((guest) => (
                    <div
                        key={guest.booking_id}
                        className={`rounded-2xl shadow-sm transition p-5 border ${
                            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-150 text-slate-800"
                        }`}
                    >
                        <h2 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>
                            {guest.firstName} {guest.lastName}
                        </h2>

                        <p className={`text-xs font-semibold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"} mt-1`}>
                            Room {guest.roomNumber}
                        </p>

                        <div className="mt-4 text-xs space-y-1">
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                Check-out: <b className={`${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{guest.checkOut}</b>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                Nights: <b className={`${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{guest.nights}</b>
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedGuest(guest)}
                            className={`mt-4 w-full text-white py-2.5 rounded-xl font-bold cursor-pointer transition ${
                                theme.mode === "dark" ? currentAccent.bg : "bg-orange-500 hover:bg-orange-600"
                            }`}
                        >
                            Process Checkout
                        </button>
                    </div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredGuests.length === 0 && (
                <div className={`text-center mt-10 font-bold ${theme.mode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    No departures expected
                </div>
            )}

            {/* MODAL */}
            {selectedGuest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-slate-800 border-slate-100">
                            <h2 className="text-lg font-black uppercase tracking-wide">Confirm Check-Out</h2>
                            <button onClick={() => setSelectedGuest(null)} className="cursor-pointer">
                                <MdCloseIcon size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm mb-5">
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Name:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>{selectedGuest.firstName} {selectedGuest.lastName}</span>
                            </p>
                            <p className={`${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                <b>Room:</b> <span className={theme.mode === "dark" ? "text-white" : "text-slate-800"}>Room {selectedGuest.roomNumber}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => handleCheckOut(selectedGuest)}
                            className={`w-full text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black cursor-pointer transition ${
                                theme.mode === "dark" ? currentAccent.bg : "bg-orange-500 hover:bg-orange-600"
                            }`}
                        >
                            <MdLogoutIcon />
                            Confirm Check-Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}