import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    MdTerrain,
    MdSearch,
    MdPerson,
    MdCheckCircle,
    MdAccessTime,
    MdLocationOn,
    MdAdd,
    MdClose,
    MdCheck,
    MdEmail,
    MdPhone,
    MdFlag,
    MdWarning,
    MdEdit,
    MdCancel
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { Eye, FileText, Receipt, XCircle, Edit } from "lucide-react";

export default function TourBookings() {
    const [inquiries, setInquiries] = useState([]);
    const [tours, setTours] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Rejection state
    const [rejectingInquiry, setRejectingInquiry] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Tour booking form state
    const [showForm, setShowForm] = useState(false);

    // Pax editing state
    const [editingPaxInquiry, setEditingPaxInquiry] = useState(null);
    const [editAdults, setEditAdults] = useState(1);
    const [editChildren, setEditChildren] = useState(0);

    // Calculate min date (1 day ahead)
    const getMinStartDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split("T")[0];
    };

    const [additionalPrice, setAdditionalPrice] = useState("0");
    const [isLocalGuest, setIsLocalGuest] = useState(false);

    const [newInquiry, setNewInquiry] = useState({
        tourId: "",
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        nic: "",
        passportId: "",
        numberOfAdults: 1,
        numberOfChildren: 0,
        startDate: getMinStartDate(),
        pickupLocation: "BlueBird Hotel Lobby",
        specialRequests: ""
    });

    const location = useLocation();

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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("action") === "new") {
            setShowForm(true);
        }
    }, [location.search]);

    const accentColors = {
        indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600 hover:bg-indigo-750", bgLight: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-100 dark:border-indigo-950" },
        emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600 hover:bg-emerald-700", bgLight: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-950" },
        violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-600 hover:bg-violet-750", bgLight: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-950" },
        amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-600 hover:bg-amber-700", bgLight: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-950" },
        rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600 hover:bg-rose-700", bgLight: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-950" },
        slate: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-700 hover:bg-slate-800", bgLight: "bg-slate-100 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-850" },
    };

    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getCardStyle = () => {
        let style = "p-5 transition-all duration-300 relative overflow-hidden ";
        if (theme.mode === "dark") {
            style += "bg-slate-900 text-slate-100 ";
        } else {
            style += "bg-white text-slate-800 ";
        }
        if (theme.cardStyle === "sleek") {
            style += "shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md hover:border-slate-200/60 dark:hover:border-slate-700/80 rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "border border-slate-200/80 dark:border-slate-850 shadow-none rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border border-white/20 dark:border-slate-800/40 shadow-lg rounded-3xl ";
        }
        return style;
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [inquiriesRes, toursRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/tours`)
            ]);

            if (inquiriesRes.data.success) {
                setInquiries(inquiriesRes.data.data);
            }
            if (toursRes.data.success) {
                setTours(toursRes.data.data);
            }
        } catch (error) {
            console.error("Error loading tour data:", error);
            toast.error("Failed to load tour inquiry details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Accept Tour Inquiry
    const handleAccept = async (id) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries/${id}/accept`);
            if (res.data.success) {
                toast.success("Tour booking accepted successfully!");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept tour inquiry.");
        }
    };

    // Reject Tour Inquiry
    const handleReject = async (e) => {
        e.preventDefault();
        if (!rejectingInquiry) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries/${rejectingInquiry.id}/reject`, {
                rejectionReason
            });
            if (res.data.success) {
                toast.success("Tour booking rejected successfully.");
                setRejectingInquiry(null);
                setRejectionReason("");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject tour inquiry.");
        }
    };

    // Submit New Inquiry
    const handleCreateInquiry = async (e) => {
        e.preventDefault();

        // Strict frontend validation: Tour must be booked at least 1 day in advance
        const tourDate = new Date(newInquiry.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = tourDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
            toast.error("Tours must be booked at least 1 day in advance.");
            return;
        }

        // Validate NIC or Passport ID formats
        if (isLocalGuest) {
            const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
            if (!newInquiry.nic || !nicRegex.test(newInquiry.nic.trim())) {
                toast.error("Invalid Sri Lankan NIC format (e.g. 991234567V or 199912345678).");
                return;
            }
        } else {
            const passportRegex = /^[a-zA-Z0-9-]{5,15}$/;
            if (!newInquiry.passportId || !passportRegex.test(newInquiry.passportId.trim())) {
                toast.error("Invalid Passport ID (Must be 5 to 15 alphanumeric characters).");
                return;
            }
            if (!newInquiry.nationality || newInquiry.nationality.trim().length < 2) {
                toast.error("Nationality is required and must be at least 2 characters.");
                return;
            }
        }

        const calc = getCalculatedPrice();
        if (calc.basePrice <= 0) {
            toast.error("Please select a valid tour first.");
            return;
        }

        const idDetails = isLocalGuest 
            ? `🪪 NIC: ${newInquiry.nic}`
            : `🛂 Passport: ${newInquiry.passportId} (${newInquiry.nationality})`;

        const confirmMsg = `Confirm Tour Booking?\n\n` +
            `🔹 Tour Package: ${calc.packageName}\n` +
            `📅 Start Date: ${newInquiry.startDate}\n` +
            `👤 Guest: ${newInquiry.fullName}\n` +
            `📞 Phone: ${newInquiry.phone}\n` +
            `🆔 Identification: ${idDetails}\n` +
            `👥 Guests: ${newInquiry.numberOfAdults} Adult(s), ${newInquiry.numberOfChildren} Child(ren)\n` +
            `📍 Pickup: ${newInquiry.pickupLocation}\n` +
            `💵 Estimated Total: LKR ${calc.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
            `Do you want to proceed and save this booking?`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            const payload = { ...newInquiry };
            if (parseFloat(additionalPrice) > 0) {
                payload.specialRequests = `[Additional Custom Price: LKR ${parseFloat(additionalPrice).toFixed(2)}] ${newInquiry.specialRequests || ""}`.trim();
            }

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries`, payload);
            if (res.data.success) {
                toast.success("Tour booking inquiry created successfully!");
                setShowForm(false);
                setAdditionalPrice("0");
                setIsLocalGuest(false);
                setNewInquiry({
                    tourId: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    nationality: "",
                    nic: "",
                    passportId: "",
                    numberOfAdults: 1,
                    numberOfChildren: 0,
                    startDate: getMinStartDate(),
                    pickupLocation: "Hotel Lobby",
                    specialRequests: ""
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit tour booking inquiry.");
        }
    };

    // Update pax count API submit
    const handleUpdatePaxSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries/${editingPaxInquiry.id}/pax`, {
                numberOfAdults: editAdults,
                numberOfChildren: editChildren
            });
            if (res.data.success) {
                toast.success("Guest count updated successfully!");
                setEditingPaxInquiry(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update guest count.");
        }
    };

    // Cancel tour booking API request
    const handleCancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this tour booking?\nThis will mark the booking as rejected, and the manager will handle any cash refund/reconciliations on the admin side.")) {
            return;
        }
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/tour-inquiries/${id}/cancel`);
            if (res.data.success) {
                toast.success("Tour booking cancelled successfully!");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to cancel tour booking.");
        }
    };

    // Helper to format date nicely
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    // Print Invoice layout for Tours
    const handlePrintInvoice = (inquiry) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print invoices.");
            return;
        }
        
        const tourName = tours.find(t => t.id === inquiry.tourId)?.packageName || "Custom Excursion";
        const guestName = inquiry.fullName || "Guest";
        const guestEmail = inquiry.email || "N/A";
        const guestPhone = inquiry.phone || "N/A";
        const nationality = inquiry.nationality || "N/A";
        
        const { tourPrice, extraPrice, totalPrice } = getRowPriceParts(inquiry);
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Tour Invoice - ${inquiry.inquiryRef}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #047857; padding-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: 900; color: #047857; letter-spacing: 1px; }
                    .title { font-size: 28px; font-weight: 850; text-align: right; color: #1e293b; }
                    .details { display: flex; justify-content: space-between; margin-top: 30px; }
                    .section-title { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                    .info-block { flex: 1; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
                    .invoice-table th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; }
                    .invoice-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
                    .totals { width: 40%; margin-left: auto; margin-top: 30px; font-size: 13px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-weight: 900; font-size: 16px; color: #047857; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
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
                        <div class="title">EXCURSION INVOICE</div>
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-align: right; margin-top: 4px;"># ${inquiry.inquiryRef}</div>
                    </div>
                </div>
                
                <div class="details">
                    <div class="info-block">
                        <div class="section-title">Billed To</div>
                        <div style="font-weight: bold; font-size: 15px; color: #1e293b;">${guestName}</div>
                        <div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${guestEmail}</div>
                        <div style="font-size: 12px; color: #475569;">Phone: ${guestPhone}</div>
                        <div style="font-size: 12px; color: #475569;">Nationality: ${nationality}</div>
                    </div>
                    <div class="info-block" style="text-align: right;">
                        <div class="section-title">Tour Information</div>
                        <div style="font-size: 12px; color: #475569;">Schedule Date: ${inquiry.startDate}</div>
                        <div style="font-size: 12px; color: #475569;">Guest Count: ${inquiry.numberOfAdults} Adult(s), ${inquiry.numberOfChildren} Child(ren)</div>
                        <div style="font-size: 12px; color: #475569;">Pickup Location: ${inquiry.pickupLocation}</div>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Base Rate</th>
                            <th>Quantity (Pax)</th>
                            <th style="text-align: right;">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Tour Package Excursion</strong><br/>
                                <span style="font-size: 11px; color: #64748b;">${tourName}</span>
                            </td>
                            <td>LKR ${tourPrice.toLocaleString()}</td>
                            <td>${inquiry.numberOfAdults} Ad, ${inquiry.numberOfChildren} Ch</td>
                            <td style="text-align: right; font-weight: bold;">LKR ${tourPrice.toLocaleString()}</td>
                        </tr>
                        ${extraPrice > 0 ? `
                        <tr>
                            <td>
                                <strong>Custom Special Requests & Fees</strong><br/>
                                <span style="font-size: 11px; color: #64748b;">${inquiry.specialRequests || 'Additional Custom requests'}</span>
                            </td>
                            <td>LKR ${extraPrice.toLocaleString()}</td>
                            <td>1 Unit</td>
                            <td style="text-align: right; font-weight: bold;">LKR ${extraPrice.toLocaleString()}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span style="color: #64748b;">Excursion Subtotal:</span>
                        <span style="font-weight: bold;">LKR ${tourPrice.toLocaleString()}</span>
                    </div>
                    ${extraPrice > 0 ? `
                    <div class="total-row">
                        <span style="color: #64748b;">Additional Services:</span>
                        <span style="font-weight: bold;">LKR ${extraPrice.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    <div class="total-row grand-total">
                        <span>Invoice Total:</span>
                        <span>LKR ${totalPrice.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for choosing BlueBird Hotels. Have a wonderful tour excursion!</p>
                    <p style="font-size: 9px; margin-top: 10px;">This is a system generated invoice copy and requires no physical signature.</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Print Receipt layout for Tours
    const handlePrintReceipt = (inquiry) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print receipts.");
            return;
        }
        
        const tourName = tours.find(t => t.id === inquiry.tourId)?.packageName || "Custom Excursion";
        const guestName = inquiry.fullName || "Guest";
        const { totalPrice } = getRowPriceParts(inquiry);
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Excursion Receipt - ${inquiry.inquiryRef}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                    .header { text-align: center; border-bottom: 2px dashed #047857; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { font-size: 20px; font-weight: 900; color: #047857; letter-spacing: 1px; }
                    .title { font-size: 22px; font-weight: 850; color: #1e293b; margin-top: 10px; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .receipt-row.total { font-size: 18px; font-weight: 900; color: #047857; border-top: 2px solid #e2e8f0; border-bottom: none; padding-top: 15px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <div class="logo">BLUEBIRD HOTELS</div>
                        <div class="title">EXCURSION RECEIPT</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref #: ${inquiry.inquiryRef}</div>
                    </div>
                    
                    <div class="receipt-row">
                        <span>Customer Name:</span>
                        <span style="font-weight: bold;">${guestName}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Excursion Details:</span>
                        <span style="font-weight: bold;">${tourName}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Guest Count:</span>
                        <span style="font-weight: bold;">${inquiry.numberOfAdults} Ad, ${inquiry.numberOfChildren} Ch</span>
                    </div>
                    <div class="receipt-row">
                        <span>Transaction Date:</span>
                        <span style="font-weight: bold;">${new Date().toLocaleString()}</span>
                    </div>
                    <div class="receipt-row total">
                        <span>Paid Amount:</span>
                        <span>LKR ${totalPrice.toLocaleString()}</span>
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

    // Filters
    const filteredInquiries = inquiries.filter((inq) => {
        const matchesSearch = inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.inquiryRef?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : inq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        if (status === "accepted") return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
        if (status === "rejected") return "bg-rose-500/10 text-rose-500 border border-rose-500/25";
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
    };

    const getCalculatedPrice = () => {
        if (!newInquiry.tourId) return { packageName: "", basePrice: 0, discount: 0, discountedBase: 0, totalPrice: 0 };
        const selectedTour = tours.find(t => t.id === parseInt(newInquiry.tourId));
        if (!selectedTour) return { packageName: "", basePrice: 0, discount: 0, discountedBase: 0, totalPrice: 0 };

        const basePrice = parseFloat(selectedTour.price) || 0;
        const discount = parseFloat(selectedTour.discount) || 0;
        const discountedBase = discount > 0 ? basePrice - (basePrice * discount / 100) : basePrice;

        const extraPrice = parseFloat(additionalPrice) || 0;
        const totalPrice = discountedBase + extraPrice;

        return {
            packageName: selectedTour.packageName,
            basePrice,
            discount,
            discountedBase,
            totalPrice
        };
    };

    const getRowPriceParts = (inq) => {
        const selectedTour = tours.find(t => t.id === inq.tourId);
        const basePrice = parseFloat(selectedTour?.price || 0);
        const discount = parseFloat(selectedTour?.discount || 0);
        const tourPrice = discount > 0 ? basePrice - (basePrice * discount / 100) : basePrice;
        
        let extraPrice = 0;
        if (inq.specialRequests) {
            const match = inq.specialRequests.match(/\[Additional Custom Price:\s*LKR\s*([\d.]+)\]/);
            if (match && match[1]) {
                extraPrice = parseFloat(match[1]) || 0;
            }
        }
        return {
            tourPrice,
            extraPrice,
            totalPrice: tourPrice + extraPrice
        };
    };

    const parseTotalPrice = (inq) => {
        const { totalPrice } = getRowPriceParts(inq);
        return totalPrice;
    };

    const priceDetails = getCalculatedPrice();

    // Counts
    const totalCount = inquiries.length;
    const pendingCount = inquiries.filter(i => i.status === "pending").length;
    const acceptedCount = inquiries.filter(i => i.status === "accepted").length;

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
            }`}>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-2xl mb-6 relative overflow-hidden">
                <div className="space-y-1">
                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-[#0c325e]"}`}>
                        <MdTerrain className={currentAccent.text} size={28} />
                        Excursion & Tour Bookings
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Manage guest tour bookings, coordinate custom inquiries, and schedule local Negombo tours.
                    </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => window.open("http://localhost:5173/booking/tour", "_blank")}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer shadow-sm text-slate-700 dark:text-slate-200"
                    >
                        <MdTerrain size={16} className={currentAccent.text} /> View Tour Site
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl transition duration-200 cursor-pointer shadow-sm ${currentAccent.bg}`}
                    >
                        <MdAdd size={16} /> Book a Tour
                    </button>
                </div>
            </div>

            {/* Warning Alert about 1 day advance booking */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex gap-3 text-xs text-amber-700 dark:text-amber-400">
                <MdWarning size={18} className="flex-shrink-0" />
                <div>
                    <span className="font-bold uppercase tracking-wider block mb-0.5">Hotel Excursion Rule:</span>
                    All guided tours must be booked at least **1 day in advance** of the start date. This allows the logistics team to organize tour guides, vehicles, and reservations.
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Tour Bookings</p>
                    <h3 className="text-2xl font-black mt-1">{isLoading ? "..." : totalCount}</h3>
                </div>
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Review</p>
                    <h3 className="text-2xl font-black text-amber-500 mt-1">{isLoading ? "..." : pendingCount}</h3>
                </div>
                <div className={getCardStyle()}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Accepted Bookings</p>
                    <h3 className="text-2xl font-black text-emerald-500 mt-1">{isLoading ? "..." : acceptedCount}</h3>
                </div>
            </div>

            {/* Filters Row */}
            <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                <div className="relative w-full md:w-80">
                    <MdSearch className="absolute left-3 top-3 text-slate-400 text-lg" />
                    <input
                        className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none bg-transparent dark:border-slate-800 focus:border-blue-500"
                        placeholder="Search guest or ref code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${statusFilter === "all"
                                ? `${currentAccent.bg} text-white border-transparent`
                                : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${statusFilter === "pending"
                                ? `${currentAccent.bg} text-white border-transparent`
                                : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter("accepted")}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${statusFilter === "accepted"
                                ? `${currentAccent.bg} text-white border-transparent`
                                : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                    >
                        Accepted
                    </button>
                </div>
            </div>

            {/* Tour Inquiries Table */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-slate-500 mt-2 text-xs font-bold">Loading tour bookings...</p>
                    </div>
                ) : filteredInquiries.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-bold text-sm">
                        No tour bookings found matching the filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={theme.mode === "dark" ? "bg-slate-900 border-b border-slate-850" : "bg-slate-50 border-b border-slate-100"}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Ref Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Tour Package</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Guest</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Dates</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Pax</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Pickup</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Price Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                {filteredInquiries.map((inq) => {
                                    const tourName = tours.find(t => t.id === inq.tourId)?.packageName || "Custom Excursion";
                                    return (
                                        <tr key={inq.id} className={theme.mode === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50/50"}>
                                            <td className="px-6 py-4 font-bold text-blue-500">{inq.inquiryRef}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-850 dark:text-slate-200">{tourName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-800 dark:text-slate-200">{inq.fullName}</div>
                                                <div className="flex flex-col text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                                    <span className="flex items-center gap-0.5"><MdEmail size={11} /> {inq.email}</span>
                                                    <span className="flex items-center gap-0.5"><MdPhone size={11} /> {inq.phone}</span>
                                                    <span className="flex items-center gap-0.5"><MdFlag size={11} /> {inq.nationality}</span>
                                                    {inq.nic && <span className="flex items-center gap-1 font-bold text-teal-650 dark:text-teal-400">🪪 NIC: {inq.nic}</span>}
                                                    {inq.passportId && <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">🛂 Passport: {inq.passportId}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-350">
                                                    <MdAccessTime size={13} className="text-slate-400" />
                                                    <span>{inq.startDate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {inq.numberOfAdults} Ad, {inq.numberOfChildren} Ch
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-0.5">
                                                    <MdLocationOn size={13} className="text-slate-400" />
                                                    <span>{inq.pickupLocation}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(inq.status)}`}>
                                                    {inq.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                 {(() => {
                                                     const { tourPrice, extraPrice, totalPrice } = getRowPriceParts(inq);
                                                     return (
                                                         <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium min-w-[120px] text-left">
                                                             <span className="flex justify-between gap-4">
                                                                 <span>Tour:</span>
                                                                 <span className="font-semibold text-slate-700 dark:text-slate-350">LKR {tourPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                             </span>
                                                             {extraPrice > 0 && (
                                                                 <span className="flex justify-between gap-4 text-teal-650 dark:text-teal-400">
                                                                     <span>Extra:</span>
                                                                     <span className="font-semibold">+ LKR {extraPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                 </span>
                                                             )}
                                                             <div className="border-t border-slate-200 dark:border-slate-800 my-0.5"></div>
                                                             <span className="flex justify-between gap-4 font-black text-slate-900 dark:text-white text-xs">
                                                                 <span>Total:</span>
                                                                 <span className={currentAccent.text}>LKR {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                             </span>
                                                         </div>
                                                     );
                                                 })()}
                                             </td>
                                             <td className="px-6 py-4">
                                                 <div className="flex items-center gap-1.5">
                                                     <button
                                                         onClick={() => setSelectedInquiry(inq)}
                                                         title="View tour details"
                                                         className="p-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-lg text-slate-650 hover:text-slate-850 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
                                                     >
                                                         <Eye size={13} />
                                                     </button>
                                                     <button
                                                         onClick={() => handlePrintInvoice(inq)}
                                                         title="Print tour invoice"
                                                         className="p-1.5 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-lg text-blue-650 dark:text-blue-400 hover:text-blue-800 transition cursor-pointer shadow-2xs"
                                                     >
                                                         <FileText size={13} />
                                                     </button>
                                                     <button
                                                         onClick={() => handlePrintReceipt(inq)}
                                                         title="Print tour receipt"
                                                         className="p-1.5 bg-cyan-50 border border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30 rounded-lg text-cyan-700 dark:text-cyan-450 hover:text-cyan-900 transition cursor-pointer shadow-2xs"
                                                     >
                                                         <Receipt size={13} />
                                                     </button>
                                                     {inq.status !== "rejected" ? (
                                                         <>
                                                             <button
                                                                 onClick={() => {
                                                                     setEditingPaxInquiry(inq);
                                                                     setEditAdults(inq.numberOfAdults);
                                                                     setEditChildren(inq.numberOfChildren);
                                                                 }}
                                                                 title="Edit guest count (Pax)"
                                                                 className="p-1.5 bg-purple-50 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-800 transition cursor-pointer shadow-2xs"
                                                             >
                                                                 <Edit size={13} />
                                                             </button>
                                                             <button
                                                                 onClick={() => handleCancelBooking(inq.id)}
                                                                 title="Cancel reservation"
                                                                 className="p-1.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-lg text-rose-650 dark:text-rose-450 hover:text-rose-800 transition cursor-pointer shadow-2xs"
                                                             >
                                                                 <XCircle size={13} />
                                                             </button>
                                                         </>
                                                     ) : null}
                                                 </div>
                                             </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* TOUR REJECTION MODAL */}
            {rejectingInquiry && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <form onSubmit={handleReject} className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                        }`}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-slate-800 border-slate-100">
                            <h2 className="text-lg font-black uppercase tracking-wide">Reject Tour Inquiry</h2>
                            <button type="button" onClick={() => setRejectingInquiry(null)} className="cursor-pointer">
                                <MdClose size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">Provide the reason why this tour booking cannot be approved at this time.</p>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Rejection Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. Guided tour unavailable on this date"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-red-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-rose-600 text-white hover:bg-rose-700 py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer transition shadow-md"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TOUR BOOKING CREATE MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <form onSubmit={handleCreateInquiry} className={`my-8 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border flex flex-col max-h-[90vh] ${theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                        }`}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-slate-800 border-slate-100 flex-shrink-0">
                            <h2 className="text-lg font-black uppercase tracking-wide">Book Excursion / Tour</h2>
                            <button type="button" onClick={() => setShowForm(false)} className="cursor-pointer">
                                <MdClose size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs overflow-y-auto pr-1.5 flex-grow pb-2">
                            <div>
                                <label className="block font-bold uppercase text-slate-500 mb-2">Select Guided Tour *</label>
                                <select
                                    required
                                    value={newInquiry.tourId}
                                    onChange={(e) => setNewInquiry({ ...newInquiry, tourId: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                >
                                    <option value="">Choose a Tour</option>
                                    {tours.map(t => (
                                        <option key={t.id} value={t.id}>{t.packageName} - LKR {t.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Guest Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full name"
                                        value={newInquiry.fullName}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, fullName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Guest Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email address"
                                        value={newInquiry.email}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, email: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone number"
                                        value={newInquiry.phone}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, phone: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                <label className="flex items-center gap-2 font-bold uppercase text-slate-500 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isLocalGuest}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIsLocalGuest(checked);
                                            setNewInquiry(prev => ({
                                                ...prev,
                                                nationality: checked ? "Sri Lankan" : "",
                                                nic: checked ? prev.nic : "",
                                                passportId: checked ? "" : prev.passportId
                                            }));
                                        }}
                                        className="rounded border-slate-350 accent-indigo-650 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 text-xs">Local Guest (Sri Lankan)</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {isLocalGuest ? (
                                    <>
                                        <div>
                                            <label className="block font-bold uppercase text-slate-500 mb-2">Nationality</label>
                                            <input
                                                type="text"
                                                readOnly
                                                value="Sri Lankan"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl p-3 outline-none text-slate-500 font-bold cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold uppercase text-slate-500 mb-2">NIC Number *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="NIC number (e.g. 199912345678)"
                                                value={newInquiry.nic}
                                                onChange={(e) => setNewInquiry(prev => ({ ...prev, nic: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block font-bold uppercase text-slate-500 mb-2">Nationality *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. British, French"
                                                value={newInquiry.nationality}
                                                onChange={(e) => setNewInquiry(prev => ({ ...prev, nationality: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold uppercase text-slate-500 mb-2">Passport ID *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Passport ID (e.g. N1234567)"
                                                value={newInquiry.passportId}
                                                onChange={(e) => setNewInquiry(prev => ({ ...prev, passportId: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Adults *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={newInquiry.numberOfAdults}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, numberOfAdults: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Children *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={newInquiry.numberOfChildren}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, numberOfChildren: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Tour Date *</label>
                                    <input
                                        type="date"
                                        required
                                        min={getMinStartDate()}
                                        value={newInquiry.startDate}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, startDate: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                        style={{ colorScheme: theme.mode }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-500 mb-2">Pickup Location *</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={newInquiry.pickupLocation}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl p-3 outline-none text-slate-550 dark:text-slate-400 font-bold cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-500 mb-2">Additional Custom Price Add-on (LKR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 1500 (Enter 0 if none)"
                                    value={additionalPrice}
                                    onChange={(e) => setAdditionalPrice(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-500 mb-2">Special Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Vegetarian meals needed, infant car seat..."
                                    value={newInquiry.specialRequests}
                                    onChange={(e) => setNewInquiry({ ...newInquiry, specialRequests: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                />
                            </div>

                            {priceDetails.basePrice > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 mt-4 text-left">
                                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                                        <span>Base Package Price:</span>
                                        <span>LKR {priceDetails.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {priceDetails.discount > 0 && (
                                        <div className="flex justify-between text-rose-500 font-bold">
                                            <span>Special Discount ({priceDetails.discount}%):</span>
                                            <span>- LKR {(priceDetails.basePrice * priceDetails.discount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {parseFloat(additionalPrice) > 0 && (
                                        <div className="flex justify-between text-teal-650 dark:text-teal-400 font-bold">
                                            <span>Additional Custom Request:</span>
                                            <span>+ LKR {parseFloat(additionalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t dark:border-slate-800 border-slate-250 pt-2 font-black text-slate-900 dark:text-white text-sm">
                                        <span>Total Tour Price (Full Payment):</span>
                                        <span className={currentAccent.text}>LKR {priceDetails.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                                        ℹ️ Cost is calculated as flat package price (full payment). Guest count is used for booking confirmation details.
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full text-white py-3.5 rounded-xl flex items-center justify-center gap-1.5 font-extrabold cursor-pointer transition shadow-md ${currentAccent.bg}`}
                            >
                                <MdCheckCircle size={18} /> Submit Tour Inquiry
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* EDIT PAX MODAL */}
            {editingPaxInquiry && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <form onSubmit={handleUpdatePaxSubmit} className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border text-left ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-slate-800 border-slate-100">
                            <h2 className="text-md font-black uppercase tracking-wide">Update Pax Count</h2>
                            <button type="button" onClick={() => setEditingPaxInquiry(null)} className="cursor-pointer">
                                <MdClose size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>
                        <div className="space-y-4 text-xs font-bold">
                            <div>
                                <label className="block text-slate-500 mb-2">Adults *</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={editAdults}
                                    onChange={(e) => setEditAdults(parseInt(e.target.value) || 1)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-2">Children *</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={editChildren}
                                    onChange={(e) => setEditChildren(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full text-white py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer transition shadow-md ${currentAccent.bg}`}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TOUR DETAILS VIEW MODAL */}
            {selectedInquiry && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                                    🌲 Excursion Inquiry Details
                                </h3>
                                <p className="text-[10px] font-bold text-blue-500 mt-0.5">Reference No: {selectedInquiry.inquiryRef}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg transition cursor-pointer"
                            >
                                <MdClose size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs text-left">
                            {/* Summary Card */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80">
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Tour Package</span>
                                    <span className="font-extrabold text-slate-850 dark:text-slate-100 mt-1 block">
                                        {tours.find(t => t.id === selectedInquiry.tourId)?.packageName || "Custom Excursion"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Date: {selectedInquiry.startDate}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Status</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${getStatusColor(selectedInquiry.status)}`}>
                                        {selectedInquiry.status}
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
                                        <span className="text-[10px] text-slate-400 block">Full Name</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Phone Number</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Nationality</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.nationality}</span>
                                    </div>
                                    {selectedInquiry.nic && (
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">NIC (Local National ID)</span>
                                            <span className="font-bold text-teal-650 dark:text-teal-400 mt-0.5 block">{selectedInquiry.nic}</span>
                                        </div>
                                    )}
                                    {selectedInquiry.passportId && (
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">Passport Number</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{selectedInquiry.passportId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Schedule & Pax */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    🌲 Excursion Details
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Scheduled Date</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.startDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Guest Count (Pax)</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedInquiry.numberOfAdults} Adult(s), {selectedInquiry.numberOfChildren} Child(ren)</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-400 block">Pickup Location</span>
                                        <span className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5 block">{selectedInquiry.pickupLocation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    💵 Cost & Payments
                                </h4>
                                {(() => {
                                    const { tourPrice, extraPrice, totalPrice } = getRowPriceParts(selectedInquiry);
                                    return (
                                        <div className="space-y-2 max-w-md">
                                            <div className="flex justify-between">
                                                <span className="text-slate-450">Base Tour Price:</span>
                                                <span className="font-bold">LKR {tourPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {extraPrice > 0 && (
                                                <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                                    <span>Special Requirements Fee:</span>
                                                    <span className="font-bold">+ LKR {extraPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                                            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                                                <span>Estimated Total:</span>
                                                <span className={currentAccent.text}>LKR {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Special Requirements */}
                            {selectedInquiry.specialRequests && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-2 uppercase tracking-wider text-[10px]">
                                        📝 Special Notes & Requests
                                    </h4>
                                    <p className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-xl leading-relaxed italic text-slate-700 dark:text-slate-350">
                                        {selectedInquiry.specialRequests}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 gap-2">
                            <button
                                onClick={() => handlePrintInvoice(selectedInquiry)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <FileText size={14} /> Print Invoice
                            </button>
                            <button
                                onClick={() => handlePrintReceipt(selectedInquiry)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <Receipt size={14} /> Print Receipt
                            </button>
                            <button
                                onClick={() => setSelectedInquiry(null)}
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
