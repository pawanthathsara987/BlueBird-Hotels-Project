import React, { useState } from "react";
import { MdAdd, MdSearch, MdClose, MdCalendarToday } from "react-icons/md";
import toast from "react-hot-toast";

export default function VisitorBooking() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        roomType: "Standard",
        nights: "1",
        checkInDate: new Date().toISOString().split("T")[0],
        price: "",
    });

    // Mock walk-in data
    const [walkInGuests, setWalkInGuests] = useState([
        {
            id: 1,
            name: "Robert Taylor",
            phone: "+1-234-567-8908",
            email: "robert@example.com",
            roomType: "Deluxe",
            nights: 3,
            checkInDate: "2026-04-24",
            checkInTime: "14:30",
            price: "$750",
        },
        {
            id: 2,
            name: "Amanda White",
            phone: "+1-234-567-8909",
            email: "amanda@example.com",
            roomType: "Standard",
            nights: 2,
            checkInDate: "2026-04-24",
            checkInTime: "15:45",
            price: "$360",
        },
    ]);

    const filteredGuests = walkInGuests.filter(
        (guest) =>
            guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.phone.includes(searchTerm)
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculatePrice = () => {
        const roomPrices = { Standard: 180, Deluxe: 250, Suite: 400 };
        const basePrice = roomPrices[formData.roomType] || 0;
        return (basePrice * parseInt(formData.nights)).toString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.roomType || !formData.nights || !formData.checkInDate) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setIsLoading(true);

            const newGuest = {
                id: walkInGuests.length + 1,
                name: formData.name,
                phone: formData.phone,
                email: formData.email || "N/A",
                roomType: formData.roomType,
                nights: parseInt(formData.nights),
                checkInDate: formData.checkInDate,
                checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                price: "$" + calculatePrice(),
            };

            setWalkInGuests([...walkInGuests, newGuest]);
            toast.success(`${formData.name} registered successfully!`);

            // Reset form
            setFormData({
                name: "",
                phone: "",
                email: "",
                roomType: "Standard",
                nights: "1",
                checkInDate: new Date().toISOString().split("T")[0],
                price: "",
            });
            setShowForm(false);
        } catch (error) {
            toast.error("Failed to register guest");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
            {/* Header */}
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Walk-In Booking</h1>
                    <p className="text-gray-600 text-sm md:text-base mt-2">Register and manage walk-in guest bookings</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                >
                    <MdAdd className="text-lg md:text-xl" />
                    New Walk-In
                </button>
            </div>

            {/* Registration Form Modal */}
            {showForm && (
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    {/* Form Header */}
                    <div className="bg-[#2c4a6b] p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-white">New Walk-In Booking</h2>
                            <p className="text-gray-300 text-sm mt-1">Register a new guest and assign room details</p>
                        </div>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-white hover:text-gray-200 text-2xl transition"
                        >
                            <MdClose />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Guest Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Guest Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        placeholder="Enter guest name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        placeholder="Enter phone number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    placeholder="Enter email address (optional)"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Room & Booking Details */}
                        <div className="border-t pt-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Room & Booking Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                                    <select
                                        name="roomType"
                                        value={formData.roomType}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="Standard">Standard (₹180/night)</option>
                                        <option value="Deluxe">Deluxe (₹250/night)</option>
                                        <option value="Suite">Suite (₹400/night)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Nights *</label>
                                    <input
                                        type="number"
                                        name="nights"
                                        value={formData.nights}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        min="1"
                                        max="30"
                                        placeholder="1"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-In Date *</label>
                                <div className="relative">
                                    <MdCalendarToday className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="checkInDate"
                                        value={formData.checkInDate}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="border-t pt-5 bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">Total Price:</span>
                                <span className="text-lg md:text-xl font-bold text-blue-600">
                                    ₹{calculatePrice()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                disabled={isLoading}
                                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Registering...
                                    </>
                                ) : (
                                    "Register Guest"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-2.5 md:top-3 text-gray-400 text-lg md:text-xl" />
                    <input
                        type="text"
                        placeholder="Search walk-in guests by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Walk-In Guests List */}
            {filteredGuests.length > 0 ? (
                <div className="space-y-4 md:space-y-6">
                    {filteredGuests.map((guest) => (
                        <div key={guest.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Guest Name</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Room Type</p>
                                    <span className="inline-block px-2 md:px-3 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 mt-1">{guest.roomType}</span>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Check-In Date</p>
                                    <p className="text-gray-800 text-sm md:text-base mt-1">{guest.checkInDate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Check-In Time</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.checkInTime}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Phone</p>
                                    <p className="text-gray-800 text-sm md:text-base mt-1">{guest.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Email</p>
                                    <p className="text-gray-800 text-xs md:text-sm mt-1 truncate">{guest.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Duration</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.nights} nights</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Total Price</p>
                                    <p className="text-blue-600 font-bold text-sm md:text-base mt-1">{guest.price}</p>
                                </div>
                            </div>

                            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition text-sm md:text-base">
                                Confirm Check-In
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
                    <p className="text-gray-600 text-base md:text-lg">
                        {searchTerm ? "No walk-in guests found matching your search." : "No walk-in guests registered yet."}
                    </p>
                </div>
            )}
        </div>
    );
}
