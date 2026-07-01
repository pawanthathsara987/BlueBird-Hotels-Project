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
    MdWarning
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function TourBookings() {
    const [inquiries, setInquiries] = useState([]);
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Rejection state
    const [rejectingInquiry, setRejectingInquiry] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Tour booking form state
    const [showForm, setShowForm] = useState(false);

    // Calculate min date (1 day ahead)
    const getMinStartDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split("T")[0];
    };

    const [additionalPrice, setAdditionalPrice] = useState("0");

    const [newInquiry, setNewInquiry] = useState({
        tourId: "",
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        numberOfAdults: 1,
        numberOfChildren: 0,
        startDate: getMinStartDate(),
        pickupLocation: "Hotel Lobby",
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

        const calc = getCalculatedPrice();
        if (calc.basePrice <= 0) {
            toast.error("Please select a valid tour first.");
            return;
        }

        const confirmMsg = `Confirm Tour Booking?\n\n` +
            `🔹 Tour Package: ${calc.packageName}\n` +
            `📅 Start Date: ${newInquiry.startDate}\n` +
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
                setNewInquiry({
                    tourId: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    nationality: "",
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
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                {filteredInquiries.map((inq) => {
                                    const tourName = tours.find(t => t.id === inq.tourId)?.title || "Custom Package";
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
                                                <div className="flex gap-2">
                                                    {inq.status === "pending" ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAccept(inq.id)}
                                                                className="p-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-500 rounded-lg cursor-pointer transition"
                                                                title="Accept Booking"
                                                            >
                                                                <MdCheck size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRejectingInquiry(inq);
                                                                    setRejectionReason("");
                                                                }}
                                                                className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition"
                                                                title="Reject Booking"
                                                            >
                                                                <MdClose size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">Processed</span>
                                                    )}
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
                                <div>
                                    <label className="block font-bold uppercase text-slate-500 mb-2">Nationality *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sri Lankan, British"
                                        value={newInquiry.nationality}
                                        onChange={(e) => setNewInquiry({ ...newInquiry, nationality: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                    />
                                </div>
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
        </div>
    );
}
