import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  MdRefresh, MdCheckCircle, MdCancel, MdSearch, MdInfo, 
  MdPayment, MdDateRange, MdPerson, MdRoom, MdLocalTaxi,
  MdOutlineMoneyOff, MdEqualizer, MdPendingActions
} from "react-icons/md";

const CURRENCY = "LKR";

export default function RefundRequests() {
    const [activeSubTab, setActiveSubTab] = useState("pending"); // "pending", "reports"
    const [pendingRefunds, setPendingRefunds] = useState([]);
    const [allRefunds, setAllRefunds] = useState([]); // for reports
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Dialog action states
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [actionType, setActionType] = useState(null); // "APPROVE", "REJECT"
    const [refundMethod, setRefundMethod] = useState("Cash");
    const [transactionRef, setTransactionRef] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [submittingAction, setSubmittingAction] = useState(false);

    // Theme state synced with layout
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

    const fetchPendingRefunds = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/refunds/pending`,
                { headers }
            );
            if (res.data.success) {
                setPendingRefunds(res.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching pending refunds:", err);
            toast.error("Failed to load pending refund requests.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRefundsForReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/refunds/reports`,
                { headers }
            );
            if (res.data.success) {
                setAllRefunds(res.data.data || []);
            }
        } catch (err) {
            console.error("Error loading refund reports:", err);
        }
    };

    useEffect(() => {
        if (activeSubTab === "pending") {
            fetchPendingRefunds();
        } else {
            fetchAllRefundsForReports();
        }
    }, [activeSubTab]);

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRefund) return;

        setSubmittingAction(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const payload = {
                status: actionType === "APPROVE" ? "APPROVED" : "REJECTED"
            };

            if (actionType === "APPROVE") {
                payload.paymentMethod = refundMethod;
                payload.transactionRef = transactionRef;
            } else {
                payload.reason = rejectionReason;
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/refunds/${selectedRefund.id}/action`,
                payload,
                { headers }
            );

            if (res.data.success) {
                toast.success(
                    actionType === "APPROVE" 
                        ? `Refund request approved! Amount: ${CURRENCY} ${res.data.refundedAmount.toLocaleString()}` 
                        : "Refund request rejected."
                );
                setSelectedRefund(null);
                setActionType(null);
                setTransactionRef("");
                setRejectionReason("");
                fetchPendingRefunds();
            } else {
                toast.error(res.data.message || "Failed to process request.");
            }
        } catch (err) {
            console.error("Error processing refund action:", err);
            toast.error(err.response?.data?.message || "Failed to process refund review.");
        } finally {
            setSubmittingAction(false);
        }
    };

    // Filter pending list
    const filteredRefunds = pendingRefunds.filter(r => {
        const query = searchTerm.toLowerCase();
        const refNo = r.refund_no.toLowerCase();
        const bookingId = String(r.booking_id).toLowerCase();
        const guestName = (r.booking?.Customer?.name || "").toLowerCase();
        return refNo.includes(query) || bookingId.includes(query) || guestName.includes(query);
    });

    // Theme values mappings
    const accentColors = {
        indigo: { bg: "bg-indigo-600 hover:bg-indigo-700", border: "border-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
        teal: { bg: "bg-teal-600 hover:bg-teal-700", border: "border-teal-500", text: "text-teal-600 dark:text-teal-400" },
        violet: { bg: "bg-violet-600 hover:bg-violet-700", border: "border-violet-500", text: "text-violet-600 dark:text-violet-400" },
        amber: { bg: "bg-amber-600 hover:bg-amber-700", border: "border-amber-500", text: "text-amber-600 dark:text-amber-400" },
        rose: { bg: "bg-rose-600 hover:bg-rose-700", border: "border-rose-500", text: "text-rose-600 dark:text-rose-400" },
        slate: { bg: "bg-slate-700 hover:bg-slate-800", border: "border-slate-500", text: "text-slate-700 dark:text-slate-300" },
    };
    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getCardStyle = () => {
        let style = "p-5 transition-all duration-300 relative overflow-hidden ";
        if (theme.mode === "dark") {
            style += "bg-slate-900 text-slate-100 border border-slate-800/80 ";
        } else {
            style += "bg-white text-slate-800 border border-slate-200/50 ";
        }
        if (theme.cardStyle === "sleek") {
            style += "shadow-sm hover:shadow-md rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "shadow-none rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-lg rounded-3xl ";
        }
        return style;
    };

    // Reports Math Calculations
    const getReportsData = () => {
        const completed = allRefunds.filter(r => r.status === "COMPLETED" || r.status === "APPROVED");
        
        // Total Refunded
        const totalRefunded = completed.reduce((sum, r) => sum + parseFloat(r.amount), 0);

        // Daily Refunded (Today)
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const todayRefunds = completed.filter(r => new Date(r.refund_date) >= startOfToday);
        const todayTotal = todayRefunds.reduce((sum, r) => sum + parseFloat(r.amount), 0);

        // Monthly Refunded (This Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRefunds = completed.filter(r => new Date(r.refund_date) >= startOfMonth);
        const monthlyTotal = monthlyRefunds.reduce((sum, r) => sum + parseFloat(r.amount), 0);

        // Refund by Method
        const methodBreakdown = completed.reduce((acc, r) => {
            const method = r.payment_method || "Bank Transfer";
            acc[method] = (acc[method] || 0) + parseFloat(r.amount);
            return acc;
        }, {});

        // Refund by Staff
        const staffBreakdown = completed.reduce((acc, r) => {
            const staffName = r.processedByStaff?.name || "System Admin";
            acc[staffName] = (acc[staffName] || 0) + parseFloat(r.amount);
            return acc;
        }, {});

        return {
            totalRefunded,
            todayTotal,
            todayCount: todayRefunds.length,
            monthlyTotal,
            monthlyCount: monthlyRefunds.length,
            methodBreakdown,
            staffBreakdown
        };
    };

    const reportsData = getReportsData();

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${
            theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
        }`}>
            
            {/* HEADER */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight ${theme.mode === "dark" ? "text-white" : "text-[#0c325e]"}`}>
                        Refunds Management Portal
                    </h1>
                    <p className={`text-xs md:text-sm font-medium mt-1 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Review refund requests, cancel room stays, and manage shuttle refunds
                    </p>
                </div>

                {/* Sub Tab Switcher */}
                <div className={`flex p-1 rounded-xl border ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <button
                        onClick={() => setActiveSubTab("pending")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                            activeSubTab === "pending"
                                ? `${currentAccent.bg} text-white`
                                : "text-slate-550 dark:text-slate-400 hover:text-slate-800"
                        }`}
                    >
                        <MdPendingActions className="text-sm" />
                        Pending Requests ({pendingRefunds.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab("reports")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                            activeSubTab === "reports"
                                ? `${currentAccent.bg} text-white`
                                : "text-slate-550 dark:text-slate-400 hover:text-slate-800"
                        }`}
                    >
                        <MdEqualizer className="text-sm" />
                        Refund Reports
                    </button>
                </div>
            </div>

            {/* PENDING REFUNDS TAB */}
            {activeSubTab === "pending" && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* Filters Bar */}
                    <div className={`${getCardStyle()} p-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
                        <div className="relative w-full md:max-w-xs">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <MdSearch size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by booking or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border focus:outline-none transition-colors ${
                                    theme.mode === "dark"
                                        ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500"
                                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-550"
                                }`}
                            />
                        </div>
                        <button
                            onClick={fetchPendingRefunds}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        >
                            <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
                            Refresh List
                        </button>
                    </div>

                    {/* Pending Requests Grid */}
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">
                            <MdRefresh className="animate-spin text-3xl mx-auto mb-2" />
                            <p className="text-xs font-bold">Retrieving pending requests...</p>
                        </div>
                    ) : filteredRefunds.length === 0 ? (
                        <div className={`${getCardStyle()} text-center py-16 text-slate-400 space-y-2`}>
                            <MdOutlineMoneyOff size={40} className="mx-auto text-slate-300" />
                            <p className="text-sm font-bold text-slate-500">No pending refund requests found</p>
                            <p className="text-xs">Any refund request submitted by customers will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredRefunds.map((refund) => (
                                <div key={refund.id} className={getCardStyle()}>
                                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refund Number</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-white">{refund.refund_no}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refund Method</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">{refund.payment_method}</span>
                                        </div>
                                    </div>

                                    {/* Body details */}
                                    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                                        <div className="flex gap-2">
                                            <MdPerson className="text-slate-400 shrink-0 text-base" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    {refund.booking?.Customer?.name || "Walk-In Guest"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {refund.booking?.Customer?.email} | {refund.booking?.Customer?.phone}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <MdDateRange className="text-slate-400 shrink-0 text-base" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    Booking Ref: #{refund.booking_id}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Requested on: {new Date(refund.request_date).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Refunded Items List */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800/40">
                                            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Refunded Items Breakdown:</p>
                                            {refund.items && refund.items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center text-[11px] font-semibold">
                                                    <span className="flex items-center gap-1">
                                                        {item.item_type === "ROOM" ? <MdRoom className="text-indigo-500" /> : <MdLocalTaxi className="text-emerald-500" />}
                                                        {item.item_type === "ROOM" ? `Room stay (Room ${item.bookedRoom?.Room?.room_number || "TBD"})` : "Airport Pickup service"}
                                                    </span>
                                                    <span className="text-slate-800 dark:text-slate-200">
                                                        {CURRENCY} {item.refund_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reason block */}
                                        {refund.reason && (
                                            <div className="p-3 bg-rose-50/40 dark:bg-rose-950/15 border-l-4 border-l-rose-500 rounded text-[11px] italic leading-normal">
                                                Cancellation Reason: "{refund.reason}"
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Refundable</span>
                                                <span className="text-lg font-black text-rose-700 dark:text-rose-400">
                                                    {CURRENCY} {parseFloat(refund.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRefund(refund);
                                                        setActionType("REJECT");
                                                    }}
                                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRefund(refund);
                                                        setActionType("APPROVE");
                                                        setRefundMethod(refund.payment_method || "Cash");
                                                    }}
                                                    className={`px-4 py-2 ${currentAccent.bg} text-white rounded-xl font-bold transition cursor-pointer`}
                                                >
                                                    Approve & Pay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* REPORTS TAB */}
            {activeSubTab === "reports" && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={getCardStyle()}>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Refunded (All Time)</span>
                            <h2 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                                {CURRENCY} {reportsData.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-0.5">Total refunded stays payout statements</p>
                        </div>
                        <div className={getCardStyle()}>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refunded Today</span>
                            <h2 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                                {CURRENCY} {reportsData.todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-0.5">Processed today: {reportsData.todayCount} request(s)</p>
                        </div>
                        <div className={getCardStyle()}>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refunded This Month</span>
                            <h2 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                                {CURRENCY} {reportsData.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-0.5">Processed this month: {reportsData.monthlyCount} request(s)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Refund by Method */}
                        <div className={getCardStyle()}>
                            <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                                Refund Payouts by Method
                            </h3>
                            <div className="space-y-2">
                                {Object.keys(reportsData.methodBreakdown).map((method) => (
                                    <div key={method} className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-slate-100 dark:border-slate-850">
                                        <span className="flex items-center gap-1.5">
                                            <MdPayment className="text-slate-400" />
                                            {method}
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {CURRENCY} {reportsData.methodBreakdown[method].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                                {Object.keys(reportsData.methodBreakdown).length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No refund records available.</p>
                                )}
                            </div>
                        </div>

                        {/* Refund by Staff */}
                        <div className={getCardStyle()}>
                            <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                                Refund Approvals by Staff Member
                            </h3>
                            <div className="space-y-2">
                                {Object.keys(reportsData.staffBreakdown).map((staff) => (
                                    <div key={staff} className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-slate-100 dark:border-slate-850">
                                        <span className="flex items-center gap-1.5">
                                            <MdPerson className="text-slate-400" />
                                            {staff}
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {CURRENCY} {reportsData.staffBreakdown[staff].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                                {Object.keys(reportsData.staffBreakdown).length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No staff refund processing records available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Refund Log Table */}
                    <div className={getCardStyle()}>
                        <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                            Processed Refund Audit log History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-semibold text-slate-700 dark:text-slate-350 text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                                        <th className="py-2.5">Refund Ref</th>
                                        <th>Booking Ref</th>
                                        <th>Customer</th>
                                        <th>Method</th>
                                        <th>Date</th>
                                        <th>Processed By</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRefunds.filter(r => r.status === "COMPLETED" || r.status === "APPROVED").map((refund) => (
                                        <tr key={refund.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                            <td className="py-3 font-bold text-slate-905 dark:text-white">{refund.refund_no}</td>
                                            <td className="font-mono">#{refund.booking_id}</td>
                                            <td>{refund.booking?.Customer?.name || "Guest"}</td>
                                            <td>{refund.payment_method}</td>
                                            <td>{new Date(refund.refund_date || refund.request_date).toLocaleDateString()}</td>
                                            <td>{refund.processedByStaff?.name || "Admin"}</td>
                                            <td className="text-right font-black text-rose-700 dark:text-rose-455">
                                                -{CURRENCY} {parseFloat(refund.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {allRefunds.filter(r => r.status === "COMPLETED" || r.status === "APPROVED").length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-6 text-center text-slate-400 italic">No processed refund audit logs.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* APPROVAL / REJECTION ACTION OVERLAY MODAL */}
            {selectedRefund && actionType && (
                <>
                    <div 
                        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-55 animate-fadeIn"
                        onClick={() => {
                            setSelectedRefund(null);
                            setActionType(null);
                        }}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-55 p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleUp">
                            <div className="flex items-center gap-2 text-slate-800">
                                {actionType === "APPROVE" ? (
                                    <MdCheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                                ) : (
                                    <MdCancel className="w-8 h-8 text-rose-600 shrink-0" />
                                )}
                                <h4 className="font-serif font-bold text-sm">
                                    {actionType === "APPROVE" ? "Approve Refund Request" : "Reject Refund Request"}
                                </h4>
                            </div>

                            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs font-semibold">
                                {actionType === "APPROVE" ? (
                                    <>
                                        <p className="text-slate-500 leading-normal text-[11px]">
                                            You are approving refund request <span className="font-bold text-slate-800">{selectedRefund.refund_no}</span> for 
                                            <span className="font-bold text-slate-800"> {CURRENCY} {parseFloat(selectedRefund.amount).toLocaleString()}</span>. 
                                            Please configure payout details:
                                        </p>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-700 font-bold">Refund Payment Method:</label>
                                            <select
                                                value={refundMethod}
                                                onChange={(e) => setRefundMethod(e.target.value)}
                                                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-indigo-650"
                                            >
                                                <option value="Cash">Cash (Collect at Reception)</option>
                                                <option value="Card">Card Reversal</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-700 font-bold">Transaction Reference ID:</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. TXN-1002345 or Bank Transfer Ref"
                                                value={transactionRef}
                                                onChange={(e) => setTransactionRef(e.target.value)}
                                                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-indigo-650"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-slate-500 leading-normal text-[11px]">
                                            You are rejecting refund request <span className="font-bold text-slate-800">{selectedRefund.refund_no}</span>. Please enter rejection reason:
                                        </p>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-700 font-bold">Reason for Rejection:</label>
                                            <textarea
                                                required
                                                placeholder="Enter rejection explanation details..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-indigo-650 h-20 resize-none"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedRefund(null);
                                            setActionType(null);
                                        }}
                                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-center text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingAction}
                                        className={`flex-1 py-2.5 text-white rounded-xl font-bold transition cursor-pointer text-center text-xs flex items-center justify-center gap-1.5 ${
                                            actionType === "APPROVE" ? "bg-emerald-650 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                                        }`}
                                    >
                                        {submittingAction ? (
                                            <>
                                                <MdRefresh className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : actionType === "APPROVE" ? (
                                            "Approve Refund"
                                        ) : (
                                            "Reject Refund"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
