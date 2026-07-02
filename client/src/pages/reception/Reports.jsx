import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { MdTrendingUp, MdAttachMoney, MdCardTravel, MdDateRange, MdRefresh, MdLocalPrintshop, MdBarChart } from "react-icons/md";
import { toast } from "react-hot-toast";

export default function Reports() {
    const [reportType, setReportType] = useState("daily"); // "daily" or "monthly"
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

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
        indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600", raw: "#6366f1" },
        emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600", raw: "#10b981" },
        violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-600", raw: "#8b5cf6" },
        amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-600", raw: "#f59e0b" },
        rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600", raw: "#f43f5e" },
        slate: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-700", raw: "#475569" },
    };

    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            let url = "";
            let params = {};

            if (reportType === "daily") {
                url = `${import.meta.env.VITE_BACKEND_URL}/reception/report/daily`;
                params = { date: selectedDate };
            } else {
                url = `${import.meta.env.VITE_BACKEND_URL}/reception/report/monthly`;
                params = { year: selectedYear, month: selectedMonth };
            }

            const response = await axios.get(url, { params });
            if (response.data.success) {
                setReportData(response.data.data);
            } else {
                toast.error("Failed to fetch report data.");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error("Error loading report details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType, selectedDate, selectedYear, selectedMonth]);

    const handlePrint = () => {
        window.print();
    };

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" }
    ];

    const getCardStyle = () => {
        let style = "p-6 transition-all duration-300 relative overflow-hidden ";
        if (theme.mode === "dark") {
            style += "bg-slate-900 text-slate-100 ";
        } else {
            style += "bg-white text-slate-800 ";
        }

        if (theme.cardStyle === "sleek") {
            style += "shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md hover:border-slate-200/60 dark:hover:border-slate-700/80 rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "border border-slate-200/80 dark:border-slate-800 shadow-none rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border border-white/20 dark:border-slate-800/40 shadow-lg rounded-3xl ";
        }
        return style;
    };

    return (
        <div className={`p-4 md:p-6 lg:p-8 space-y-6 print:p-0 print:bg-white print:text-black ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-900"} min-h-screen transition-colors duration-300`}>
            <style>{`
                @media print {
                    @page {
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        padding: 1.5cm 1cm !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-full {
                        width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2 !important;
                        color: black !important;
                    }
                }
            `}</style>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-2xl relative overflow-hidden no-print">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                        <MdBarChart className={currentAccent.text} size={28} />
                        Booking & Income Reports
                    </h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Generate and download hotel performance, reservation details, and revenue analysis reports.
                    </p>
                </div>

                {/* Print/Download Button */}
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition duration-200 cursor-pointer shadow-sm hover:scale-102 ${currentAccent.bg}`}
                    >
                        <MdLocalPrintshop size={16} /> Print / Save PDF
                    </button>
                    <button
                        onClick={fetchReport}
                        className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Reload Data"
                    >
                        <MdRefresh size={16} />
                    </button>
                </div>
            </div>

            {/* Filter controls tab row */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm no-print">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setReportType("daily")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${reportType === "daily"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                    >
                        Daily Report
                    </button>
                    <button
                        onClick={() => setReportType("monthly")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${reportType === "monthly"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                    >
                        Monthly Report
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {reportType === "daily" ? (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                            <MdDateRange className="text-slate-400" size={16} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                                {[0, 1, 2].map(i => {
                                    const y = new Date().getFullYear() - i;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Printable summary header (only visible during print) */}
            <div className="hidden print:block text-center space-y-2 pb-6 border-b border-slate-200">
                <h1 className="text-2xl font-black uppercase tracking-wide">BLUEBIRD HOTEL</h1>
                <h2 className="text-lg font-bold text-slate-700 capitalize">
                    {reportType} Bookings & Income Report
                </h2>
                <p className="text-xs text-slate-500">
                    Report period: {reportType === "daily" ? selectedDate : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`} | Generated on {new Date().toLocaleString()}
                </p>
            </div>

            {/* Loading state indicator */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Compiling live report stats...</p>
                </div>
            ) : reportData ? (
                <div className="space-y-6">
                    {/* KPI cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                                <MdCardTravel size={18} className={currentAccent.text} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                {reportData.totalBookings}
                            </h3>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Reservations filed in period</p>
                        </div>

                        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                                <MdAttachMoney size={18} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                Rs. {Math.round(reportData.totalRevenue).toLocaleString()}
                            </h3>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Gross income compiled</p>
                        </div>

                        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Average Rate (ADR)</span>
                                <MdTrendingUp size={18} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                Rs. {Math.round(reportData.avgRevenue).toLocaleString()}
                            </h3>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Average income per booking</p>
                        </div>

                        {reportType === "daily" ? (
                            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="text-xs font-bold uppercase tracking-wider">Today's Traffic</span>
                                    <MdDateRange size={18} className="text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                    {reportData.todayCheckIns + reportData.todayCheckOuts}
                                </h3>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                    {reportData.todayCheckIns} in &nbsp;·&nbsp; {reportData.todayCheckOuts} out
                                </p>
                            </div>
                        ) : (
                            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="text-xs font-bold uppercase tracking-wider">Confirmed vs Cancelled</span>
                                    <MdDateRange size={18} className="text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                    {reportData.confirmed} / {reportData.cancelled}
                                </h3>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Confirmed / Cancelled ratio</p>
                            </div>
                        )}
                    </div>

                    {/* Monthly chart breakdown (only visible on screen, not in print) */}
                    {reportType === "monthly" && reportData.dailyBreakdown?.length > 0 && (
                        <div className={`${getCardStyle()} no-print`}>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white mb-4">Monthly Income Curve</h4>
                            <div className="h-44 flex items-end gap-1.5 border-b border-slate-250 dark:border-slate-800 pb-2">
                                {reportData.dailyBreakdown.map((day, idx) => {
                                    const maxRev = Math.max(...reportData.dailyBreakdown.map(d => d.revenue)) || 1;
                                    const heightPct = `${Math.round((day.revenue / maxRev) * 100)}%`;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            <div
                                                style={{ height: heightPct }}
                                                className={`w-full min-h-[4px] rounded-t transition-all ${currentAccent.bg}`}
                                            />
                                            <span className="text-[8px] text-slate-600 dark:text-slate-400 scale-90 font-bold">
                                                {new Date(day.date).getDate()}
                                            </span>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 dark:bg-slate-700 text-white text-[9px] p-1.5 rounded shadow-lg z-20 whitespace-nowrap">
                                                <p className="font-bold">Day {new Date(day.date).getDate()}</p>
                                                <p className="text-emerald-400 font-black">Rs. {Number(day.revenue).toLocaleString()}</p>
                                                <p>{day.bookings} bookings</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bookings table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden print-full">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">Reservations File</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-400">
                                {reportData.bookings?.length || 0} entries
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left">Booking ID</th>
                                        <th className="px-4 py-3 text-left">Guest Name</th>
                                        <th className="px-4 py-3 text-left">Rooms</th>
                                        <th className="px-4 py-3 text-left">Check-In</th>
                                        <th className="px-4 py-3 text-left">Check-Out</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {reportData.bookings?.length > 0 ? (
                                        reportData.bookings.map((booking) => {
                                            // Status resolution
                                            const isCheckedIn = booking.roomStatuses?.includes('checked_in');
                                            const isCheckedOut = booking.roomStatuses?.includes('checked_out');
                                            const isCancelled = booking.roomStatuses?.includes('cancelled') || booking.bookingStatus === 'cancelled';
                                            const isNoShow = booking.bookingStatus === 'no_show' || booking.bookingStatus === 'no-show';

                                            let badgeBg, badgeText;
                                            if (isCheckedIn) {
                                                badgeBg = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30";
                                                badgeText = "Checked-in";
                                            } else if (isCheckedOut) {
                                                badgeBg = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
                                                badgeText = "Checked-out";
                                            } else if (isCancelled) {
                                                badgeBg = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30";
                                                badgeText = "Cancelled";
                                            } else if (isNoShow) {
                                                badgeBg = "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-950/30";
                                                badgeText = "No-show";
                                            } else {
                                                badgeBg = "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950/30";
                                                badgeText = "Confirmed";
                                            }

                                            return (
                                                <tr key={booking.reservation_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                                        #{booking.reservation_id}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                                        {booking.firstName} {booking.lastName}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {booking.rooms?.split(",").map((r, i) => (
                                                                <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                                                    R-{r.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`${badgeBg} px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider`}>
                                                            {badgeText}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100">
                                                        Rs. {Number(booking.total_price || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-12 text-center text-slate-400 font-medium">
                                                No reservations recorded for this report range.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 text-slate-400 text-xs font-bold shadow-xs">
                    No report data compiled yet.
                </div>
            )}
        </div>
    );
}
