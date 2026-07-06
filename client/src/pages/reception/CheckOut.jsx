import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch as MdSearchIcon, MdClose as MdCloseIcon, MdPayment } from "react-icons/md";
import { LogOut, CheckCircle, AlertCircle, CreditCard, Eye, User, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CheckOut() {
    const [searchTerm, setSearchTerm] = useState("");
    const [checkOutGuests, setCheckOutGuests] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [subTab, setSubTab] = useState("today"); // "today" or "upcoming"

    // Checkout verification modal state
    const [checkOutModal, setCheckOutModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentRecording, setPaymentRecording] = useState(false);

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("saas_dashboard_theme");
        return saved ? JSON.parse(saved) : { mode: "light", accent: "indigo", cardStyle: "sleek", font: "sans" };
    });

    useEffect(() => {
        const updateTheme = () => { const saved = localStorage.getItem("saas_dashboard_theme"); if (saved) setTheme(JSON.parse(saved)); };
        window.addEventListener("theme_changed", updateTheme);
        window.addEventListener("storage", updateTheme);
        return () => { window.removeEventListener("theme_changed", updateTheme); window.removeEventListener("storage", updateTheme); };
    }, []);

    const fetchCheckOuts = async () => {
        try {
            setIsLoadingList(true);
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/pending-checkouts`);
            setCheckOutGuests(res.data.data || []);
        } catch (err) { console.error(err); } finally { setIsLoadingList(false); }
    };

    useEffect(() => { fetchCheckOuts(); }, []);

    const filteredGuests = checkOutGuests.filter((g) => {
        const name = `${g.firstName} ${g.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const getTodayLocalDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayStr = getTodayLocalDate();

    const todayCheckOutsList = filteredGuests.filter(g => g.checkOut <= todayStr);
    const upcomingCheckOutsList = filteredGuests.filter(g => g.checkOut > todayStr);

    // Open full checkout details modal
    const openCheckOutModal = async (guest) => {
        setModalLoading(true);
        setPaymentAmount("");
        setPaymentNote("");
        setPaymentMethod("cash");
        setCheckOutModal({ guest, bookingId: guest.booking_id, bookedRoomId: guest.booked_room_id, data: null });
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/checkin-details/${guest.booking_id}`);
            if (res.data.success) {
                setCheckOutModal(prev => ({ ...prev, data: res.data.data }));
            }
        } catch (error) { toast.error("Failed to load guest details."); setCheckOutModal(null); }
        finally { setModalLoading(false); }
    };

    // Record manual payment at checkout
    const handleRecordPayment = async () => {
        if (!checkOutModal?.bookingId) return;
        const amt = parseFloat(paymentAmount);
        if (!amt || amt <= 0) { toast.error("Please enter a valid amount."); return; }
        setPaymentRecording(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/checkin-details/${checkOutModal.bookingId}/pay`, { amount: amt, method: paymentMethod, note: paymentNote });
            if (res.data.success) {
                toast.success(`LKR ${amt.toLocaleString()} recorded!`);
                const newSummary = res.data.data.paymentSummary;
                setCheckOutModal(prev => ({ ...prev, data: { ...prev.data, paymentSummary: newSummary, payments: [...(prev.data.payments || []), res.data.data.payment] } }));
                setPaymentAmount(""); setPaymentNote("");
            }
        } catch (error) { toast.error(error.response?.data?.message || "Failed to record payment."); }
        finally { setPaymentRecording(false); }
    };

    // Confirm checkout
    const handleConfirmCheckOut = async () => {
        if (!checkOutModal?.guest) return;
        try {
            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/reception/bookings/${checkOutModal.guest.booked_room_id}/checkout`);
            toast.success("Guest checked out successfully!");
            setCheckOutModal(null);
            fetchCheckOuts();
        } catch (err) { toast.error(err.response?.data?.message || "Failed to process check-out."); }
    };

    const dk = theme.mode === "dark";

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${dk ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"}`}>
            <style>{`.light-mode-high-contrast .text-slate-400{color:#475569!important}.light-mode-high-contrast .text-slate-500{color:#334155!important}`}</style>

            <div className="mb-6">
                <h1 className={`text-3xl font-black tracking-tight ${dk ? "text-white" : "text-[#0c325e]"}`}>Check-Out Dashboard</h1>
                <p className={`text-xs md:text-sm font-medium mt-1 ${dk ? "text-slate-400" : "text-slate-500"}`}>Manage guest departures - review payment before check-out</p>
            </div>

            <div className={`p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-3 border ${dk ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-800"}`}>
                <MdSearchIcon className="text-slate-400 text-2xl" />
                <input className="w-full outline-none bg-transparent" placeholder="Search guest..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {/* SUB-TABS SELECTOR */}
            <div className="flex gap-2 mb-6 border-b dark:border-slate-800 border-slate-200 pb-3">
                <button
                    onClick={() => setSubTab("today")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        subTab === "today"
                            ? "bg-orange-500 text-white shadow-sm font-bold"
                            : (dk ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-950 border border-slate-200")
                    }`}
                >
                    Today's Departures ({todayCheckOutsList.length})
                </button>
                <button
                    onClick={() => setSubTab("upcoming")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        subTab === "upcoming"
                            ? "bg-orange-500 text-white shadow-sm font-bold"
                            : (dk ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-white text-slate-600 hover:text-slate-950 border border-slate-200")
                    }`}
                >
                    Upcoming Departures ({upcomingCheckOutsList.length})
                </button>
            </div>

            {isLoadingList ? (
                <div className="flex items-center justify-center py-20"><span className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(subTab === "today" ? todayCheckOutsList : upcomingCheckOutsList).map((guest) => (
                        <div key={guest.booking_id} className={`rounded-2xl shadow-sm hover:shadow-md transition p-5 border ${dk ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-150 text-slate-800"}`}>
                            <div>
                                <h2 className={`text-lg font-bold ${dk ? "text-white" : "text-slate-800"}`}>{guest.firstName} {guest.lastName}</h2>
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                    guest.checkOut < todayStr
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 animate-pulse"
                                        : guest.checkOut === todayStr
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/40"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/40"
                                }`}>
                                    {guest.checkOut < todayStr ? "Overdue Departure" : guest.checkOut === todayStr ? "Departing Today" : "Upcoming Departure"}
                                </span>
                            </div>
                            <p className={`text-xs font-semibold uppercase tracking-wider mt-3 ${dk ? "text-slate-400" : "text-slate-500"}`}>Room {guest.room_number || guest.roomNumber}</p>
                            <div className="mt-3 text-xs space-y-1">
                                <p className={dk ? "text-slate-300" : "text-slate-600"}>Check-out: <b className={dk ? "text-white" : "text-slate-800"}>{guest.checkOut}</b></p>
                                <p className={dk ? "text-slate-300" : "text-slate-600"}>Nights stayed: <b className={dk ? "text-white" : "text-slate-800"}>{guest.nights}</b></p>
                                <p className={dk ? "text-slate-300" : "text-slate-600"}>Status: <b className="text-orange-500">{guest.status}</b></p>
                            </div>
                            <div className="flex gap-2 mt-5">
                                <button onClick={() => openCheckOutModal(guest)} className="flex-1 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition bg-orange-500 hover:bg-orange-600">
                                    <LogOut size={15} /> Check Out
                                </button>
                                <button onClick={() => openCheckOutModal(guest)} className={`flex-1 py-2.5 rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-2 ${dk ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"}`}>
                                    <Eye size={14} /> View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoadingList && (subTab === "today" ? todayCheckOutsList : upcomingCheckOutsList).length === 0 && (
                <div className={`text-center mt-10 font-bold ${dk ? "text-slate-500" : "text-slate-400"}`}>
                    {subTab === "today" ? "No departures expected for today" : "No upcoming departures scheduled"}
                </div>
            )}

            {checkOutModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col ${dk ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${dk ? "border-slate-800 bg-orange-950/20" : "border-slate-100 bg-orange-50/60"}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center"><LogOut size={18} className="text-orange-500" /></div>
                                <div>
                                    <h3 className="text-sm font-black tracking-tight">Guest Check-Out & Billing</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Verify outstanding balance and complete departures</p>
                                </div>
                            </div>
                            <button onClick={() => setCheckOutModal(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition cursor-pointer"><MdCloseIcon size={20} /></button>
                        </div>

                        {modalLoading ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <div className="text-center">
                                    <span className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                                    <p className="text-slate-500 mt-3 text-xs font-bold">Loading guest details...</p>
                                </div>
                            </div>
                        ) : checkOutModal.data ? (() => {
                            const { customer, booking: bk, bookedRooms, payments, paymentSummary } = checkOutModal.data;
                            const balanceDue = paymentSummary.balanceDue;
                            const isFullyPaid = balanceDue <= 0;
                            return (
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    {isFullyPaid ? (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                                            <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">Payment Fully Settled</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">LKR {paymentSummary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} received. Ready to check out.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                                            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-red-700 dark:text-red-400">Outstanding Balance: LKR {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                <p className="text-[10px] text-red-600 dark:text-red-500">Please collect remaining payment before checking out this guest.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Guest Profile */}
                                        <div className={`rounded-xl border p-4 ${dk ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5"><User size={11} /> Guest Profile</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0">Full Name</span><span className="font-bold text-right">{customer?.firstName} {customer?.lastName}</span></div>
                                                <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0"><Mail size={10} className="inline mr-1" />Email</span><span className="font-semibold text-right break-all">{customer?.email || "N/A"}</span></div>
                                                <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0"><Phone size={10} className="inline mr-1" />Phone</span><span className="font-semibold">{customer?.phoneNumber || "N/A"}</span></div>
                                                <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0"><MapPin size={10} className="inline mr-1" />Country</span><span className="font-semibold">{customer?.country || "N/A"}</span></div>
                                                <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0">{customer?.idType === "PASSPORT" ? "Passport" : "NIC"}</span><span className="font-bold text-indigo-600 dark:text-indigo-400">{customer?.idNumber || "N/A"}</span></div>
                                                {customer?.address && <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0 font-medium">Address</span><span className="font-semibold text-right max-w-[160px]">{customer.address}</span></div>}
                                            </div>
                                        </div>

                                        {/* Rooms List */}
                                        <div className={`rounded-xl border p-4 ${dk ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Room Stay details</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between"><span className="text-slate-500">Booking Ref</span><span className="font-bold text-blue-500">{bk.bookingNo || `RES-${bk.id}`}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Stay Duration</span><span className="font-bold">{checkOutModal.guest.nights} Nights</span></div>
                                                {bookedRooms && bookedRooms.map(br => (
                                                    <div key={br.id} className={`p-2 rounded-lg border ${dk ? "bg-slate-900/40 border-slate-700" : "bg-white border-slate-200"}`}>
                                                        <div className="flex justify-between font-bold"><span>Room {br.Room?.roomNumber || br.room_id}</span><span className="text-emerald-600 dark:text-emerald-400">LKR {parseFloat(br.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{br.checkIn} to {br.checkOut} - {br.board_type}</div>
                                                        <div className={`text-[10px] mt-0.5 font-bold ${br.status === "checked_in" ? "text-blue-500" : br.status === "checked_out" ? "text-emerald-500" : "text-slate-400"}`}>Status: {br.status}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className={`rounded-xl border p-4 ${dk ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Payment Summary</h4>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">Total Charge</p><p className="text-base font-black mt-0.5">LKR {paymentSummary.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                                            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">Paid</p><p className="text-base font-black text-emerald-500 mt-0.5">LKR {paymentSummary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                                            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">Balance Due</p><p className={`text-base font-black mt-0.5 ${balanceDue > 0 ? "text-red-500" : "text-emerald-500"}`}>LKR {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                                        </div>
                                        {payments && payments.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1.5">Payment History</p>
                                                <div className="space-y-1 max-h-28 overflow-y-auto">
                                                    {payments.map((p, i) => (
                                                        <div key={i} className={`flex justify-between items-center text-[10px] px-2.5 py-1.5 rounded-lg border ${dk ? "bg-slate-900/60 border-slate-700" : "bg-white border-slate-200"}`}>
                                                            <span className="text-slate-500">{new Date(p.createdAt).toLocaleDateString()} - {p.method?.toUpperCase()}</span>
                                                            <span className={`font-bold ${p.status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>LKR {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Collect remaining payment */}
                                    <div className={`rounded-xl border p-4 ${dk ? "bg-blue-950/20 border-blue-900/30" : "bg-blue-50 border-blue-100"}`}>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5"><MdPayment size={14} /> Collect Payment at Checkout</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Amount (LKR)</label>
                                                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder={balanceDue > 0 ? `e.g. ${balanceDue.toFixed(2)}` : "Additional charge"} className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 ${dk ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Method</label>
                                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${dk ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Note (optional)</label>
                                                <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="e.g. Mini-bar charge" className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 ${dk ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button onClick={handleRecordPayment} disabled={paymentRecording || !paymentAmount} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                                <CreditCard size={13} /> {paymentRecording ? "Recording..." : "Record Payment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : null}

                        {/* Footer */}
                        <div className={`flex justify-between items-center px-6 py-4 border-t flex-shrink-0 ${dk ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"}`}>
                            <button onClick={() => setCheckOutModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
                            <button onClick={handleConfirmCheckOut} disabled={modalLoading || !checkOutModal?.data} className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                                <LogOut size={14} /> Confirm Check-Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
