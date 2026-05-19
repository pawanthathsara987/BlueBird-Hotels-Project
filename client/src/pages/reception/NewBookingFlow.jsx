import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { MdCalendarToday, MdPerson, MdEmail, MdPhone, MdBadge, MdHotel } from "react-icons/md";

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
        idPassport: ""
    });

    const [isLoading, setIsLoading] = useState(false);

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
        const pkg = packages.find(p => p.id === parseInt(selectedPackageId));
        if (!pkg) return;

        // Check if already added
        if (selectedRooms.find(r => r.roomId === room.id)) {
            toast.error("Room already selected");
            return;
        }

        setSelectedRooms(prev => [...prev, {
            roomId: room.id,
            roomNumber: room.roomNumber || `Room ${room.id}`, // fallback if roomNumber isn't a column
            packageId: pkg.id,
            packageName: pkg.pname,
            price: pkg.pprice,
            actualAdults: 1,
            actualKids: 0,
            maxAdults: pkg.maxAdults,
            maxKids: pkg.maxKids
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

        if (selectedRooms.length === 0) {
            toast.error("Please select at least one room");
            return;
        }

        setIsLoading(true);

        const bookingData = {
            source: 'reception',
            guestDetails,
            total_price: totalPrice,
            rooms: selectedRooms.map(r => ({
                roomId: r.roomId,
                checkIn: new Date(checkInDate).toISOString(),
                checkOut: new Date(checkOutDate).toISOString(),
                actualAdults: r.actualAdults,
                actualKids: r.actualKids
            }))
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/roombook/visitor-booking`, bookingData);
            if (response.data.success) {
                toast.success("Booking created successfully!");
                // Reset form
                setSelectedRooms([]);
                setGuestDetails({ firstName: "", lastName: "", email: "", phoneNumber: "", idPassport: "" });
                if (onBookingSuccess) onBookingSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create booking");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Create New Walk-in Booking</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Room Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Check-in Date</label>
                            <div className="relative">
                                <MdCalendarToday className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={checkInDate}
                                    min={today.toISOString().split("T")[0]}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Check-out Date</label>
                            <div className="relative">
                                <MdCalendarToday className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    min={checkInDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Package & Room Selection */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select Package to view available rooms</label>
                        <select
                            value={selectedPackageId}
                            onChange={(e) => setSelectedPackageId(e.target.value)}
                            className="w-full p-3 border border-blue-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                        >
                            <option value="">-- Choose a Package --</option>
                            {packages.map(pkg => (
                                <option key={pkg.id} value={pkg.id} disabled={pkg.available_room === 0}>
                                    {pkg.pname} - ${pkg.pprice}/night ({pkg.available_room} rooms available)
                                </option>
                            ))}
                        </select>

                        {/* Room Grid */}
                        {selectedPackageId && (
                            <div className="mt-4">
                                <p className="text-xs font-bold uppercase text-gray-500 mb-3">Available Room Numbers (Manual Override)</p>
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
                                                    className={`p-3 rounded-xl border text-center transition-all ${isSelected
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-95'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                                                        }`}
                                                >
                                                    <MdHotel className={`mx-auto mb-1 text-xl ${isSelected ? 'text-blue-200' : 'text-blue-500'}`} />
                                                    <span className="font-bold">Room {room.id}</span>
                                                    {isSelected && <span className="block text-[10px] uppercase tracking-widest mt-1 opacity-80">Selected</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">No rooms available for this package on selected dates.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Rooms Configuration */}
                    {selectedRooms.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase text-gray-500 border-b pb-2">Selected Rooms Configuration</h3>
                            {selectedRooms.map((room, index) => (
                                <div key={room.roomId} className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">Room {room.roomId}</p>
                                        <p className="text-xs text-gray-500">{room.packageName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block">Adults</label>
                                            <select
                                                value={room.actualAdults}
                                                onChange={(e) => handleUpdateRoomGuests(room.roomId, 'actualAdults', e.target.value)}
                                                className="border-gray-200 rounded-md text-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {Array.from({ length: room.maxAdults || 2 }, (_, i) => i + 1).map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block">Kids</label>
                                            <select
                                                value={room.actualKids}
                                                onChange={(e) => handleUpdateRoomGuests(room.roomId, 'actualKids', e.target.value)}
                                                className="border-gray-200 rounded-md text-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {Array.from({ length: (room.maxKids || 2) + 1 }, (_, i) => i).map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveRoom(room.roomId)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-bold"
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
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 flex items-center gap-2">
                            <MdPerson className="text-lg" /> Guest Details
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">First Name *</label>
                                    <input type="text" name="firstName" value={guestDetails.firstName} onChange={handleGuestChange} className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Last Name *</label>
                                    <input type="text" name="lastName" value={guestDetails.lastName} onChange={handleGuestChange} className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1"><MdPhone /> Phone Number *</label>
                                <input type="tel" name="phoneNumber" value={guestDetails.phoneNumber} onChange={handleGuestChange} className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1"><MdEmail /> Email Address</label>
                                <input type="email" name="email" value={guestDetails.email} onChange={handleGuestChange} placeholder="Optional for walk-ins" className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1"><MdBadge /> ID / Passport / Country</label>
                                <input type="text" name="idPassport" value={guestDetails.idPassport} onChange={handleGuestChange} className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-900 text-white p-5 rounded-xl shadow-lg">
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 border-b border-gray-700 pb-2">Booking Summary</h3>

                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Nights</span>
                            <span className="font-bold">{calculateNights()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-300">Rooms</span>
                            <span className="font-bold">{selectedRooms.length}</span>
                        </div>

                        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                            {selectedRooms.map(r => (
                                <div key={r.roomId} className="flex justify-between text-xs items-center bg-gray-800 p-2 rounded">
                                    <span className="truncate pr-2">Room {r.roomId} ({r.packageName})</span>
                                    <span className="font-mono text-green-400">${r.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-700 pt-4 mb-6">
                            <span className="text-gray-300 font-medium">Total Amount</span>
                            <span className="text-3xl font-black text-green-400">${totalPrice.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleSubmitBooking}
                            disabled={isLoading || selectedRooms.length === 0}
                            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all shadow-md
                                ${isLoading || selectedRooms.length === 0
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-400 text-gray-900 hover:shadow-green-500/20 hover:-translate-y-0.5'
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
