import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight, MdInfo } from "react-icons/md";
import { Eye, X, Check, Calendar, Users, CreditCard, Receipt, ShieldCheck, Landmark, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function BookingsManagement() {
    const [allBookings, setAllBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState("accommodation"); // "accommodation", "payments", "refunds", "policy"

    // Filter states
    const [dateFilter, setDateFilter] = useState("all"); // "all", "date", "month"
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

    // Theme state
    const [theme] = useState(() => {
        const saved = localStorage.getItem("saas_dashboard_theme");
        return saved ? JSON.parse(saved) : {
            mode: "light",
            accent: "indigo",
            cardStyle: "sleek",
            font: "sans"
        };
    });

    const currencyType = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

    const fetchBookings = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        else setRefreshing(true);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/roombook/bookings`);
            if (response.data.success) {
                setAllBookings(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            toast.error("Failed to fetch bookings list");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Fetch details of selected booking
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedBookingId) {
                setSelectedBookingDetails(null);
                return;
            }
            setLoadingDetails(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/roombook/booking/${selectedBookingId}`);
                if (response.data.success) {
                    setSelectedBookingDetails(response.data);
                } else {
                    toast.error("Failed to load booking details");
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
                toast.error("Error loading booking details");
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedBookingId]);

    // Statistics calculations
    const stats = useMemo(() => {
        const total = allBookings.length;
        const pending = allBookings.filter(b => b.status === "pending").length;
        const confirmed = allBookings.filter(b => b.status === "confirmed").length;
        const completed = allBookings.filter(b => b.status === "completed").length;
        const cancelled = allBookings.filter(b => b.status === "cancelled").length;

        // Total revenue from confirmed and completed bookings
        const revenue = allBookings
            .filter(b => b.status === "confirmed" || b.status === "completed")
            .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        return { total, pending, confirmed, completed, cancelled, revenue };
    }, [allBookings]);

    // Filtered bookings calculation
    const filteredBookings = useMemo(() => {
        const filtered = allBookings.filter((booking) => {
            // 1. Search term match (Guest Name, Email, Phone, Booking ID)
            const guestName = `${booking.Customer?.firstName || ""} ${booking.Customer?.lastName || ""}`.toLowerCase();
            const email = (booking.Customer?.email || "").toLowerCase();
            const phone = (booking.Customer?.phoneNumber || "").toLowerCase();
            const idStr = String(booking.id);
            const term = searchTerm.toLowerCase();

            const matchesSearch =
                guestName.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                idStr.includes(term);

            // 2. Status match
            const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

            // 3. Payment Status match
            const matchesPayment = paymentStatusFilter === "all" || booking.payment_status === paymentStatusFilter;

            // 4. Date match
            let matchesDate = true;
            if (dateFilter === "date") {
                // If checking in or out on this date, or if booking covers this date
                const checkInDates = booking.bookedRooms?.map(r => r.checkIn) || [];
                const checkOutDates = booking.bookedRooms?.map(r => r.checkOut) || [];
                const hasMatch = checkInDates.some(d => d === selectedDate) || checkOutDates.some(d => d === selectedDate);
                matchesDate = hasMatch;
            } else if (dateFilter === "month") {
                const [year, month] = selectedMonth.split("-");
                const monthPrefix = `${year}-${month}`;
                const checkInDates = booking.bookedRooms?.map(r => r.checkIn) || [];
                const hasMatch = checkInDates.some(d => d.startsWith(monthPrefix));
                matchesDate = hasMatch;
            }

            return matchesSearch && matchesStatus && matchesPayment && matchesDate;
        });

        // Get last 20 bookings (most recent first by createdAt)
        const sortedByRecent = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sortedByRecent.slice(0, 20);
    }, [allBookings, searchTerm, statusFilter, paymentStatusFilter, dateFilter, selectedDate, selectedMonth]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "confirmed":
                return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            case "completed":
                return "bg-green-500/10 text-green-500 border border-green-500/20";
            case "pending":
                return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
            case "cancelled":
                return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
            default:
                return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
        }
    };

    const getPaymentStatusBadgeClass = (pStatus) => {
        switch (pStatus) {
            case "FULLY_PAID":
                return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
            case "PARTIALLY_PAID":
                return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
            case "REFUND_PENDING":
                return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
            case "REFUNDED":
                return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
            case "PAY_AT_CHECKIN":
                return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
            default:
                return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const getStayDatesString = (booking) => {
        if (!booking.bookedRooms || booking.bookedRooms.length === 0) return "N/A";
        const checkIns = booking.bookedRooms.map(r => new Date(r.checkIn));
        const checkOuts = booking.bookedRooms.map(r => new Date(r.checkOut));
        const earliest = new Date(Math.min(...checkIns));
        const latest = new Date(Math.max(...checkOuts));
        return `${formatDate(earliest)} - ${formatDate(latest)}`;
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                        Bookings Register
                    </h1>
                    <p className="text-xs md:text-sm font-medium mt-1 text-slate-500">
                        Analyze booking files, check stays history, verify payments, refunds and hotel policies.
                    </p>
                </div>
                <button
                    onClick={() => fetchBookings(true)}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md transition duration-300 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
                </button>
            </div>

            {/* Quick Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Bookings</span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Pending Verify</span>
                    <h3 className="text-xl md:text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500">Confirmed Stays</span>
                    <h3 className="text-xl md:text-2xl font-black text-blue-600 mt-1">{stats.confirmed}</h3>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Cancelled Bookings</span>
                    <h3 className="text-xl md:text-2xl font-black text-rose-600 mt-1">{stats.cancelled}</h3>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Total Booked Value</span>
                    <h3 className="text-xl md:text-2xl font-black text-emerald-700 mt-1 truncate">
                        {currencyType} {stats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h3>
                </div>
            </div>

            {/* Filtering and Search Controls */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "all", label: "All Stays" },
                        { id: "date", label: "Filter by Date" },
                        { id: "month", label: "Filter by Month" },
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setDateFilter(btn.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                                dateFilter === btn.id
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 items-end">
                    {/* Date picker */}
                    {dateFilter === "date" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50"
                            />
                        </div>
                    )}

                    {/* Month picker */}
                    {dateFilter === "month" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Select Month</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50"
                            />
                        </div>
                    )}

                    {/* Search Field */}
                    <div className="flex flex-col gap-1.5 relative xl:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Search</label>
                        <div className="relative">
                            <MdSearch className="absolute left-3.5 top-2.5 text-slate-400 text-base" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, phone, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Booking Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Payment Status</label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="all">All Payment States</option>
                            <option value="FULLY_PAID">Fully Paid</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                            <option value="REFUND_PENDING">Refund Pending</option>
                            <option value="REFUNDED">Refunded</option>
                            <option value="PAY_AT_CHECKIN">Pay At Check-In</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <span className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-slate-500 text-xs font-bold">Loading bookings list...</p>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-left">
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">Guest Details</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">Stay Period</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider">Total Charge</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-650 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 text-xs font-black text-slate-900">
                                            #{booking.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-800">
                                                {booking.Customer ? `${booking.Customer.firstName} ${booking.Customer.lastName}` : "Unknown Guest"}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                {booking.Customer?.email || "No Email"} &middot; {booking.Customer?.phoneNumber || "No Phone"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600 font-semibold">
                                            {getStayDatesString(booking)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getPaymentStatusBadgeClass(booking.payment_status)}`}>
                                                {booking.payment_status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-900">
                                            {currencyType} {parseFloat(booking.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedBookingId(booking.id)}
                                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition shadow-2xs inline-flex items-center gap-1 text-xs font-bold cursor-pointer"
                                            >
                                                <Eye size={12} />
                                                <span>View details</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-slate-600 text-sm font-bold">No booking files match your selected filters</p>
                        <p className="text-slate-400 text-xs mt-1">Try resetting the date picker or search bar criteria</p>
                    </div>
                )}
            </div>

            {/* DETAILS VIEW SIDE DRAWER */}
            {selectedBookingId && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-slate-955/40 backdrop-blur-xs z-40 transition-opacity"
                        onClick={() => setSelectedBookingId(null)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slideLeft">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Admin Booking Audit</span>
                                <h3 className="text-base font-black flex items-center gap-2 mt-1">
                                    <Receipt size={18} className="text-blue-400" />
                                    Booking File #{selectedBookingId}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedBookingId(null)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Loading / Content Container */}
                        <div className="flex-grow flex flex-col overflow-hidden">
                            {loadingDetails || !selectedBookingDetails ? (
                                <div className="flex-grow flex flex-col items-center justify-center gap-3">
                                    <span className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                                    <p className="text-slate-500 text-xs font-bold">Retrieving audit logs...</p>
                                </div>
                            ) : (() => {
                                const details = selectedBookingDetails.data;
                                const activePolicy = selectedBookingDetails.policy;

                                return (
                                    <div className="flex-grow flex flex-col overflow-hidden h-full">
                                        {/* Status Header Block */}
                                        <div className="p-5 bg-slate-55 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Booking Status</span>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mt-1 w-max ${getStatusBadgeClass(details.status)}`}>
                                                    {details.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Payment Status</span>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mt-1 w-max ${getPaymentStatusBadgeClass(details.payment_status)}`}>
                                                    {details.payment_status?.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Grand Total Cost</span>
                                                <span className="text-xs font-black text-slate-850 mt-1.5">
                                                    {currencyType} {parseFloat(details.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Booking Registered</span>
                                                <span className="text-xs font-semibold text-slate-600 mt-1.5">
                                                    {formatDate(details.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tabs Navigation */}
                                        <div className="flex border-b border-slate-200 overflow-x-auto shrink-0 bg-slate-50/50">
                                            {[
                                                { id: "accommodation", label: "Stays & Guest" },
                                                { id: "payments", label: "Payments Audit" },
                                                { id: "refunds", label: `Refund History (${details.refunds?.length || 0})` }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveDetailTab(tab.id)}
                                                    className={`px-5 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap cursor-pointer transition ${
                                                        activeDetailTab === tab.id
                                                            ? "border-blue-600 text-blue-600"
                                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content Panel */}
                                        <div className="flex-grow p-6 overflow-y-auto space-y-6">
                                            {activeDetailTab === "accommodation" && (
                                                <div className="space-y-6">
                                                    {/* Customer Profile card */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">👤 Customer Profile</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                                                            <div>
                                                                <span className="text-[9px] text-slate-400 uppercase font-bold block">First Name</span>
                                                                <span className="text-xs font-bold text-slate-800 block mt-0.5">{details.Customer?.firstName || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Last Name</span>
                                                                <span className="text-xs font-bold text-slate-805 block mt-0.5">{details.Customer?.lastName || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Email Address</span>
                                                                <span className="text-xs font-semibold text-slate-700 block mt-0.5">{details.Customer?.email || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Phone Number</span>
                                                                <span className="text-xs font-semibold text-slate-700 block mt-0.5">{details.Customer?.phoneNumber || "N/A"}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rooms Allocations */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">🛌 Rooms Allocation Summary</h4>
                                                        <div className="space-y-3">
                                                            {details.bookedRooms && details.bookedRooms.length > 0 ? (
                                                                details.bookedRooms.map((room, idx) => (
                                                                    <div key={idx} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left shadow-2xs">
                                                                        <div>
                                                                            <span className="inline-block px-2 py-0.5 text-[9px] font-black text-blue-900 bg-blue-50 border border-blue-100 rounded uppercase">
                                                                                {room.board_type || "Room Only"}
                                                                            </span>
                                                                            <h5 className="text-xs font-black text-slate-808 mt-1.5">
                                                                                {room.Room?.roomType?.type || "Standard Room"} &middot; Room {room.Room?.room_number || "N/A"}
                                                                            </h5>
                                                                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                                                Period: {formatDate(room.checkIn)} - {formatDate(room.checkOut)}
                                                                            </p>
                                                                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                                                                Guests: {room.adults} Adults {room.kids > 0 ? ` & ${room.kids} Kids` : ""}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Nightly Price Value</span>
                                                                            <span className="text-xs font-black text-slate-900 block mt-1">
                                                                                {currencyType} {parseFloat(room.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                            </span>
                                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase mt-1.5 border tracking-wider bg-slate-50 text-slate-500 border-slate-200">
                                                                                Status: {room.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-slate-400 text-xs italic">No rooms allocated to this booking file.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Airport Pickup Details */}
                                                    {details.airportPickup && (
                                                        <div className="space-y-3">
                                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">🚖 Airport Pickup Service</h4>
                                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2 text-left text-slate-700">
                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                                                                    <div>
                                                                        <span className="text-[9px] text-slate-400 font-bold block">PICKUP DATE & TIME</span>
                                                                        <span className="font-bold text-slate-800">{formatDate(details.airportPickup.pickup_date)} &middot; {details.airportPickup.pickup_time}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[9px] text-slate-400 font-bold block">FLIGHT NUMBER</span>
                                                                        <span className="font-bold text-slate-800">{details.airportPickup.flight_number || "N/A"}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[9px] text-slate-400 font-bold block">PASSENGERS & BAGS</span>
                                                                        <span className="font-semibold text-slate-700">{details.airportPickup.passenger_count} Pax &middot; {details.airportPickup.baggage_count} Luggage</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[9px] text-slate-400 font-bold block">PICKUP FARE</span>
                                                                        <span className="font-black text-slate-900">{currencyType} {parseFloat(details.airportPickup.price || 0).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <span className="text-[9px] text-slate-400 font-bold block">PICKUP STATUS</span>
                                                                        <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded font-black text-[9px] uppercase tracking-wider mt-1">
                                                                            {details.airportPickup.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Personal Notes */}
                                                    {details.note && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">📝 Personal Request Notes</h4>
                                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left text-xs font-medium text-slate-650 italic">
                                                                "{details.note}"
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeDetailTab === "payments" && (
                                                <div className="space-y-6">
                                                    {/* Financial Summary */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                                                            <span className="text-[9px] uppercase font-bold text-slate-400">Total Charged Value</span>
                                                            <p className="text-lg font-black text-slate-800 mt-1">
                                                                {currencyType} {parseFloat(details.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-left">
                                                            <span className="text-[9px] uppercase font-bold text-emerald-600">Total Paid Amount</span>
                                                            <p className="text-lg font-black text-emerald-700 mt-1">
                                                                {currencyType} {(() => {
                                                                    const totalPaid = details.payments
                                                                        ? details.payments
                                                                            .filter(p => p.status === "success" || p.status === "paid")
                                                                            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                                                                        : 0;
                                                                    return totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Payments Transaction Logs */}
                                                    <div className="space-y-3 text-left">
                                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">💳 Transaction Logs</h4>
                                                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                                                            {details.payments && details.payments.length > 0 ? (
                                                                <table className="w-full">
                                                                    <thead>
                                                                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                                                            <th className="px-4 py-3 text-[10px] font-bold uppercase">Trans Ref</th>
                                                                            <th className="px-4 py-3 text-[10px] font-bold uppercase">Date</th>
                                                                            <th className="px-4 py-3 text-[10px] font-bold uppercase">Method</th>
                                                                            <th className="px-4 py-3 text-[10px] font-bold uppercase">Status</th>
                                                                            <th className="px-4 py-3 text-[10px] font-bold uppercase text-right">Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                                        {details.payments.map((pmt, idx) => (
                                                                            <tr key={idx} className="hover:bg-slate-50/40">
                                                                                <td className="px-4 py-3 font-mono font-bold text-slate-808">{pmt.transaction_ref || `TX-${pmt.id}`}</td>
                                                                                <td className="px-4 py-3 text-slate-400 font-semibold">{formatDate(pmt.payment_date || pmt.createdAt)}</td>
                                                                                <td className="px-4 py-3 text-slate-600 font-bold uppercase">{pmt.payment_method}</td>
                                                                                <td className="px-4 py-3">
                                                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                                                        pmt.status === "success" || pmt.status === "paid"
                                                                                            ? "bg-green-100 text-green-700"
                                                                                            : pmt.status === "pending"
                                                                                                ? "bg-amber-100 text-amber-750"
                                                                                                : "bg-rose-100 text-rose-700"
                                                                                    }`}>
                                                                                        {pmt.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-3 font-black text-slate-900 text-right">
                                                                                    {currencyType} {parseFloat(pmt.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <div className="p-8 text-center text-slate-400 text-xs italic">
                                                                    No payment transactions recorded for this booking file.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeDetailTab === "refunds" && (
                                                <div className="space-y-6 text-left">
                                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">💸 Refunds Ledger Logs</h4>
                                                    {details.refunds && details.refunds.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {details.refunds.map((refund, idx) => (
                                                                <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                                                                    <div className="flex justify-between items-start gap-4">
                                                                        <div>
                                                                            <span className="text-[9px] text-slate-400 uppercase font-black">REFUND ID & NUMBER</span>
                                                                            <h5 className="text-xs font-black text-slate-800 mt-0.5">#{refund.id} &middot; {refund.refund_no}</h5>
                                                                        </div>
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                                                            refund.status === "COMPLETED" || refund.status === "APPROVED"
                                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                                : refund.status === "PENDING"
                                                                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                        }`}>
                                                                            {refund.status}
                                                                        </span>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                                        <div>
                                                                            <span className="text-[9px] text-slate-400 font-bold block">REFUND AMOUNT</span>
                                                                            <span className="font-black text-slate-900 text-sm">{currencyType} {parseFloat(refund.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] text-slate-400 font-bold block">PAYMENT METHOD</span>
                                                                            <span className="font-bold text-slate-808 uppercase flex items-center gap-1.5 mt-0.5">
                                                                                <Landmark size={12} className="text-slate-400" />
                                                                                {refund.payment_method}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] text-slate-400 font-bold block">REQUEST DATE</span>
                                                                            <span className="font-semibold text-slate-600">{formatDate(refund.request_date)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] text-slate-400 font-bold block">PROCESSED BY</span>
                                                                            <span className="font-semibold text-slate-705">
                                                                                {refund.processedByStaff
                                                                                    ? `${refund.processedByStaff.name} (ID: ${refund.processedByStaff.staffId})`
                                                                                    : "Auto System / Pending"}
                                                                            </span>
                                                                        </div>
                                                                        {refund.reason && (
                                                                            <div className="col-span-2">
                                                                                <span className="text-[9px] text-slate-400 font-bold block">REASON FOR CANCELLATION</span>
                                                                                <p className="p-3 bg-white border border-slate-100 rounded-xl mt-1 text-slate-650 italic leading-relaxed text-[11px]">
                                                                                    "{refund.reason}"
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Refund items list */}
                                                                    {refund.items && refund.items.length > 0 && (
                                                                        <div className="pt-3 border-t border-slate-200/80">
                                                                            <span className="text-[9px] text-slate-400 font-bold block mb-2 uppercase">Refunded Items Breakdown</span>
                                                                            <div className="space-y-2">
                                                                                {refund.items.map((item, itemIdx) => (
                                                                                    <div key={itemIdx} className="flex justify-between items-center text-xs p-2.5 bg-white border border-slate-100 rounded-xl">
                                                                                        <div>
                                                                                            <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">
                                                                                                {item.item_type} &middot; ID {item.booked_room_id || item.airport_pickup_id}
                                                                                            </span>
                                                                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Original Item Cost: {currencyType} {parseFloat(item.price || 0).toLocaleString()}</p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <span className="text-[9px] text-slate-400 font-bold block">Refunded Value</span>
                                                                                            <span className="font-black text-rose-600">{currencyType} {parseFloat(item.refund_amount || 0).toLocaleString()}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 border border-slate-100 bg-slate-50/50 rounded-2xl text-center text-slate-400 text-xs italic">
                                                            No cancellation refund files exist for this booking.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
                            <button
                                onClick={() => setSelectedBookingId(null)}
                                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-xs transition duration-300 cursor-pointer"
                            >
                                Close Audit View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
