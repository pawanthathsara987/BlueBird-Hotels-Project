import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight, MdList, MdAdd, MdClose, MdPayment } from "react-icons/md";
import { Eye, FileText, Receipt, XCircle, LogIn, CheckCircle, CreditCard, Banknote, AlertCircle, Ticket, BedDouble, ShieldCheck, Check, Calendar, Users, Clock, MapPin, Mail, Phone, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import NewBookingFlow from "./NewBookingFlow";

export default function Booking() {
    const [activeTab, setActiveTab] = useState("list");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allBookings, setAllBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

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

                            const totalPaid = res.payments
                                ? res.payments
                                    .filter(p => p.status === 'success')
                                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                                : 0;

                            flatList.push({
                                id: `${res.id}-${br.id}`,
                                guestName: res.Customer ? `${res.Customer.firstName} ${res.Customer.lastName}` : 'Unknown',
                                roomNumber: br.Room ? br.Room.roomNumber : 'N/A',
                                roomType: br.Room && br.Room.roomType ? (br.Room.roomType.type || 'Standard') : 'Standard',
                                checkInDate: br.checkIn,
                                checkOutDate: br.checkOut,
                                status: statusStr || "Pending",
                                totalPrice: res.total_price ? `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${parseFloat(res.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A',
                                paidPrice: `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
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
    const dailyBookings = useMemo(() => {
        return allBookings.filter((booking) => {
            return booking.checkInDate === selectedDate || booking.checkOutDate === selectedDate ||
                (selectedDate >= booking.checkInDate && selectedDate <= booking.checkOutDate);
        });
    }, [selectedDate, allBookings]);

    // Filter bookings by search and status
    const filteredBookings = useMemo(() => {
        return dailyBookings.filter((booking) => {
            const matchesSearch =
                booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.roomNumber && booking.roomNumber.toString().includes(searchTerm));
            
            let matchesStatus = true;
            if (statusFilter === "checkin") {
                matchesStatus = booking.status === "Checked In";
            } else if (statusFilter === "checkout") {
                matchesStatus = booking.status === "Checked Out";
            } else if (statusFilter === "cancel") {
                matchesStatus = booking.status === "Cancelled" || booking.status === "Canceled";
            }

            return matchesSearch && matchesStatus;
        });
    }, [dailyBookings, searchTerm, statusFilter]);

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

    const getModalStayDetails = (booking) => {
        if (!booking || !booking.raw) return null;
        const b = booking.raw;
        const firstRoom = b.bookedRooms?.[0];
        const checkIn = firstRoom?.checkIn || b.createdAt;
        let checkOut = firstRoom?.checkOut || checkIn;
        b.bookedRooms?.forEach(r => {
            if (new Date(r.checkOut) > new Date(checkOut)) {
                checkOut = r.checkOut;
            }
        });
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.max(1, Math.round(Math.abs(new Date(checkOut) - new Date(checkIn)) / msPerDay));

        const rooms = b.bookedRooms?.map(r => ({
            type: r.Room?.roomType?.type || r.Room?.RoomType?.type || "Deluxe Room",
            roomNumber: r.Room?.roomNumber || r.Room?.room_number ? `Room ${r.Room.roomNumber || r.Room.room_number}` : "",
            guests: `${r.adults || 1} Adult${(r.adults || 1) > 1 ? 's' : ''}` + (r.kids > 0 ? `, ${r.kids} Child${r.kids > 1 ? 'ren' : ''}` : "")
        })) || [];

        let totalAdults = 0;
        let totalKids = 0;
        b.bookedRooms?.forEach(r => {
            totalAdults += r.adults || 0;
            totalKids += r.kids || 0;
        });
        const guestsSummary = `${totalAdults} Adult${totalAdults !== 1 ? 's' : ''}` + (totalKids > 0 ? `, ${totalKids} Child${totalKids > 1 ? 'ren' : ''}` : "");

        const paidPayment = b.payments?.find(p => p.status === "success" || p.status === "paid");
        let displayStatus = b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : "Pending";
        let paymentStatus = "Unpaid";
        if (paidPayment) {
            paymentStatus = "Paid";
        } else if (b.status === "confirmed" || b.status === "completed") {
            paymentStatus = "Paid";
        } else if (b.status === "cancelled") {
            paymentStatus = "Cancelled";
        }

        const totalAmount = parseFloat(b.total_price) || 0;

        return {
            id: `BB-BK-${b.id}`,
            realId: b.id,
            hotelName: "BlueBird Luxury Hotels & Resorts",
            location: "Galle Face, Colombo, Sri Lanka",
            checkIn,
            checkOut,
            nights,
            rooms,
            guestsSummary,
            status: displayStatus,
            paymentStatus,
            amount: totalAmount,
            raw: b
        };
    };

    const getOverallStayStatus = (booking) => {
        const bookedRooms = booking.raw?.bookedRooms || [];
        const status = (booking.status || "").toLowerCase();

        if (bookedRooms.length > 0) {
            const roomStatuses = bookedRooms.map(r => (r.status || "").toLowerCase());
            if (roomStatuses.includes("checked_in")) {
                return {
                    key: "checked_in",
                    label: "Checked In",
                    color: "emerald",
                    message: "The guest is currently checked-in to their room."
                };
            }
            if (roomStatuses.includes("checked_out")) {
                return {
                    key: "checked_out",
                    label: "Checked Out",
                    color: "blue",
                    message: "The guest has checked-out of this room."
                };
            }
        }

        if (status === "cancelled" || status === "rejected") {
            return {
                key: "cancelled",
                label: "Cancelled",
                color: "rose",
                message: "This reservation has been cancelled or rejected."
            };
        }
        if (status === "confirmed") {
            return {
                key: "confirmed",
                label: "Reserved & Confirmed",
                color: "indigo",
                message: "The stay is confirmed and ready for arrival check-in."
            };
        }
        return {
            key: "pending",
            label: "Pending Verification",
            color: "amber",
            message: "The reservation is pending manual review or advance deposit."
        };
    };

    const getTimelineSteps = (booking) => {
        const status = (booking.status || "").toLowerCase();
        const isPaid = (booking.paymentStatus || "").toLowerCase() === "paid";
        const bookedRooms = booking.raw?.bookedRooms || [];
        const hasCheckedIn = bookedRooms.some(r => (r.status || "").toLowerCase() === "checked_in" || (r.status || "").toLowerCase() === "checked_out");
        const hasCheckedOut = bookedRooms.some(r => (r.status || "").toLowerCase() === "checked_out");

        const formatDateSafely = (dt) => {
            if (!dt) return null;
            try { return new Date(dt).toLocaleDateString(); } catch (e) { return dt; }
        };

        return [
            { label: "Booking Created", date: formatDateSafely(booking.raw?.createdAt), active: true, done: true },
            { label: "Payment Completed", date: isPaid ? "Verified" : null, active: isPaid, done: isPaid },
            { label: "Booking Confirmed", date: (status === "confirmed" || status === "completed" || hasCheckedIn) ? "Stay Confirmed" : null, active: (status === "confirmed" || status === "completed" || hasCheckedIn), done: (status === "confirmed" || status === "completed" || hasCheckedIn) },
            { label: "Check-in Completed", date: hasCheckedIn ? "Checked In" : null, active: hasCheckedIn, done: hasCheckedIn },
            { label: "Booking Completed", date: hasCheckedOut ? "Checked Out" : null, active: hasCheckedOut, done: hasCheckedOut }
        ];
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

                    {/* Status Filters Bar */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[
                            { id: "all", label: "All Bookings", count: dailyBookings.length, color: "slate" },
                            { id: "checkin", label: "Checked In", count: dailyBookings.filter(b => b.status === "Checked In").length, color: "green" },
                            { id: "checkout", label: "Checked Out", count: dailyBookings.filter(b => b.status === "Checked Out").length, color: "blue" },
                            { id: "cancel", label: "Cancelled", count: dailyBookings.filter(b => b.status === "Cancelled" || b.status === "Canceled").length, color: "rose" }
                        ].map(tab => {
                            const isActive = statusFilter === tab.id;
                            let activeClass = "";
                            if (isActive) {
                                if (tab.color === "green") activeClass = "bg-green-600 text-white shadow-sm border-green-600";
                                else if (tab.color === "blue") activeClass = "bg-blue-600 text-white shadow-sm border-blue-600";
                                else if (tab.color === "rose") activeClass = "bg-rose-600 text-white shadow-sm border-rose-600";
                                else activeClass = "bg-slate-700 text-white shadow-sm border-slate-700";
                            } else {
                                activeClass = theme.mode === "dark" 
                                    ? "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200" 
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
                            }
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${activeClass}`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : (theme.mode === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
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
                                                    Check-In
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Check-Out
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Status
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Total Price
                                                </th>
                                                <th className={`px-4 lg:px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                                    Paid Price
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
                                                        {booking.totalPrice}
                                                    </td>
                                                    <td className={`px-4 lg:px-6 py-4 text-xs md:text-sm font-black ${theme.mode === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>
                                                        {booking.paidPrice}
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
                                                </div>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Total Price</p>
                                                    <p className={`font-semibold ${theme.mode === "dark" ? "text-slate-200" : "text-slate-700"}`}>{booking.totalPrice}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Paid Price</p>
                                                    <p className={`font-semibold ${theme.mode === "dark" ? "text-slate-205" : "text-emerald-700 font-bold"}`}>{booking.paidPrice}</p>
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
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    title="View stays details"
                                                    className="p-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-lg text-slate-655 hover:text-slate-850 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
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
                                                        className="p-1.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-lg text-rose-650 dark:text-rose-455 hover:text-rose-800 transition cursor-pointer shadow-2xs"
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
            {/* ROOM BOOKING DETAILS VIEW DRAWER */}
            {(() => {
                const mappedBooking = getModalStayDetails(selectedBooking);
                if (!mappedBooking) return null;

                const stayStatus = getOverallStayStatus(mappedBooking);
                const timelineSteps = getTimelineSteps(mappedBooking);

                const colorClasses = {
                    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400",
                    blue: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400",
                    rose: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400",
                    indigo: "bg-indigo-50 border-indigo-200 text-indigo-805 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400",
                    amber: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
                };
                const bgBorderClass = colorClasses[stayStatus.color] || "bg-slate-50 border-slate-200 text-slate-800";

                return (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
                            onClick={() => setSelectedBooking(null)}
                        />
                        <div className={`fixed inset-y-0 right-0 max-w-xl w-full z-50 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft ${
                            theme.mode === "dark" ? "bg-slate-900 border-l border-slate-800 text-white" : "bg-white text-slate-800"
                        }`}>
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-blue-950 text-white">
                                <div>
                                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest block">Reception Stay details</span>
                                    <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                                        <Ticket size={18} className="text-amber-400" />
                                        {mappedBooking.id}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                                {/* Status Banner */}
                                <div className={`p-4 border rounded-2xl flex gap-3.5 items-start ${bgBorderClass} shadow-2xs`}>
                                    <div className="shrink-0 mt-0.5">
                                        {stayStatus.key === "checked_in" && <ShieldCheck className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />}
                                        {stayStatus.key === "checked_out" && <Check className="w-5.5 h-5.5 text-blue-600" />}
                                        {stayStatus.key === "cancelled" && <XCircle className="w-5.5 h-5.5 text-rose-600" />}
                                        {stayStatus.key === "confirmed" && <Calendar className="w-5.5 h-5.5 text-indigo-650" />}
                                        {stayStatus.key === "pending" && <Clock className="w-5.5 h-5.5 text-amber-600 animate-pulse" />}
                                    </div>
                                    <div className="text-xs text-left">
                                        <p className="font-extrabold uppercase tracking-wider text-[9px] opacity-75">Stays status</p>
                                        <p className="font-black text-sm uppercase mt-0.5 tracking-wide">{stayStatus.label}</p>
                                        <p className="font-semibold mt-1 opacity-90 leading-relaxed text-[11px]">{stayStatus.message}</p>
                                    </div>
                                </div>

                                {/* Milestone timeline */}
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5 text-left">Timeline Steps</span>
                                    <div className="relative pl-6 space-y-4 border-l border-slate-200 dark:border-slate-800 text-left">
                                        {timelineSteps.map((step, idx) => (
                                            <div key={idx} className="relative">
                                                <div className={`absolute -left-8.5 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done
                                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                                    : step.active
                                                        ? "bg-amber-400 border-amber-400 text-white"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                                    }`}>
                                                    {step.done && <Check size={8} className="stroke-3" />}
                                                </div>
                                                <div className="text-xs">
                                                    <p className={`font-bold ${step.done ? (theme.mode === 'dark' ? 'text-slate-200' : 'text-slate-800') : 'text-slate-400'}`}>{step.label}</p>
                                                    {step.date && <p className="text-[10px] text-slate-400 mt-0.5">{step.date}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stays Info Grid */}
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5 text-left">Accommodation Summary</span>
                                    <div className="grid grid-cols-2 gap-3 text-xs text-left">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/80 rounded-xl">
                                            <span className="text-[9px] text-slate-400 font-bold block mb-1">CHECK-IN</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <Calendar size={12} className="text-blue-700 dark:text-blue-400" />
                                                {formatDate(mappedBooking.checkIn)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/80 rounded-xl">
                                            <span className="text-[9px] text-slate-400 font-bold block mb-1">CHECK-OUT</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <Calendar size={12} className="text-blue-700 dark:text-blue-400" />
                                                {formatDate(mappedBooking.checkOut)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/80 rounded-xl">
                                            <span className="text-[9px] text-slate-400 font-bold block mb-1">ROOM DETAILS</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <BedDouble size={12} className="text-cyan-700 dark:text-cyan-400" />
                                                {mappedBooking.rooms.length} Room(s) ({mappedBooking.nights} Nights)
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/80 rounded-xl">
                                            <span className="text-[9px] text-slate-400 font-bold block mb-1">OCCUPANCY SUMMARY</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <Users size={12} className="text-cyan-700 dark:text-cyan-400" />
                                                {mappedBooking.guestsSummary}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest details block */}
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">👤 Guest contact details</span>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 text-xs">
                                        <div>
                                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Guest Name</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                                                {mappedBooking.raw?.Customer ? `${mappedBooking.raw.Customer.firstName} ${mappedBooking.raw.Customer.lastName}` : selectedBooking.guestName}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Email Address</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block flex items-center gap-1">
                                                <Mail size={11} className="text-slate-400" />
                                                {mappedBooking.raw?.Customer?.email || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Phone Number</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block flex items-center gap-1">
                                                <Phone size={11} className="text-slate-400" />
                                                {mappedBooking.raw?.Customer?.phoneNumber || selectedBooking.phone || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Details breakdown list */}
                                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Rooms Allocation list</span>
                                    {mappedBooking.raw?.bookedRooms?.map((room, idx) => (
                                        <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-xl flex gap-3 items-start">
                                            <BedDouble size={18} className="text-blue-700 dark:text-blue-450 mt-0.5 shrink-0" />
                                            <div className="flex-1 text-xs">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{room.Room?.roomType?.type || "Standard Room"}</p>
                                                    <span className="text-[9px] font-black text-blue-900 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300 border border-blue-100 rounded px-1.5 py-0.5">
                                                        {room.board_type || "Room Only"}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[10px] mt-1">
                                                    Occupancy capacity: {room.adults} Adult(s) {room.kids > 0 ? `, ${room.kids} Child(ren)` : ""}
                                                </p>
                                                <p className="text-slate-500 text-[10px]">
                                                    Room Assigned: <span className="font-bold text-slate-700 dark:text-slate-350">{room.Room?.roomNumber || room.Room?.room_number ? `Room ${room.Room.roomNumber || room.Room.room_number}` : "Not Assigned"}</span>
                                                </p>
                                                <p className="text-slate-500 text-[10px]">
                                                    Rate: <span className="font-bold text-slate-700 dark:text-slate-350">LKR {parseFloat(room.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Airport shuttle service pickup details */}
                                {mappedBooking.raw?.airportPickup && (
                                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl space-y-2 text-left text-emerald-800 dark:text-emerald-400">
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <MapPin size={14} className="text-emerald-700 dark:text-emerald-500" />
                                            Airport Shuttle Pickup Info
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-semibold">
                                            <p>Location: Katunayake (Fixed)</p>
                                            <p>Date: {formatDate(mappedBooking.raw.airportPickup.pickup_date)}</p>
                                            <p>Time: {mappedBooking.raw.airportPickup.pickup_time}</p>
                                            <p>Flight No: {mappedBooking.raw.airportPickup.flight_number || "—"}</p>
                                            <p>Passengers: {mappedBooking.raw.airportPickup.passenger_count || 1}</p>
                                            <p>Baggage: {mappedBooking.raw.airportPickup.baggage_count || 0}</p>
                                            <p className="col-span-2">Status: <span className="uppercase font-bold">{mappedBooking.raw.airportPickup.status}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* Billing summary */}
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">💵 Billing details</span>
                                    <div className="space-y-2 max-w-md text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-450">Room Accommodation Charge:</span>
                                            <span className="font-bold">{selectedBooking.price}</span>
                                        </div>
                                        {selectedBooking.raw?.airportPickup && (
                                            <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                                <span>Airport Pickup Surcharge:</span>
                                                <span className="font-bold">+ LKR {parseFloat(selectedBooking.raw?.airportPickupSurcharge || selectedBooking.raw?.airportPickup?.price || 15000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                                        <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                                            <span>Total Stay Value:</span>
                                            <span className={currentAccent.text}>{selectedBooking.price}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Amount Paid:</span>
                                            <span>{selectedBooking.paidPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer / Actions */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                                <button
                                    onClick={() => handlePrintInvoice(selectedBooking)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900 shadow-2xs"
                                >
                                    <FileText size={13} /> Print Invoice
                                </button>
                                <button
                                    onClick={() => handlePrintReceipt(selectedBooking)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900 shadow-2xs"
                                >
                                    <Receipt size={13} /> Print Receipt
                                </button>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl cursor-pointer transition shadow-xs ${currentAccent.bg}`}
                                >
                                    Close View
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
