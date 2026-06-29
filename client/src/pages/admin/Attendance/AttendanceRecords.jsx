import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTimes, FaQrcode, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaUserClock } from "react-icons/fa";
import { getAttendanceRecords } from "../../../utils/attendanceService";
import Loader from "../../../components/Loader";
import toast from "react-hot-toast";

export default function AttendanceRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Fetch records
    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit,
                search: searchTerm.trim() || undefined,
                status: statusFilter !== "All" ? statusFilter : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };

            const response = await getAttendanceRecords(params);
            if (response.data?.success) {
                setRecords(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.totalItems || 0);
            }
        } catch (error) {
            console.error("Error loading attendance records:", error);
            toast.error("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    };

    // Reload when search, filters, or page changes
    useEffect(() => {
        fetchRecords();
    }, [currentPage, statusFilter, startDate, endDate]);

    // Search submit handler (triggers refetch)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchRecords();
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

    // Format display time
    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format display duration
    const formatDuration = (minutes) => {
        if (minutes === null || minutes === undefined || minutes === 0) return "-";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <FaUserClock className="text-blue-600" /> Staff Attendance Logs
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View employee check-in and check-out times, late tracking, and calculated work hours.
                    </p>
                </div>
                <div>
                    <Link
                        to="/attendance"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 transition-all duration-250 shadow-md hover:shadow-lg active:scale-98"
                    >
                        <FaQrcode className="text-sm animate-pulse" /> Open Scanner App
                    </Link>
                </div>
            </div>

            {/* Filters panel card */}
            <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100/80 mb-6">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {/* Search Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Staff</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name or Staff ID..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3.5 top-4 text-slate-400 text-sm" />
                            </div>
                        </div>

                        {/* Status Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</label>
                            <select
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Late">Late</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">From Date</label>
                            <input
                                type="date"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 cursor-pointer"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">To Date</label>
                            <input
                                type="date"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 cursor-pointer"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 text-xs transition-colors duration-150 cursor-pointer"
                        >
                            <FaTimes className="text-xs" /> Reset Filters
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 text-xs transition-colors duration-150 cursor-pointer"
                        >
                            <FaSearch className="text-xs" /> Apply Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Logs Table Card */}
            <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Attendance Log Database</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Found {totalItems} total records</p>
                    </div>
                </div>

                <div>
                    {loading ? (
                        <div className="py-20">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table view */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                                            <th className="pb-4 pt-2">STAFF MEMBER</th>
                                            <th className="pb-4 pt-2">DATE</th>
                                            <th className="pb-4 pt-2">CHECK IN</th>
                                            <th className="pb-4 pt-2">CHECK OUT</th>
                                            <th className="pb-4 pt-2">LATE MINUTES</th>
                                            <th className="pb-4 pt-2">WORKED TIME</th>
                                            <th className="pb-4 pt-2 text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {records.length > 0 ? (
                                            records.map((record, index) => (
                                                <tr key={index} className="hover:bg-slate-50/70 transition-colors duration-150">
                                                    {/* Avatar & Name */}
                                                    <td className="py-4.5 pr-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 leading-none">
                                                                {record.StaffMember?.name || "Unknown Staff"}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-1">{record.staffId}</p>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Date */}
                                                    <td className="py-4.5 text-sm font-medium text-slate-600">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FaCalendarAlt className="text-slate-400 text-xs" />
                                                            {record.attendanceDate}
                                                        </span>
                                                    </td>

                                                    {/* Check In */}
                                                    <td className="py-4.5 text-sm text-slate-600 font-semibold">
                                                        {formatTime(record.checkInTime)}
                                                    </td>

                                                    {/* Check Out */}
                                                    <td className="py-4.5 text-sm text-slate-600 font-semibold">
                                                        {formatTime(record.checkOutTime)}
                                                    </td>

                                                    {/* Late Minutes */}
                                                    <td className="py-4.5 text-sm">
                                                        {record.lateMinutes > 0 ? (
                                                            <span className="text-amber-600 font-semibold">{record.lateMinutes} mins</span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Worked Time */}
                                                    <td className="py-4.5 text-sm">
                                                        <span className="text-indigo-600 font-bold">
                                                            {formatDuration(record.workingMinutes)}
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-4.5 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                                                            record.status === "Present"
                                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                                                : record.status === "Late"
                                                                ? "bg-amber-50 border-amber-100 text-amber-700"
                                                                : "bg-rose-50 border-rose-100 text-rose-700"
                                                        }`}>
                                                            {record.status === "Present" && <FaCheckCircle className="text-[10px]" />}
                                                            {record.status === "Late" && <FaExclamationCircle className="text-[10px]" />}
                                                            {record.status === "Absent" && <FaTimes className="text-[10px]" />}
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-sm font-semibold text-slate-400">
                                                    No attendance logs found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
                                    <div className="text-xs font-semibold text-slate-400">
                                        Showing page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <FaArrowLeft className="text-xs" />
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                                    currentPage === p
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                        : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                                        >
                                            <FaArrowRight className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
