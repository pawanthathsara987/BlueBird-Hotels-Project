import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { MdCalendarToday, MdPerson, MdEmail, MdPhone, MdBadge, MdHotel } from "react-icons/md";
import { validateSriLankanNIC, validatePassport } from "../../utils/validation";

export default function NewBookingFlow({ onBookingSuccess }) {
    const today = new Date();
    const defaultCheckOut = new Date(today);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 1);

    const [checkInDate, setCheckInDate] = useState(today.toISOString().split("T")[0]);
    const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut.toISOString().split("T")[0]);

    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState("");
    const [availableRoomsForPackage, setAvailableRoomsForPackage] = useState([]);

    const [selectedRooms, setSelectedRooms] = useState([]);

    const [guestDetails, setGuestDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        idPassport: "",
        country: ""
    });

    const [isLocal, setIsLocal] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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

    // Fetch packages when dates change
    useEffect(() => {
        if (checkInDate && checkOutDate) {
            fetchPackages(checkInDate, checkOutDate);
        }
    }, [checkInDate, checkOutDate]);

    // Fetch specific rooms when package is selected
    useEffect(() => {
        if (selectedPackageId && checkInDate && checkOutDate) {
            fetchRoomsForPackage(selectedPackageId, checkInDate, checkOutDate);
        } else {
            setAvailableRoomsForPackage([]);
        }
    }, [selectedPackageId, checkInDate, checkOutDate]);

    const fetchPackages = async (checkIn, checkOut) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/available-packages`,
                {
                    params: { checkIn, checkOut }
                }
            );
            if (response.data.success) {
                setPackages(response.data.data);
            } else {
                setPackages([]);
            }
            setSelectedPackageId(""); // Reset package selection on date change
        } catch (error) {
            console.error("Error fetching packages:", error);
            setPackages([]);
        }
    };

    const fetchRoomsForPackage = async (packageId, checkIn, checkOut) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/available-rooms`,
                {
                    packageId,
                    checkIn: new Date(checkIn).toISOString(),
                    checkOut: new Date(checkOut).toISOString()
                }
            );
            if (response.data.success) {
                setAvailableRoomsForPackage(response.data.data);
            } else {
                setAvailableRoomsForPackage([]);
            }
        } catch (error) {
            console.error("Error fetching rooms for package:", error);
            setAvailableRoomsForPackage([]);
        }
    };

    const handleAddRoom = (room) => {
        const pkg = packages.find(p => p.room_type_id === parseInt(selectedPackageId));
        if (!pkg) return;

        // Check if already added
        if (selectedRooms.find(r => r.roomId === room.id)) {
            toast.error("Room already selected");
            return;
        }

        setSelectedRooms(prev => [...prev, {
            roomId: room.id,
            roomNumber: room.roomNumber || `Room ${room.id}`,
            packageId: pkg.room_type_id,
            packageName: pkg.room_type_name,
            price: pkg.price,
            actualAdults: 1,
            actualKids: 0,
            maxAdults: pkg.max_adults,
            maxKids: pkg.max_kids
        }]);
    };

    const handleRemoveRoom = (roomId) => {
        setSelectedRooms(prev => prev.filter(r => r.roomId !== roomId));
    };

    const handleUpdateRoomGuests = (roomId, field, value) => {
        setSelectedRooms(prev => prev.map(r =>
            r.roomId === roomId ? { ...r, [field]: Number(value) } : r
        ));
    };

    const handleGuestChange = (e) => {
        const { name, value } = e.target;
        setGuestDetails(prev => ({ ...prev, [name]: value }));
    };

    const calculateNights = () => {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const totalPrice = selectedRooms.reduce((sum, room) => sum + (room.price * calculateNights()), 0);

    const handleSubmitBooking = async () => {
        if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.phoneNumber) {
            toast.error("Please fill in required guest details (First Name, Last Name, Phone)");
            return;
        }

        if (isLocal) {
            if (guestDetails.idPassport && !validateSriLankanNIC(guestDetails.idPassport)) {
                toast.error("Invalid Sri Lankan NIC number format. Must be 9 digits followed by V/X or 12 digits.");
                return;
            }
        } else {
            if (guestDetails.idPassport && !validatePassport(guestDetails.idPassport)) {
                toast.error("Invalid Passport format. Must be 6 to 15 alphanumeric characters.");
                return;
            }
        }

        if (selectedRooms.length === 0) {
            toast.error("Please select at least one room");
            return;
        }

        setIsLoading(true);

        try {
            toast.loading("Adding customer details...", { id: 'booking-progress' });
            const payload = {
                firstName: guestDetails.firstName,
                lastName: guestDetails.lastName,
                email: guestDetails.email,
                phoneNumber: guestDetails.phoneNumber,
                idType: isLocal ? "NIC" : "PASSPORT",
                idNumber: guestDetails.idPassport,
                country: isLocal ? "Sri Lanka" : guestDetails.country,
                idPassport: guestDetails.idPassport
            };
            const customerResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/roombook/reception-customer`, payload);

            if (!customerResponse.data.success) {
                toast.dismiss('booking-progress');
                toast.error("Failed to add customer details.");
                setIsLoading(false);
                return;
            }

            const guestId = customerResponse.data.data.customerId;
            toast.loading("Creating booking...", { id: 'booking-progress' });

            const bookingData = {
                guestId,
                total_price: totalPrice,
                rooms: selectedRooms.map(r => ({
                    roomId: r.roomId,
                    checkIn: new Date(checkInDate).toISOString(),
                    checkOut: new Date(checkOutDate).toISOString(),
                    actualAdults: r.actualAdults,
                    actualKids: r.actualKids
                }))
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/roombook/visitor-booking`, bookingData);
            if (response.data.success) {
                toast.dismiss('booking-progress');
                toast.success("Booking created successfully!");
                setSelectedRooms([]);
                setGuestDetails({ firstName: "", lastName: "", email: "", phoneNumber: "", idPassport: "", country: "" });
                setIsLocal(true);
                if (onBookingSuccess) onBookingSuccess();
            }
        } catch (error) {
            toast.dismiss('booking-progress');
            toast.error(error.response?.data?.message || "Failed to create booking");
        } finally {
            setIsLoading(false);
        }
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
        <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${
            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}>
            <h2 className={`text-xl font-black mb-6 border-b pb-3 tracking-wide uppercase ${
                theme.mode === "dark" ? "text-white border-slate-800" : "text-slate-800 border-slate-100"
            }`}>
                Create New Walk-in Booking
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Room Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dates */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border ${
                        theme.mode === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-gray-50 border-gray-100"
                    }`}>
                        <div>
                            <label className={`block text-xs font-black uppercase mb-2 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Check-in Date</label>
                            <div className="relative">
                                <MdCalendarToday className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="date"
                                    value={checkInDate}
                                    min={today.toISOString().split("T")[0]}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none ${
                                        theme.mode === "dark"
                                            ? "bg-slate-900 border-slate-800 text-white focus:border-slate-600"
                                            : "bg-white border-slate-200 text-slate-800 focus:border-blue-500"
                                    }`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={`block text-xs font-black uppercase mb-2 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Check-out Date</label>
                            <div className="relative">
                                <MdCalendarToday className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    min={checkInDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none ${
                                        theme.mode === "dark"
                                            ? "bg-slate-900 border-slate-800 text-white focus:border-slate-600"
                                            : "bg-white border-slate-200 text-slate-800 focus:border-blue-500"
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Package & Room Selection */}
                    <div className={`p-4 rounded-2xl border ${
                        theme.mode === "dark"
                            ? "bg-indigo-950/10 border-indigo-900/30"
                            : "bg-blue-50/50 border-blue-100"
                    }`}>
                        <label className={`block text-xs font-black uppercase mb-2 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                            Select Package to view available rooms
                        </label>
                        <select
                            value={selectedPackageId}
                            onChange={(e) => setSelectedPackageId(e.target.value)}
                            className={`w-full p-3 border rounded-xl shadow-inner focus:outline-none transition-all font-bold text-xs ${
                                theme.mode === "dark"
                                    ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700"
                                    : "bg-white border-blue-200 text-slate-700 focus:border-blue-400"
                            }`}
                        >
                            <option value="" className="bg-slate-900 text-white">-- Choose a Package --</option>
                            {packages.map(pkg => (
                                <option key={pkg.room_type_id} value={pkg.room_type_id} disabled={pkg.available_rooms_count === 0} className="bg-slate-900 text-white">
                                    {pkg.room_type_name} - LKR {pkg.price}/night ({pkg.available_rooms_count} rooms available)
                                </option>
                            ))}
                        </select>

                        {/* Room Grid */}
                        {selectedPackageId && (
                            <div className="mt-4">
                                <p className={`text-xs font-black uppercase mb-3 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                                    Available Room Numbers (Manual Override)
                                </p>
                                {availableRoomsForPackage.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {availableRoomsForPackage.map(room => {
                                            const isSelected = selectedRooms.some(r => r.roomId === room.id);
                                            return (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    onClick={() => handleAddRoom(room)}
                                                    disabled={isSelected}
                                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-95'
                                                            : (theme.mode === "dark"
                                                                ? 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                                                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm')
                                                    }`}
                                                >
                                                    <MdHotel className={`mx-auto mb-1 text-xl ${isSelected ? 'text-blue-200' : 'text-blue-500'}`} />
                                                    <span className="font-extrabold text-xs">Room {room.roomNumber || room.id}</span>
                                                    {isSelected && <span className="block text-[9px] uppercase font-black tracking-widest mt-1 opacity-80">Selected</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 p-3 rounded-xl border border-amber-200">
                                        No rooms available for this package on selected dates.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Rooms Configuration */}
                    {selectedRooms.length > 0 && (
                        <div className="space-y-3">
                            <h3 className={`text-xs font-black uppercase border-b pb-2 ${theme.mode === "dark" ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-100"}`}>
                                Selected Rooms Configuration
                            </h3>
                            {selectedRooms.map((room) => (
                                <div key={room.roomId} className={`flex flex-col sm:flex-row items-center gap-4 border p-4 rounded-2xl shadow-inner ${
                                    theme.mode === "dark" ? "bg-slate-950/50 border-slate-800" : "bg-white border-slate-200"
                                }`}>
                                    <div className="flex-1">
                                        <p className={`font-black text-sm ${theme.mode === "dark" ? "text-white" : "text-slate-800"}`}>Room {room.roomNumber || room.roomId}</p>
                                        <p className={`text-xs ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>{room.packageName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-slate-400 block mb-0.5">Adults</label>
                                            <select
                                                value={room.actualAdults}
                                                onChange={(e) => handleUpdateRoomGuests(room.roomId, 'actualAdults', e.target.value)}
                                                className={`border rounded-lg text-xs py-1 px-2 focus:outline-none ${
                                                    theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {Array.from({ length: room.maxAdults || 2 }, (_, i) => i + 1).map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-slate-400 block mb-0.5">Kids</label>
                                            <select
                                                value={room.actualKids}
                                                onChange={(e) => handleUpdateRoomGuests(room.roomId, 'actualKids', e.target.value)}
                                                className={`border rounded-lg text-xs py-1 px-2 focus:outline-none ${
                                                    theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {Array.from({ length: (room.maxKids || 2) + 1 }, (_, i) => i).map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveRoom(room.roomId)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-xl transition-colors text-xs font-black cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Guest Details & Summary */}
                <div className="space-y-6">
                    {/* Guest Form */}
                    <div className={`p-5 rounded-2xl border ${
                        theme.mode === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-gray-50 border-gray-100"
                    }`}>
                        <h3 className={`text-xs font-black uppercase mb-4 flex items-center gap-2 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            <MdPerson className="text-lg" /> Guest Details
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-xs font-bold block mb-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={guestDetails.firstName}
                                        onChange={handleGuestChange}
                                        className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`text-xs font-bold block mb-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={guestDetails.lastName}
                                        onChange={handleGuestChange}
                                        className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                        }`}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`text-xs font-bold block mb-1 flex items-center gap-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                    <MdPhone /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={guestDetails.phoneNumber}
                                    onChange={handleGuestChange}
                                    className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`text-xs font-bold block mb-1 flex items-center gap-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                    <MdEmail /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={guestDetails.email}
                                    onChange={handleGuestChange}
                                    placeholder="Optional for walk-ins"
                                    className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-2 mb-2 mt-4 border-t pt-4 dark:border-slate-800 border-slate-100">
                                <input
                                    type="checkbox"
                                    id="isLocal"
                                    checked={isLocal}
                                    onChange={(e) => setIsLocal(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                                />
                                <label htmlFor="isLocal" className={`text-xs font-bold cursor-pointer select-none ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                                    Local Guest (uncheck if international)
                                </label>
                            </div>

                            {isLocal ? (
                                <div>
                                    <label className={`text-xs font-bold block mb-1 flex items-center gap-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                        <MdBadge /> National Identity Card (NIC)
                                    </label>
                                    <input
                                        type="text"
                                        name="idPassport"
                                        value={guestDetails.idPassport}
                                        onChange={handleGuestChange}
                                        className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                            theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                        }`}
                                        placeholder="Enter NIC number"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className={`text-xs font-bold block mb-1 flex items-center gap-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                            <MdBadge /> Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={guestDetails.country}
                                            onChange={handleGuestChange}
                                            className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                                theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                            }`}
                                            placeholder="Enter country name"
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold block mb-1 flex items-center gap-1 ${theme.mode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                            <MdBadge /> Passport ID
                                        </label>
                                        <input
                                            type="text"
                                            name="idPassport"
                                            value={guestDetails.idPassport}
                                            onChange={handleGuestChange}
                                            className={`w-full border rounded-xl text-xs p-2 focus:outline-none ${
                                                theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                            }`}
                                            placeholder="Enter passport number"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl">
                        <h3 className="text-xs font-black uppercase text-slate-400 mb-4 border-b border-slate-800 pb-2">Booking Summary</h3>

                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Nights</span>
                            <span className="font-extrabold">{calculateNights()}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-slate-400">Rooms</span>
                            <span className="font-extrabold">{selectedRooms.length}</span>
                        </div>

                        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                            {selectedRooms.map(r => (
                                <div key={r.roomId} className="flex justify-between text-[11px] items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                    <span className="truncate pr-2 font-bold text-slate-200">Room {r.roomNumber || r.roomId} ({r.packageName})</span>
                                    <span className="font-black text-green-400">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {r.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-800 pt-4 mb-6">
                            <span className="text-slate-400 font-bold">Total Amount</span>
                            <span className="text-3xl font-black text-green-400">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {totalPrice.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleSubmitBooking}
                            disabled={isLoading || selectedRooms.length === 0}
                            className={`w-full py-3.5 rounded-xl font-black uppercase tracking-wider transition-all shadow-md cursor-pointer
                                ${isLoading || selectedRooms.length === 0
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent'
                                    : 'bg-green-500 hover:bg-green-400 text-gray-950 hover:shadow-green-500/10 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
