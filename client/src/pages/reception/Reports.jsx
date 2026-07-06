import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { MdTrendingUp, MdAttachMoney, MdCardTravel, MdDateRange, MdRefresh, MdLocalPrintshop, MdBarChart } from "react-icons/md";
import { toast } from "react-hot-toast";
import Logo from "../../assets/bluebird logo.png";

export default function Reports() {
    const [reportType, setReportType] = useState("daily"); // "daily", "monthly", or "custom"
    const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" or "report"
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split("T")[0]);
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
            } else if (reportType === "custom") {
                url = `${import.meta.env.VITE_BACKEND_URL}/reception/report/range`;
                params = { startDate: customStartDate, endDate: customEndDate };
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
    }, [reportType, selectedDate, customStartDate, customEndDate, selectedYear, selectedMonth]);

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
        <div className={`p-4 md:p-6 lg:p-8 space-y-6 print:p-0 print:bg-white print:text-black ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-900"} min-h-screen max-h-screen overflow-y-auto transition-colors duration-300`}>
            <style>{`
                @media print {
                    @page {
                        margin: 1.2cm 1cm !important;
                    }
                    /* Hide scrollbars from all elements when printing */
                    ::-webkit-scrollbar {
                        display: none !important;
                    }
                    * {
                        scrollbar-width: none !important;
                        -ms-overflow-style: none !important;
                    }
                    html, body, #root, div, section, main, aside, article, header, footer {
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-family: 'Times New Roman', Georgia, serif !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Reset container scroll height for clean printing across pages */
                    div.min-h-screen {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        padding: 0 !important;
                    }
                    table.invoice-style-table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                        margin-top: 15px !important;
                        margin-bottom: 25px !important;
                    }
                    table.invoice-style-table.details-table {
                        table-layout: fixed !important;
                    }
                    table.invoice-style-table th {
                        border-top: 1.5px solid #000 !important;
                        border-bottom: 1.5px solid #000 !important;
                        border-left: none !important;
                        border-right: none !important;
                        padding: 8px 12px !important;
                        text-align: left !important;
                        font-weight: bold !important;
                        font-size: 10px !important;
                        text-transform: uppercase !important;
                        color: black !important;
                    }
                    table.invoice-style-table td {
                        border-bottom: 1px solid #e2e8f0 !important;
                        border-left: none !important;
                        border-right: none !important;
                        padding: 8px 12px !important;
                        font-size: 10px !important;
                        color: black !important;
                        word-break: break-word !important;
                    }
                    table.invoice-style-table tr:last-child td {
                        border-bottom: 1.5px solid #000 !important;
                    }
                    
                    /* Column widths for details tables to align perfectly and prevent wrapping */
                    table.invoice-style-table.details-table th:nth-child(1), table.invoice-style-table.details-table td:nth-child(1) { width: 13% !important; font-family: monospace !important; }
                    table.invoice-style-table.details-table th:nth-child(2), table.invoice-style-table.details-table td:nth-child(2) { width: 16% !important; }
                    table.invoice-style-table.details-table th:nth-child(3), table.invoice-style-table.details-table td:nth-child(3) { width: 17% !important; }
                    table.invoice-style-table.details-table th:nth-child(4), table.invoice-style-table.details-table td:nth-child(4) { width: 12% !important; }
                    table.invoice-style-table.details-table th:nth-child(5), table.invoice-style-table.details-table td:nth-child(5) { width: 12% !important; }
                    table.invoice-style-table.details-table th:nth-child(6), table.invoice-style-table.details-table td:nth-child(6) { width: 14% !important; text-align: center !important; white-space: nowrap !important; }
                    table.invoice-style-table.details-table th:nth-child(7), table.invoice-style-table.details-table td:nth-child(7) { width: 16% !important; text-align: right !important; white-space: nowrap !important; }
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
                        onClick={() => setViewMode(viewMode === "dashboard" ? "report" : "dashboard")}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl transition duration-200 cursor-pointer shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {viewMode === "dashboard" ? "👁️ View Report" : "📊 View Dashboard"}
                    </button>
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
                    <button
                        onClick={() => setReportType("custom")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${reportType === "custom"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                    >
                        Custom Range
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
                    ) : reportType === "custom" ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                                <span className="text-[10px] uppercase font-black text-slate-400">From</span>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                                <span className="text-[10px] uppercase font-black text-slate-400">To</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 cursor-pointer"
                                />
                            </div>
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



            {/* Loading state indicator */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Compiling live report stats...</p>
                </div>
            ) : reportData ? (
                <div className="space-y-6">
                    {/* Render Interactive Dashboard View on screen */}
                    {viewMode === "dashboard" && (
                        <div className="space-y-6 no-print">
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

                        {reportType === "daily" || reportType === "custom" ? (
                            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="text-xs font-bold uppercase tracking-wider">{reportType === "daily" ? "Today's Traffic" : "Period Traffic"}</span>
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

                    {/* Revenue Stream Breakdown Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
                            <span className="text-2xl p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">🏨</span>
                            <div>
                                <span className="text-[10px] uppercase font-black text-slate-500 block">Room Bookings</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5">
                                    Rs. {Math.round(reportData.roomRevenue || 0).toLocaleString()}
                                </span>
                                <span className="text-[9px] text-slate-650 dark:text-slate-400 font-bold block">{reportData.roomBookingsCount || 0} reservations filed</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
                            <span className="text-2xl p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl">🚗</span>
                            <div>
                                <span className="text-[10px] uppercase font-black text-slate-500 block">Vehicle Hires</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5">
                                    Rs. {Math.round(reportData.vehicleRevenue || 0).toLocaleString()}
                                </span>
                                <span className="text-[9px] text-slate-650 dark:text-slate-400 font-bold block">{reportData.vehicleBookingsCount || 0} rentals recorded</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
                            <span className="text-2xl p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">⛰️</span>
                            <div>
                                <span className="text-[10px] uppercase font-black text-slate-500 block">Tour Packages</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5">
                                    Rs. {Math.round(reportData.tourRevenue || 0).toLocaleString()}
                                </span>
                                <span className="text-[9px] text-slate-650 dark:text-slate-400 font-bold block">{reportData.tourBookingsCount || 0} bookings handled</span>
                            </div>
                        </div>
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

                    {/* Room Reservations table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden print-full">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">Room Reservations File</h4>
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

                    {/* Vehicle Bookings Table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden print-full">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">Vehicle Rentals File</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-400">
                                {reportData.vehicleBookings?.length || 0} entries
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left">Booking No</th>
                                        <th className="px-4 py-3 text-left">Guest Name</th>
                                        <th className="px-4 py-3 text-left">Vehicle Details</th>
                                        <th className="px-4 py-3 text-left">Pickup Date</th>
                                        <th className="px-4 py-3 text-left">Return Date</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {reportData.vehicleBookings?.length > 0 ? (
                                        reportData.vehicleBookings.map((b) => {
                                            let badgeBg, badgeText;
                                            const status = b.bookingStatus?.toLowerCase();
                                            if (status === "completed" || status === "balance_paid") {
                                                badgeBg = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30";
                                                badgeText = "Completed";
                                            } else if (status === "ongoing") {
                                                badgeBg = "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950/30";
                                                badgeText = "Ongoing";
                                            } else if (status === "confirmed" || status === "driver_assigned") {
                                                badgeBg = "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/30";
                                                badgeText = "Confirmed";
                                            } else if (status === "cancelled") {
                                                badgeBg = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30";
                                                badgeText = "Cancelled";
                                            } else {
                                                badgeBg = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/30";
                                                badgeText = "Awaiting Payment";
                                            }

                                            return (
                                                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                                        {b.bookingNo}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                                        {b.firstName || b.lastName ? `${b.firstName || ""} ${b.lastName || ""}` : "Walk-in Guest"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-650 dark:text-slate-350 font-bold">
                                                        {b.brand && b.model ? `${b.brand} ${b.model}` : "Custom Vehicle"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {b.pickupDatetime ? new Date(b.pickupDatetime).toLocaleString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {b.returnDatetime ? new Date(b.returnDatetime).toLocaleString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`${badgeBg} px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider`}>
                                                            {badgeText}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="font-black text-slate-800 dark:text-slate-100">Rs. {Number(b.totalPayable || 0).toLocaleString()}</div>
                                                        <div className="text-[9px] text-slate-500 font-bold mt-0.5">Paid: Rs. {Number(b.depositAmount || 0).toLocaleString()}</div>
                                                        <div className="text-[9px] text-slate-650 dark:text-slate-400 font-bold">Bal: Rs. {Number(b.balanceAmount || 0).toLocaleString()}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-12 text-center text-slate-400 font-medium">
                                                No vehicle rentals recorded for this report range.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tour Bookings Table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden print-full">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">Tour Bookings File</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-400">
                                {reportData.tourBookings?.length || 0} entries
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left">Booking Ref</th>
                                        <th className="px-4 py-3 text-left">Guest Name</th>
                                        <th className="px-4 py-3 text-left">Tour Title</th>
                                        <th className="px-4 py-3 text-left">Start Date</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {reportData.tourBookings?.length > 0 ? (
                                        reportData.tourBookings.map((b) => {
                                            let badgeBg, badgeText;
                                            const status = b.bookingStatus?.toLowerCase();
                                            if (status === "completed") {
                                                badgeBg = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30";
                                                badgeText = "Completed";
                                            } else if (status === "half_paid") {
                                                badgeBg = "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950/30";
                                                badgeText = "Half Paid";
                                            } else if (status === "cancelled" || status === "rejected") {
                                                badgeBg = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30";
                                                badgeText = "Cancelled";
                                            } else {
                                                badgeBg = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/30";
                                                badgeText = "Awaiting Deposit";
                                            }

                                            return (
                                                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                                        {b.bookingRef}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                                        {b.firstName || b.lastName ? `${b.firstName || ""} ${b.lastName || ""}` : "Guest"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-650 dark:text-slate-350 font-bold">
                                                        {b.tourTitle || "Custom Tour"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {b.tourStartDate ? new Date(b.tourStartDate).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`${badgeBg} px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider`}>
                                                            {badgeText}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="font-black text-slate-800 dark:text-slate-100">Rs. {Number(b.totalAmount || 0).toLocaleString()}</div>
                                                        <div className="text-[9px] text-slate-500 font-bold mt-0.5">Paid: Rs. {Number(b.depositAmount || 0).toLocaleString()}</div>
                                                        <div className="text-[9px] text-slate-650 dark:text-slate-400 font-bold">Bal: Rs. {Number(b.remainingAmount || 0).toLocaleString()}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-medium">
                                                No tour bookings recorded for this report range.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 text-slate-400 text-xs font-bold shadow-xs">
                    No report data compiled yet.
                </div>
            )}

            {/* Print-only Invoice style report */}
            {reportData && (
                <div className={`${viewMode === "report" ? "block bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto mb-10" : "hidden"} print:block print:border-none print:shadow-none print:p-0 print:max-w-none font-serif text-black leading-relaxed`}>
                    {/* Invoice Letterhead */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <img src={Logo} alt="BlueBird Logo" className="h-10 w-auto object-contain" />
                                <span className="text-3xl font-serif tracking-wide text-[#006838] font-black">bluebird</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 mt-1 font-sans">Hotels & Travels (PVT) LTD</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 font-serif">
                                {reportType === "daily" ? "Daily Bookings & Income Report" : reportType === "custom" ? "Custom Range Bookings & Income Report" : "Monthly Bookings & Income Report"}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-sans mt-1">
                                Report period: {reportType === "daily" ? selectedDate : reportType === "custom" ? `${customStartDate} to ${customEndDate}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`} | Generated on {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Metadata details grid */}
                    <div className="grid grid-cols-2 gap-8 text-xs font-sans pb-4">
                        <div>
                            <p className="font-bold text-slate-900">HOTEL DETAILS:</p>
                            <p className="mt-1">BlueBird Hotels & Travels</p>
                            <p>Colombo, Sri Lanka</p>
                            <p>Phone: +94 77 123 4567</p>
                            <p>Support: +94701950195</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-bold">Report Type:</span> {reportType === "daily" ? "Daily Performance" : reportType === "custom" ? "Custom Range Performance" : "Monthly Performance"}</p>
                            <p className="mt-1"><span className="font-bold">Period:</span> {reportType === "daily" ? selectedDate : reportType === "custom" ? `${customStartDate} to ${customEndDate}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}</p>
                            <p className="mt-1"><span className="font-bold">Status:</span> Live Compiled</p>
                            <p className="mt-1"><span className="font-bold">Generated By:</span> Reception Desk</p>
                        </div>
                    </div>

                    {/* Summary Rates Block (Like Room Rates in Invoice) */}
                    <div className="mt-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">SUMMARY STREAM REVENUES:</h3>
                        <table className="w-full mt-2 invoice-style-table font-sans">
                            <thead>
                                <tr>
                                    <th className="text-left py-2 border-y border-slate-900">SERVICE</th>
                                    <th className="text-center py-2 border-y border-slate-900 font-bold">BOOKINGS</th>
                                    <th className="text-right py-2 border-y border-slate-900">REVENUE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-2 border-b border-slate-200">Room Reservations</td>
                                    <td className="text-center py-2 border-b border-slate-200 font-bold">{reportData.roomBookingsCount || 0}</td>
                                    <td className="text-right py-2 border-b border-slate-200 font-bold">LKR {Number(reportData.roomRevenue || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 border-b border-slate-200">Vehicle Rentals</td>
                                    <td className="text-center py-2 border-b border-slate-200 font-bold">{reportData.vehicleBookingsCount || 0}</td>
                                    <td className="text-right py-2 border-b border-slate-200 font-bold">LKR {Number(reportData.vehicleRevenue || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 border-b border-slate-200">Tour Package Bookings</td>
                                    <td className="text-center py-2 border-b border-slate-200 font-bold">{reportData.tourBookingsCount || 0}</td>
                                    <td className="text-right py-2 border-b border-slate-200 font-bold">LKR {Number(reportData.tourRevenue || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Summary Totals Box */}
                        <div className="flex justify-end mt-4">
                            <div className="w-72 border border-slate-300 p-4 bg-white font-sans">
                                <div className="flex justify-between text-xs py-1">
                                    <span className="font-bold text-slate-700">Total Bookings:</span>
                                    <span className="font-bold text-slate-900">{reportData.totalBookings}</span>
                                </div>
                                <div className="border-t border-slate-300 my-2"></div>
                                <div className="flex justify-between text-sm py-1 font-black">
                                    <span className="text-slate-800">TOTAL REVENUE:</span>
                                    <span>LKR {Number(reportData.totalRevenue || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section breakdown tables */}
                    <div className="mt-10 page-break-before">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 font-sans border-b border-slate-400 pb-1">🏨 ROOM RESERVATIONS DETAIL:</h3>
                        <table className="w-full invoice-style-table details-table font-sans">
                            <thead>
                                <tr>
                                    <th style={{ width: "15%" }}>Booking ID</th>
                                    <th style={{ width: "20%" }}>Guest Name</th>
                                    <th style={{ width: "15%" }}>Rooms</th>
                                    <th style={{ width: "15%" }}>Check-In</th>
                                    <th style={{ width: "15%" }}>Check-Out</th>
                                    <th style={{ width: "10%", textAlign: "center" }}>Status</th>
                                    <th style={{ width: "10%", textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.bookings?.length > 0 ? (
                                    reportData.bookings.map((booking) => {
                                        const isCheckedIn = booking.roomStatuses?.includes('checked_in');
                                        const isCheckedOut = booking.roomStatuses?.includes('checked_out');
                                        const isCancelled = booking.roomStatuses?.includes('cancelled') || booking.bookingStatus === 'cancelled';
                                        const isNoShow = booking.bookingStatus === 'no_show' || booking.bookingStatus === 'no-show';
                                        const statusText = isCheckedIn ? "Checked-in" : isCheckedOut ? "Checked-out" : isCancelled ? "Cancelled" : isNoShow ? "No-show" : "Confirmed";

                                        return (
                                            <tr key={booking.reservation_id}>
                                                <td>#{booking.reservation_id}</td>
                                                <td className="font-semibold">{booking.firstName} {booking.lastName}</td>
                                                <td>
                                                    {booking.rooms?.split(",").map(r => `R-${r.trim()}`).join(", ")}
                                                </td>
                                                <td>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "—"}</td>
                                                <td>{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "—"}</td>
                                                <td className="text-center font-bold">{statusText.toUpperCase()}</td>
                                                <td className="text-right font-bold">LKR {Number(booking.total_price || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-slate-400">No room reservations recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 page-break-inside-avoid">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 font-sans border-b border-slate-400 pb-1">🚗 VEHICLE HIRE DETAIL:</h3>
                        <table className="w-full invoice-style-table details-table font-sans">
                            <thead>
                                <tr>
                                    <th style={{ width: "18%" }}>Booking No</th>
                                    <th style={{ width: "18%" }}>Guest Name</th>
                                    <th style={{ width: "22%" }}>Vehicle Details</th>
                                    <th style={{ width: "14%" }}>Pickup Date</th>
                                    <th style={{ width: "14%" }}>Return Date</th>
                                    <th style={{ width: "8%", textAlign: "center" }}>Status</th>
                                    <th style={{ width: "6%", textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.vehicleBookings?.length > 0 ? (
                                    reportData.vehicleBookings.map((b) => {
                                        const status = b.bookingStatus?.toLowerCase();
                                        const statusText = (status === "completed" || status === "balance_paid") ? "Completed" : status === "ongoing" ? "Ongoing" : (status === "confirmed" || status === "driver_assigned") ? "Confirmed" : status === "cancelled" ? "Cancelled" : "Pending";

                                        return (
                                            <tr key={b.id}>
                                                <td>{b.bookingNo}</td>
                                                <td className="font-semibold">{b.firstName || b.lastName ? `${b.firstName || ""} ${b.lastName || ""}` : "Walk-in Guest"}</td>
                                                <td>{b.brand && b.model ? `${b.brand} ${b.model}` : "Custom Vehicle"}</td>
                                                <td>{b.pickupDatetime ? new Date(b.pickupDatetime).toLocaleDateString() : "—"}</td>
                                                <td>{b.returnDatetime ? new Date(b.returnDatetime).toLocaleDateString() : "—"}</td>
                                                <td className="text-center font-bold">{statusText.toUpperCase()}</td>
                                                <td className="text-right">
                                                    <div className="font-bold">LKR {Number(b.totalPayable || 0).toFixed(2)}</div>
                                                    <div className="text-[8px] text-slate-500">Paid: LKR {Number(b.depositAmount || 0).toFixed(2)}</div>
                                                    <div className="text-[8px] text-slate-700 font-bold">Bal: LKR {Number(b.balanceAmount || 0).toFixed(2)}</div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-slate-400">No vehicle rentals recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 page-break-inside-avoid">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 font-sans border-b border-slate-400 pb-1">⛰️ TOUR PACKAGES DETAIL:</h3>
                        <table className="w-full invoice-style-table details-table font-sans">
                            <thead>
                                <tr>
                                    <th style={{ width: "18%" }}>Booking Ref</th>
                                    <th style={{ width: "18%" }}>Guest Name</th>
                                    <th style={{ width: "22%" }}>Tour Title</th>
                                    <th style={{ width: "14%" }}>Start Date</th>
                                    <th style={{ width: "14%" }}>End Date</th>
                                    <th style={{ width: "8%", textAlign: "center" }}>Status</th>
                                    <th style={{ width: "6%", textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.tourBookings?.length > 0 ? (
                                    reportData.tourBookings.map((b) => {
                                        const status = b.bookingStatus?.toLowerCase();
                                        const statusText = status === "completed" ? "Completed" : status === "half_paid" ? "Half Paid" : (status === "cancelled" || status === "rejected") ? "Cancelled" : "Pending";

                                        return (
                                            <tr key={b.id}>
                                                <td>{b.bookingRef}</td>
                                                <td className="font-semibold">{b.firstName || b.lastName ? `${b.firstName || ""} ${b.lastName || ""}` : "Guest"}</td>
                                                <td>{b.tourTitle || "Custom Tour"}</td>
                                                <td>{b.tourStartDate ? new Date(b.tourStartDate).toLocaleDateString() : "—"}</td>
                                                <td>—</td>
                                                <td className="text-center font-bold">{statusText.toUpperCase()}</td>
                                                <td className="text-right">
                                                    <div className="font-bold">LKR {Number(b.totalAmount || 0).toFixed(2)}</div>
                                                    <div className="text-[8px] text-slate-500">Paid: LKR {Number(b.depositAmount || 0).toFixed(2)}</div>
                                                    <div className="text-[8px] text-slate-700 font-bold">Bal: LKR {Number(b.remainingAmount || 0).toFixed(2)}</div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-slate-400">No tour bookings recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Invoice style footer */}
                    <div className="text-center mt-12 pt-6 border-t border-slate-350 text-xs font-serif text-slate-700">
                        <p className="font-bold italic">We thank you for compiled reports and hope to see you again in the future....</p>
                        <p className="mt-1 font-sans text-[10px]">Support Contact: +94701950195</p>
                    </div>
                </div>
            )}
        </div>
    );
}
