import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight, MdList, MdAdd, MdClose, MdPayment } from "react-icons/md";
import { Eye, FileText, Receipt, XCircle, LogIn, CheckCircle, CreditCard, Banknote, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import NewBookingFlow from "./NewBookingFlow";

export default function Booking() {
    const [activeTab, setActiveTab] = useState("list");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allBookings, setAllBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Check-In verification modal state
    const [checkInModal, setCheckInModal] = useState(null); // { bookingId, data } or null
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentRecording, setPaymentRecording] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);

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
                                price: res.total_price ? `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${res.total_price}` : 'N/A',
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

    // Open Check-In verification modal
    const openCheckInModal = async (booking) => {
        const bookingId = booking.raw?.id;
        if (!bookingId) return;
        setCheckInLoading(true);
        setCheckInModal({ bookingId, data: null });
        setPaymentVerified(false);
        setPaymentAmount("");
        setPaymentNote("");
        setPaymentMethod("cash");
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/checkin-details/${bookingId}`);
            if (res.data.success) {
                setCheckInModal({ bookingId, data: res.data.data });
                // Auto-verify if fully paid
                if (res.data.data.paymentSummary.balanceDue <= 0) {
                    setPaymentVerified(true);
                }
            }
        } catch (error) {
            toast.error("Failed to load check-in details.");
            setCheckInModal(null);
        } finally {
            setCheckInLoading(false);
        }
    };

    // Record manual payment at reception
    const handleRecordPayment = async () => {
        if (!checkInModal?.bookingId) return;
        const amt = parseFloat(paymentAmount);
        if (!amt || amt <= 0) {
            toast.error("Please enter a valid payment amount.");
            return;
        }
        setPaymentRecording(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/checkin-details/${checkInModal.bookingId}/pay`, {
                amount: amt,
                method: paymentMethod,
                note: paymentNote
            });
            if (res.data.success) {
                toast.success(`Payment of LKR ${amt.toLocaleString()} recorded!`);
                const newSummary = res.data.data.paymentSummary;
                setCheckInModal(prev => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        paymentSummary: newSummary,
                        payments: [...(prev.data.payments || []), res.data.data.payment]
                    }
                }));
                setPaymentAmount("");
                setPaymentNote("");
                if (newSummary.balanceDue <= 0) {
                    setPaymentVerified(true);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to record payment.");
        } finally {
            setPaymentRecording(false);
        }
    };

    // Final confirm check-in
    const handleConfirmCheckIn = async () => {
        if (!checkInModal?.bookingId) return;
        if (!paymentVerified && checkInModal.data?.paymentSummary?.balanceDue > 0) {
            toast.error("Please collect the remaining balance before checking in.");
            return;
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/check-in/${checkInModal.bookingId}`);
            if (res.data.success) {
                toast.success("Guest checked in successfully! 🎉");
                setCheckInModal(null);
                fetchBookings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete check-in.");
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
                                                            {booking.status === "Confirmed" ? (
                                                                <button
                                                                    onClick={() => openCheckInModal(booking)}
                                                                    title="Check In Guest"
                                                                    className="p-1.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 transition cursor-pointer shadow-2xs"
                                                                >
                                                                    <LogIn size={13} />
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

            {/* CHECK-IN VERIFICATION MODAL */}
            {checkInModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                    }`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.mode === "dark" ? "border-slate-800 bg-emerald-950/20" : "border-slate-100 bg-emerald-50/60"}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <LogIn size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black tracking-tight">Guest Check-In Verification</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Verify payment & guest details before check-in</p>
                                </div>
                            </div>
                            <button onClick={() => setCheckInModal(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition cursor-pointer">
                                <MdClose size={20} />
                            </button>
                        </div>

                        {checkInLoading ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <div className="text-center">
                                    <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                                    <p className="text-slate-500 mt-3 text-xs font-bold">Loading guest details...</p>
                                </div>
                            </div>
                        ) : checkInModal.data ? (() => {
                            const { customer, booking: bk, bookedRooms, payments, paymentSummary } = checkInModal.data;
                            const balanceDue = paymentSummary.balanceDue;
                            const isFullyPaid = balanceDue <= 0;
                            return (
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                                    {/* Payment Status Banner */}
                                    {isFullyPaid ? (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                                            <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">Payment Fully Settled</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">Total of LKR {paymentSummary.totalPaid.toLocaleString(undefined, {minimumFractionDigits:2})} received. Ready to check in.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                                            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-amber-700 dark:text-amber-400">Balance Due: LKR {balanceDue.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                                <p className="text-[10px] text-amber-600 dark:text-amber-500">Collect remaining payment before completing check-in.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Customer Details */}
                                        <div className={`rounded-xl border p-4 ${theme.mode === "dark" ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">👤 Guest Information</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Full Name</span>
                                                    <span className="font-bold">{customer?.firstName} {customer?.lastName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Email</span>
                                                    <span className="font-semibold">{customer?.email || "N/A"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Phone</span>
                                                    <span className="font-semibold">{customer?.phoneNumber || "N/A"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Country</span>
                                                    <span className="font-semibold">{customer?.country || "N/A"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">{customer?.idType === "PASSPORT" ? "Passport" : "NIC"}</span>
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{customer?.idNumber || "N/A"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Address</span>
                                                    <span className="font-semibold text-right max-w-[180px]">{customer?.address || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking & Room Details */}
                                        <div className={`rounded-xl border p-4 ${theme.mode === "dark" ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">🏨 Booking Details</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Booking Ref</span>
                                                    <span className="font-bold text-blue-500">{bk.bookingNo || `RES-${bk.id}`}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Booking Status</span>
                                                    <span className="font-bold capitalize">{bk.status}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Payment Status</span>
                                                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${bk.payment_status === "FULLY_PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : bk.payment_status === "PAY_AT_CHECKIN" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"}`}>{bk.payment_status?.replace(/_/g," ")}</span>
                                                </div>
                                                {bookedRooms && bookedRooms.map(br => (
                                                    <div key={br.id} className={`mt-1 p-2 rounded-lg border ${theme.mode === "dark" ? "bg-slate-900/40 border-slate-700" : "bg-white border-slate-200"}`}>
                                                        <div className="flex justify-between font-bold">
                                                            <span>Room {br.Room?.roomNumber || br.room_id}</span>
                                                            <span className="text-emerald-600 dark:text-emerald-400">LKR {parseFloat(br.price).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                                            {br.checkIn} → {br.checkOut} · {br.board_type} · {br.adults} Adults, {br.kids} Kids
                                                        </div>
                                                    </div>
                                                ))}
                                                {bk.note && <div className="flex justify-between"><span className="text-slate-500">Note</span><span className="font-medium text-right max-w-[180px]">{bk.note}</span></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className={`rounded-xl border p-4 ${theme.mode === "dark" ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">💳 Payment Summary</h4>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Charge</p>
                                                <p className="text-base font-black mt-0.5">LKR {paymentSummary.totalPrice.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Paid</p>
                                                <p className="text-base font-black text-emerald-500 mt-0.5">LKR {paymentSummary.totalPaid.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Balance Due</p>
                                                <p className={`text-base font-black mt-0.5 ${balanceDue > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                                                    LKR {balanceDue.toLocaleString(undefined,{minimumFractionDigits:2})}
                                                </p>
                                            </div>
                                        </div>
                                        {payments && payments.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1.5">Payment History</p>
                                                <div className="space-y-1">
                                                    {payments.map((p, i) => (
                                                        <div key={i} className={`flex justify-between items-center text-[10px] px-2.5 py-1.5 rounded-lg ${theme.mode === "dark" ? "bg-slate-900/60" : "bg-white"} border ${theme.mode === "dark" ? "border-slate-700" : "border-slate-200"}`}>
                                                            <span className="text-slate-500">{new Date(p.createdAt).toLocaleDateString()} — {p.method?.toUpperCase()}</span>
                                                            <span className={`font-bold ${p.status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                                                LKR {p.amount.toLocaleString(undefined,{minimumFractionDigits:2})}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Manual Payment Form */}
                                    {!isFullyPaid && (
                                        <div className={`rounded-xl border p-4 ${theme.mode === "dark" ? "bg-blue-950/20 border-blue-900/30" : "bg-blue-50 border-blue-100"}`}>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5"><MdPayment size={14} /> Collect Payment at Reception</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Amount (LKR) *</label>
                                                    <input
                                                        type="number"
                                                        value={paymentAmount}
                                                        onChange={e => setPaymentAmount(e.target.value)}
                                                        placeholder={`e.g. ${balanceDue.toFixed(2)}`}
                                                        className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 ${theme.mode === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Method</label>
                                                    <select
                                                        value={paymentMethod}
                                                        onChange={e => setPaymentMethod(e.target.value)}
                                                        className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${theme.mode === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                                                    >
                                                        <option value="cash">💵 Cash</option>
                                                        <option value="card">💳 Card</option>
                                                        <option value="bank_transfer">🏦 Bank Transfer</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Note (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={paymentNote}
                                                        onChange={e => setPaymentNote(e.target.value)}
                                                        placeholder="e.g. Partial at desk"
                                                        className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 ${theme.mode === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    onClick={handleRecordPayment}
                                                    disabled={paymentRecording || !paymentAmount}
                                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CreditCard size={13} />
                                                    {paymentRecording ? "Recording..." : "Record Payment"}
                                                </button>
                                                {balanceDue > 0 && (
                                                    <button
                                                        onClick={() => { setPaymentVerified(true); toast.success("Payment manually verified by receptionist."); }}
                                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg transition cursor-pointer hover:bg-amber-100"
                                                    >
                                                        <CheckCircle size={13} />
                                                        Mark as Manually Verified
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification checkbox */}
                                    {!isFullyPaid && (
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentVerified ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/40" : "border-slate-200 dark:border-slate-700"}`}>
                                            <input type="checkbox" checked={paymentVerified} onChange={e => setPaymentVerified(e.target.checked)} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                                            <span className={`text-xs font-bold ${paymentVerified ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
                                                I confirm that the remaining balance has been collected / waived and the guest is ready for check-in.
                                            </span>
                                        </label>
                                    )}
                                </div>
                            );
                        })() : null}

                        {/* Modal Footer */}
                        <div className={`flex justify-between items-center px-6 py-4 border-t ${theme.mode === "dark" ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"}`}>
                            <button
                                onClick={() => setCheckInModal(null)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCheckIn}
                                disabled={checkInLoading || !checkInModal?.data || (!paymentVerified && checkInModal?.data?.paymentSummary?.balanceDue > 0)}
                                className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <LogIn size={14} />
                                Confirm Check-In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
