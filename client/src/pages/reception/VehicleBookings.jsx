import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    MdDirectionsCar,
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
    MdCancel,
    MdCardMembership,
    MdDateRange
} from "react-icons/md";
import { toast } from "react-hot-toast";

export default function VehicleBookings() {
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [driverPrice, setDriverPrice] = useState(1500);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Booking form modal state
    const [showForm, setShowForm] = useState(false);
    const [newBooking, setNewBooking] = useState({
        vehicleId: "",
        fullName: "",
        email: "",
        phone: "",
        pickupDatetime: "",
        returnDatetime: "",
        pickupLocation: "Hotel Lobby",
        dropoffLocation: "Hotel Lobby",
        hireType: "without_driver",
        customerLicenseNo: "",
        customerLicenseExpiry: "",
        specialRequirements: "",
        isFullyPaid: true,
        paymentMethod: "cash"
    });

    // Theme state
    const [theme, setTheme] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("saas_dashboard_theme") || '{"mode":"dark","accent":"teal"}');
        } catch {
            return { mode: "dark", accent: "teal" };
        }
    });

    useEffect(() => {
        fetchData();
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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bookingsRes, vehiclesRes, driverPriceRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicles`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/driver-pricing`)
            ]);

            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.data);
            }
            if (vehiclesRes.data.success) {
                // Filter to active/available or booked vehicles
                const filteredVehicles = (vehiclesRes.data.data || []).filter(v => v.status === "available" || v.status === "booked");
                setVehicles(filteredVehicles);
            }
            if (driverPriceRes.data.success) {
                setDriverPrice(parseFloat(driverPriceRes.data.data?.driverPricePerDay || 1500));
            }
        } catch (error) {
            console.error("Error loading vehicle bookings:", error);
            toast.error("Failed to load vehicle rentals metadata.");
        } finally {
            setIsLoading(false);
        }
    };

    // Date calculations
    const getMinPickupDatetime = () => {
        const date = new Date();
        date.setHours(date.getHours() + 1); // at least 1 hour in advance
        return date.toISOString().slice(0, 16);
    };

    const getMinReturnDatetime = () => {
        if (!newBooking.pickupDatetime) return getMinPickupDatetime();
        const date = new Date(newBooking.pickupDatetime);
        date.setHours(date.getHours() + 1);
        return date.toISOString().slice(0, 16);
    };

    const getCalculatedPrice = () => {
        if (!newBooking.vehicleId || !newBooking.pickupDatetime || !newBooking.returnDatetime) {
            return { numDays: 0, vehicleRate: 0, driverRate: 0, subtotal: 0, deposit: 0, balance: 0, total: 0 };
        }
        const selectedVehicle = vehicles.find(v => v.id === parseInt(newBooking.vehicleId));
        if (!selectedVehicle) {
            return { numDays: 0, vehicleRate: 0, driverRate: 0, subtotal: 0, deposit: 0, balance: 0, total: 0 };
        }

        const pickupDate = new Date(newBooking.pickupDatetime);
        const returnDate = new Date(newBooking.returnDatetime);
        const diffMs = returnDate - pickupDate;
        const numDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        const vehicleRate = parseFloat(selectedVehicle.pricePerDay || 0);
        const driverRate = newBooking.hireType === "with_driver" ? driverPrice : 0;
        
        const subtotal = (vehicleRate + driverRate) * numDays;
        const total = subtotal;
        const deposit = parseFloat((total * 0.5).toFixed(2));
        const balance = parseFloat((total - deposit).toFixed(2));

        return {
            numDays,
            vehicleRate,
            driverRate,
            subtotal,
            deposit,
            balance,
            total,
            brand: selectedVehicle.brand,
            model: selectedVehicle.model,
            plateNo: selectedVehicle.plateNo
        };
    };

    const priceDetails = getCalculatedPrice();

    const handleCreateBooking = async (e) => {
        e.preventDefault();

        const pickup = new Date(newBooking.pickupDatetime);
        const ret = new Date(newBooking.returnDatetime);

        if (pickup < new Date()) {
            toast.error("Pickup date must be in the future.");
            return;
        }
        if (ret <= pickup) {
            toast.error("Return date must be after the pickup date.");
            return;
        }

        const bookingDays = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));
        if (bookingDays > 30) {
            toast.error("Booking duration cannot exceed 30 days.");
            return;
        }

        if (newBooking.hireType === "without_driver") {
            if (!newBooking.customerLicenseNo || !newBooking.customerLicenseExpiry) {
                toast.error("License details are required for self-drive bookings.");
                return;
            }
            const expiry = new Date(newBooking.customerLicenseExpiry);
            if (expiry < ret) {
                toast.error("Driver license expires before the return date.");
                return;
            }
        }

        const confirmMsg = `Confirm Vehicle Booking?\n\n` +
            `🚗 Vehicle: ${priceDetails.brand} ${priceDetails.model} (${priceDetails.plateNo})\n` +
            `📅 Duration: ${priceDetails.numDays} day(s)\n` +
            `👤 Guest: ${newBooking.fullName}\n` +
            `📞 Phone: ${newBooking.phone}\n` +
            `💵 Estimated Total: LKR ${priceDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n\n` +
            `Do you want to proceed and save this booking?`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings`, newBooking);
            if (res.data.success) {
                toast.success("Vehicle rental booking created successfully!");
                setShowForm(false);
                setNewBooking({
                    vehicleId: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    pickupDatetime: "",
                    returnDatetime: "",
                    pickupLocation: "Hotel Lobby",
                    dropoffLocation: "Hotel Lobby",
                    hireType: "without_driver",
                    customerLicenseNo: "",
                    customerLicenseExpiry: "",
                    specialRequirements: "",
                    isFullyPaid: true,
                    paymentMethod: "cash"
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create vehicle booking.");
        }
    };

    const handleCancelBooking = async (id) => {
        const reason = window.prompt("Please enter the reason for cancellation:");
        if (reason === null) return; // cancelled prompt

        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings/${id}/cancel`, {
                cancellationReason: reason || "Cancelled by receptionist at hotel desk"
            });
            if (res.data.success) {
                toast.success("Booking cancelled successfully!");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to cancel booking.");
        }
    };

    // Filtered bookings
    const filteredBookings = bookings.filter((b) => {
        const guestName = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase();
        const matchesSearch = guestName.includes(searchTerm.toLowerCase()) ||
            b.bookingNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.vehicle?.plateNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const mapping = {
            confirmed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25",
            balance_paid: "bg-teal-500/10 text-teal-500 border border-teal-500/25",
            ongoing: "bg-blue-500/10 text-blue-500 border border-blue-500/25",
            returned: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/25",
            completed: "bg-purple-500/10 text-purple-500 border border-purple-500/25",
            cancelled: "bg-rose-500/10 text-rose-500 border border-rose-500/25",
            pending_payment: "bg-amber-500/10 text-amber-500 border border-amber-500/25",
            expired: "bg-slate-500/10 text-slate-500 border border-slate-500/25"
        };
        return mapping[status] || "bg-slate-500/10 text-slate-500 border border-slate-500/25";
    };

    const getAccents = () => {
        const colorAccents = {
            teal: { text: "text-[#0d9488]", bg: "bg-[#0d9488] hover:bg-[#0f766e]", border: "border-[#0d9488]" },
            blue: { text: "text-blue-600", bg: "bg-blue-600 hover:bg-blue-700", border: "border-blue-600" },
            emerald: { text: "text-emerald-600", bg: "bg-emerald-600 hover:bg-emerald-700", border: "border-emerald-600" },
            indigo: { text: "text-indigo-600", bg: "bg-indigo-600 hover:bg-indigo-700", border: "border-indigo-600" }
        };
        return colorAccents[theme.accent] || colorAccents.teal;
    };

    const currentAccent = getAccents();

    // Summary counts
    const totalCount = bookings.length;
    const activeCount = bookings.filter(b => b.status === "ongoing").length;
    const pendingPayCount = bookings.filter(b => b.status === "pending_payment").length;
    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${
            theme.mode === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
        }`}>
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                        <MdDirectionsCar className={currentAccent.text} /> Vehicle Rental Management
                    </h1>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                        Reception Desk: Book vehicles, collect security deposits, and view hire bookings
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md cursor-pointer transition ${currentAccent.bg}`}
                >
                    <MdAdd size={16} /> Book A Vehicle
                </button>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Rentals", val: totalCount, icon: "📦", color: "text-slate-400 bg-slate-500/10" },
                    { label: "Ongoing Hires", val: activeCount, icon: "🚗", color: "text-blue-500 bg-blue-500/10" },
                    { label: "Awaiting Payment", val: pendingPayCount, icon: "💵", color: "text-amber-500 bg-amber-500/10" },
                    { label: "Cancelled Hires", val: cancelledCount, icon: "✕", color: "text-rose-500 bg-rose-500/10" }
                ].map((c, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100"
                    }`}>
                        <div>
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">{c.label}</span>
                            <span className="text-2xl font-black block mt-1">{c.val}</span>
                        </div>
                        <span className={`text-xl p-2.5 rounded-xl ${c.color}`}>{c.icon}</span>
                    </div>
                ))}
            </div>

            {/* Filter Search Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-6 ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100"
            }`}>
                <div className="relative w-full md:w-80">
                    <MdSearch className="absolute left-3 top-3.5 text-slate-400 text-base" />
                    <input
                        type="text"
                        placeholder="Search guest name or booking no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none font-semibold"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {["all", "pending_payment", "confirmed", "ongoing", "completed", "cancelled"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition cursor-pointer select-none whitespace-nowrap ${
                                statusFilter === st
                                    ? currentAccent.bg + " text-white " + currentAccent.border
                                    : theme.mode === "dark"
                                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {st.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Booking Records Table */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-slate-500 mt-2 text-xs font-bold">Loading rental bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-bold text-sm">
                        No vehicle bookings found matching the criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={theme.mode === "dark" ? "bg-slate-900 border-b border-slate-850" : "bg-slate-50 border-b border-slate-100"}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Booking No</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Guest</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Rental Period</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Hire Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Price Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                {filteredBookings.map((b) => {
                                    const guestName = b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "Walk-in Guest";
                                    const vehicleInfo = b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Custom Vehicle";
                                    
                                    const vehicleCost = parseFloat(b.vehicleRatePerDay || 0) * parseInt(b.numDays);
                                    const driverCost = parseFloat(b.driverRatePerDay || 0) * parseInt(b.numDays);
                                    const total = parseFloat(b.totalPayable || 0);

                                    return (
                                        <tr key={b.id} className={theme.mode === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50/50"}>
                                            <td className="px-6 py-4 font-bold text-blue-500">{b.bookingNo}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-850 dark:text-slate-200">{vehicleInfo}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{b.vehicle?.plateNo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-800 dark:text-slate-200">{guestName}</div>
                                                <div className="flex flex-col text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                                    <span className="flex items-center gap-0.5"><MdEmail size={11} /> {b.customer?.email}</span>
                                                    <span className="flex items-center gap-0.5"><MdPhone size={11} /> {b.customer?.phoneNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700 dark:text-slate-350 flex flex-col gap-0.5 text-[10px]">
                                                    <span className="flex items-center gap-1"><MdAccessTime size={12} /> Pickup: {new Date(b.pickupDatetime).toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><MdDateRange size={12} /> Return: {new Date(b.returnDatetime).toLocaleString()}</span>
                                                    <span className="font-bold text-teal-650 dark:text-teal-400 mt-0.5">{b.numDays} day(s)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold capitalize">
                                                {b.hireType.replace("_", " ")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(b.status)}`}>
                                                    {b.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium min-w-[130px]">
                                                    <span className="flex justify-between gap-4">
                                                        <span>Vehicle:</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-350">LKR {vehicleCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </span>
                                                    {driverCost > 0 && (
                                                        <span className="flex justify-between gap-4 text-teal-650 dark:text-teal-400">
                                                            <span>Driver:</span>
                                                            <span className="font-semibold">+ LKR {driverCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </span>
                                                    )}
                                                    <div className="border-t border-slate-200 dark:border-slate-800 my-0.5"></div>
                                                    <span className="flex justify-between gap-4 font-black text-slate-900 dark:text-white text-xs">
                                                        <span>Total:</span>
                                                        <span className={currentAccent.text}>LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </span>
                                                    <div className="text-[9px] text-slate-400 mt-1">
                                                        Paid: LKR {b.balancePaidAt ? total.toLocaleString() : parseFloat(b.depositAmount).toLocaleString()} ({b.balancePaidAt ? "Full" : "50% Dep"})
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {!["cancelled", "completed", "returned"].includes(b.status) ? (
                                                        <button
                                                            onClick={() => handleCancelBooking(b.id)}
                                                            className="p-1.5 border border-rose-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-500 rounded-lg cursor-pointer transition shadow-sm bg-white dark:bg-slate-900"
                                                            title="Cancel Rental"
                                                        >
                                                            <MdCancel size={14} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">No Actions</span>
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

            {/* BOOKING CREATE FORM MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col md:flex-row overflow-hidden max-h-[90vh] ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        {/* Left Side: Live Price Summary Panel */}
                        <div className={`w-full md:w-80 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
                            theme.mode === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
                        }`}>
                            <div>
                                <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-4">Rental Cost Summary</h3>
                                {priceDetails.total > 0 ? (
                                    <div className="space-y-3.5 text-xs font-bold">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Selected Vehicle</span>
                                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                                                🚗 {priceDetails.brand} {priceDetails.model}
                                            </span>
                                            <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">
                                                Rate: LKR {priceDetails.vehicleRate.toLocaleString()}/day
                                            </span>
                                        </div>

                                        <div className="space-y-2 py-2 border-b dark:border-slate-800/80 border-slate-200/80">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Duration:</span>
                                                <span>{priceDetails.numDays} day(s)</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600 dark:text-slate-350">
                                                <span>Vehicle Total:</span>
                                                <span>LKR {(priceDetails.vehicleRate * priceDetails.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {priceDetails.driverRate > 0 && (
                                                <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                                    <span>Driver Total:</span>
                                                    <span>+ LKR {(priceDetails.driverRate * priceDetails.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2.5 pt-1 border-t dark:border-slate-800 border-slate-200">
                                            <div className="flex justify-between font-black text-slate-900 dark:text-white text-sm">
                                                <span>Estimated Total:</span>
                                                <span className={currentAccent.text}>LKR {priceDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-[11px] font-bold">
                                        Select vehicle, dates, and hire type to see live calculations.
                                    </div>
                                )}
                            </div>

                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-6">
                                ℹ️ Walk-in bookings default to immediate deposit confirmation. Full payment options are recorded at the desk.
                            </div>
                        </div>

                        {/* Right Side: Booking Form */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b dark:border-slate-800 border-slate-100 flex-shrink-0">
                                <h2 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                                    🔑 New Vehicle Rental Booking
                                </h2>
                                <button onClick={() => setShowForm(false)} className="cursor-pointer">
                                    <MdClose size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateBooking} className="flex-grow p-6 overflow-y-auto space-y-5 text-xs text-left font-bold">
                                {/* Vehicle Selection Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Select Vehicle *</label>
                                        <select
                                            required
                                            value={newBooking.vehicleId}
                                            onChange={(e) => setNewBooking({ ...newBooking, vehicleId: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none cursor-pointer"
                                        >
                                            <option value="">-- Select Active Vehicle --</option>
                                            {vehicles.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.brand} {v.model} ({v.plateNo}) · LKR {parseFloat(v.pricePerDay).toLocaleString()}/day
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Hire Type *</label>
                                        <select
                                            value={newBooking.hireType}
                                            onChange={(e) => setNewBooking({ ...newBooking, hireType: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none cursor-pointer"
                                        >
                                            <option value="without_driver">Self Drive (Without Driver)</option>
                                            <option value="with_driver">Hire With Driver (+ LKR {driverPrice.toLocaleString()}/day)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Guest Details Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Guest Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Full name"
                                            value={newBooking.fullName}
                                            onChange={(e) => setNewBooking({ ...newBooking, fullName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Guest Email *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email address"
                                            value={newBooking.email}
                                            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Phone number"
                                            value={newBooking.phone}
                                            onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Pickup and Return Datetimes Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Pickup Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            style={{ colorScheme: theme.mode }}
                                            min={getMinPickupDatetime()}
                                            value={newBooking.pickupDatetime}
                                            onChange={(e) => setNewBooking({ ...newBooking, pickupDatetime: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Return Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            style={{ colorScheme: theme.mode }}
                                            min={getMinReturnDatetime()}
                                            value={newBooking.returnDatetime}
                                            onChange={(e) => setNewBooking({ ...newBooking, returnDatetime: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Pickup & Return Locations */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Pickup Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBooking.pickupLocation}
                                            onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Dropoff Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBooking.dropoffLocation}
                                            onChange={(e) => setNewBooking({ ...newBooking, dropoffLocation: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* License details (WITHOUT driver only) */}
                                {newBooking.hireType === "without_driver" && (
                                    <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl border ${
                                        theme.mode === "dark"
                                            ? "bg-slate-950/40 border-slate-850"
                                            : "bg-slate-50 border-slate-200/50"
                                    }`}>
                                        <div>
                                            <label className="block text-slate-550 mb-2">Driver License Number *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="License card number"
                                                value={newBooking.customerLicenseNo}
                                                onChange={(e) => setNewBooking({ ...newBooking, customerLicenseNo: e.target.value })}
                                                className={`w-full border rounded-xl p-3 outline-none ${
                                                    theme.mode === "dark"
                                                        ? "bg-slate-900 border-slate-800 text-white"
                                                        : "bg-white border-slate-200 text-slate-800"
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-550 mb-2">License Expiry Date *</label>
                                            <input
                                                type="date"
                                                required
                                                style={{ colorScheme: theme.mode }}
                                                value={newBooking.customerLicenseExpiry}
                                                onChange={(e) => setNewBooking({ ...newBooking, customerLicenseExpiry: e.target.value })}
                                                className={`w-full border rounded-xl p-3 outline-none ${
                                                    theme.mode === "dark"
                                                        ? "bg-slate-900 border-slate-800 text-white"
                                                        : "bg-white border-slate-200 text-slate-800"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Special Notes */}
                                <div>
                                    <label className="block text-slate-550 mb-2">Special Notes & Requirements</label>
                                    <textarea
                                        rows="2"
                                        placeholder="e.g. GPS needed, baby seat, extra luggage space..."
                                        value={newBooking.specialRequirements}
                                        onChange={(e) => setNewBooking({ ...newBooking, specialRequirements: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                    />
                                </div>



                                {/* Form Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800 border-slate-100 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-5 py-3 rounded-xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-black cursor-pointer transition text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-6 py-3 text-white rounded-xl flex items-center gap-1.5 font-black cursor-pointer transition shadow-md ${currentAccent.bg}`}
                                    >
                                        <MdCheckCircle size={16} /> Confirm Hire Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
