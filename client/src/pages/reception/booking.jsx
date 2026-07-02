import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight, MdList, MdAdd, MdClose } from "react-icons/md";
import { Eye, FileText, Receipt, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import NewBookingFlow from "./NewBookingFlow";

export default function Booking() {
    const [activeTab, setActiveTab] = useState("list");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allBookings, setAllBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

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
                                raw: res,
                                rawBookedRoom: br
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

    // Cancel room booking reservation
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this room booking?\nThis will mark the room booking status as Cancelled.")) {
            return;
        }
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/roombook/booking/${bookingId}`, { status: "cancelled" });
            if (res.data.success || res.data.message === "Updated") {
                toast.success("Room booking reservation cancelled successfully!");
                fetchBookings();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to cancel room booking.");
        }
    };

    // Print Invoice layout for Room stays
    const handlePrintInvoice = (booking) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print invoices.");
            return;
        }
        
        const customer = booking.raw?.Customer || {};
        const guestName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || booking.guestName;
        const checkIn = booking.checkInDate || booking.rawBookedRoom?.checkIn;
        const checkOut = booking.checkOutDate || booking.rawBookedRoom?.checkOut;
        const roomNo = booking.roomNumber || booking.rawBookedRoom?.Room?.roomNumber || 'N/A';
        const roomType = booking.roomType || 'Standard';
        const priceText = booking.price || `Rs. ${booking.raw?.total_price || 0}`;
        const bookingNo = booking.raw?.bookingNo || `RES-${booking.raw?.id || 'N/A'}`;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Stays Invoice - ${bookingNo}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: 1px; }
                    .title { font-size: 28px; font-weight: 850; text-align: right; color: #1e293b; }
                    .details { display: flex; justify-content: space-between; margin-top: 30px; }
                    .section-title { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                    .info-block { flex: 1; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
                    .invoice-table th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; }
                    .invoice-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
                    .totals { width: 40%; margin-left: auto; margin-top: 30px; font-size: 13px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-weight: 900; font-size: 16px; color: #1e3a8a; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
                    .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">BLUEBIRD HOTELS</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Negombo Shoreline Resort, Sri Lanka</div>
                    </div>
                    <div>
                        <div class="title">HOTEL STAY INVOICE</div>
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-align: right; margin-top: 4px;"># ${bookingNo}</div>
                    </div>
                </div>
                
                <div class="details">
                    <div class="info-block">
                        <div class="section-title">Billed To</div>
                        <div style="font-weight: bold; font-size: 15px; color: #1e293b;">${guestName}</div>
                        <div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${customer.email || 'N/A'}</div>
                        <div style="font-size: 12px; color: #475569;">Phone: ${customer.phoneNumber || booking.phone || 'N/A'}</div>
                    </div>
                    <div class="info-block" style="text-align: right;">
                        <div class="section-title">Stay Information</div>
                        <div style="font-size: 12px; color: #475569;">Check-In: ${checkIn}</div>
                        <div style="font-size: 12px; color: #475569;">Check-Out: ${checkOut}</div>
                        <div style="font-size: 12px; color: #475569;">Room Assigned: Room ${roomNo} (${roomType})</div>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Stay Period</th>
                            <th style="text-align: right;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Luxury Room Accommodation</strong><br/>
                                <span style="font-size: 11px; color: #64748b;">Type: ${roomType} | Room No: ${roomNo}</span>
                            </td>
                            <td>${checkIn} to ${checkOut}</td>
                            <td style="text-align: right; font-weight: bold;">${priceText}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row grand-total">
                        <span>Stay Total:</span>
                        <span>${priceText}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for staying at BlueBird Hotels. We look forward to welcoming you again!</p>
                    <p style="font-size: 9px; margin-top: 10px;">This is a system generated invoice copy and requires no physical signature.</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Print Receipt layout for Room stays
    const handlePrintReceipt = (booking) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print receipts.");
            return;
        }
        
        const customer = booking.raw?.Customer || {};
        const guestName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || booking.guestName;
        const roomNo = booking.roomNumber || 'N/A';
        const priceText = booking.price || `Rs. ${booking.raw?.total_price || 0}`;
        const bookingNo = booking.raw?.bookingNo || `RES-${booking.raw?.id || 'N/A'}`;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Stays Receipt - ${bookingNo}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                    .header { text-align: center; border-bottom: 2px dashed #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { font-size: 20px; font-weight: 900; color: #1e3a8a; letter-spacing: 1px; }
                    .title { font-size: 22px; font-weight: 850; color: #1e293b; margin-top: 10px; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .receipt-row.total { font-size: 18px; font-weight: 900; color: #1e3a8a; border-top: 2px solid #e2e8f0; border-bottom: none; padding-top: 15px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <div class="logo">BLUEBIRD HOTELS</div>
                        <div class="title">ROOM STAY PAYMENT RECEIPT</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref #: ${bookingNo}</div>
                    </div>
                    
                    <div class="receipt-row">
                        <span>Customer Name:</span>
                        <span style="font-weight: bold;">${guestName}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Room Number:</span>
                        <span style="font-weight: bold;">Room ${roomNo}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Payment Date & Time:</span>
                        <span style="font-weight: bold;">${new Date().toLocaleString()}</span>
                    </div>
                    <div class="receipt-row total">
                        <span>Total Paid Amount:</span>
                        <span>${priceText}</span>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your payment!</p>
                        <p>BlueBird Hotels - Negombo Shoreline Resort</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

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
                    {/* Statistics Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
                            <h3 className={`text-2xl font-black mt-1 ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>{isLoading ? "..." : allBookings.length}</h3>
                        </div>
                        <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Checked In</p>
                            <h3 className="text-2xl font-black text-emerald-500 mt-1">{isLoading ? "..." : filteredBookings.filter(b => b.status === "Checked In").length}</h3>
                        </div>
                        <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending</p>
                            <h3 className="text-2xl font-black text-amber-500 mt-1">{isLoading ? "..." : filteredBookings.filter(b => b.status === "Pending").length}</h3>
                        </div>
                        <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Confirmed</p>
                            <h3 className="text-2xl font-black text-blue-500 mt-1">{isLoading ? "..." : filteredBookings.filter(b => b.status === "Confirmed").length}</h3>
                        </div>
                    </div>

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
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Actions
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
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => setSelectedBooking(booking)}
                                                                title="View stays details"
                                                                className="p-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-lg text-slate-650 hover:text-slate-850 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
                                                            >
                                                                <Eye size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintInvoice(booking)}
                                                                title="Print stay invoice"
                                                                className="p-1.5 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-lg text-blue-650 dark:text-blue-400 hover:text-blue-800 transition cursor-pointer shadow-2xs"
                                                            >
                                                                <FileText size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintReceipt(booking)}
                                                                title="Print stay receipt"
                                                                className="p-1.5 bg-cyan-50 border border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30 rounded-lg text-cyan-700 dark:text-cyan-450 hover:text-cyan-900 transition cursor-pointer shadow-2xs"
                                                            >
                                                                <Receipt size={13} />
                                                            </button>
                                                            {booking.status !== "Cancelled" && booking.status !== "Checked Out" ? (
                                                                <button
                                                                    onClick={() => handleCancelBooking(booking.raw?.id)}
                                                                    title="Cancel reservation"
                                                                    className="p-1.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-lg text-rose-650 dark:text-rose-450 hover:text-rose-800 transition cursor-pointer shadow-2xs"
                                                                >
                                                                    <XCircle size={13} />
                                                                </button>
                                                            ) : null}
                                                        </div>
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

                </>
            )}

            {/* ROOM BOOKING DETAILS VIEW MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                                    🏨 Room Reservation Details
                                </h3>
                                <p className="text-[10px] font-bold text-blue-500 mt-0.5">Booking Ref: {selectedBooking.raw?.bookingNo || `RES-${selectedBooking.raw?.id || 'N/A'}`}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg transition cursor-pointer"
                            >
                                <MdClose size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs text-left">
                            {/* Stay Summary Card */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80">
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Room Details</span>
                                    <span className="font-extrabold text-slate-850 dark:text-slate-100 mt-1 block">
                                        Room {selectedBooking.roomNumber} ({selectedBooking.roomType})
                                    </span>
                                    <span className="text-[10px] text-slate-450 block mt-0.5">Check-in: {selectedBooking.checkInDate} | Check-out: {selectedBooking.checkOutDate}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Booking Status</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>

                            {/* Guest Details */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    👤 Guest Information
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <span className="text-[10px] text-slate-450 block font-bold">Full Name</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                            {selectedBooking.raw?.Customer ? `${selectedBooking.raw.Customer.firstName} ${selectedBooking.raw.Customer.lastName}` : selectedBooking.guestName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-450 block font-bold">Email Address</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.raw?.Customer?.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-455 block font-bold">Phone Number</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.raw?.Customer?.phoneNumber || selectedBooking.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Stays Dates */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    📅 Accommodation Schedule
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Check-In Date</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.checkInDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Check-Out Date</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.checkOutDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Bill Breakdown */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    💵 Billing Summary
                                </h4>
                                <div className="space-y-2 max-w-md">
                                    <div className="flex justify-between">
                                        <span className="text-slate-450">Room Accommodation Charge:</span>
                                        <span className="font-bold">{selectedBooking.price}</span>
                                    </div>
                                    {selectedBooking.raw?.airportPickup === 1 && (
                                        <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                            <span>Airport Pickup Surcharge:</span>
                                            <span className="font-bold">+ LKR {parseFloat(selectedBooking.raw?.airportPickupSurcharge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                                        <span>Total Stay Value:</span>
                                        <span className={currentAccent.text}>{selectedBooking.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 gap-2">
                            <button
                                onClick={() => handlePrintInvoice(selectedBooking)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <FileText size={14} /> Print Invoice
                            </button>
                            <button
                                onClick={() => handlePrintReceipt(selectedBooking)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <Receipt size={14} /> Print Receipt
                            </button>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className={`px-5 py-2 text-xs font-bold text-white rounded-xl cursor-pointer transition shadow-xs ${currentAccent.bg}`}
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
