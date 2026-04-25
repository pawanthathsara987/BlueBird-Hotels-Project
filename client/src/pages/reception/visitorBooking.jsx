import React, { useState } from "react";
import { MdAdd, MdSearch, MdClose } from "react-icons/md";

export default function VisitorBooking() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        roomType: "Standard",
        nights: "1",
    });

    // Mock walk-in data
    const walkInGuests = [
        {
            id: 1,
            name: "Robert Taylor",
            phone: "+1-234-567-8908",
            email: "robert@example.com",
            roomType: "Deluxe",
            nights: 3,
            checkInTime: "14:30",
            price: "$250",
        },
        {
            id: 2,
            name: "Amanda White",
            phone: "+1-234-567-8909",
            email: "amanda@example.com",
            roomType: "Standard",
            nights: 2,
            checkInTime: "15:45",
            price: "$180",
        },
    ];

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

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Walk-in guest ${formData.name} registered successfully!`);
        setFormData({
            name: "",
            phone: "",
            email: "",
            roomType: "Standard",
            nights: "1",
        });
        setShowForm(false);
    };

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Walk-In Management</h1>
                    <p className="text-gray-600 text-sm md:text-base mt-2">Register and manage walk-in guests</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                >
                    <MdAdd className="text-lg md:text-xl" />
                    New Walk-In
                </button>
            </div>

            {/* Registration Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">Register Walk-In Guest</h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-600 hover:text-gray-900 text-2xl"
                        >
                            <MdClose />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
                                    Guest Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Enter guest name"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
                                    Room Type *
                                </label>
                                <select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Deluxe">Deluxe</option>
                                    <option value="Suite">Suite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
                                    Number of Nights *
                                </label>
                                <input
                                    type="number"
                                    name="nights"
                                    value={formData.nights}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <button
                                type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition text-sm md:text-base"
                            >
                                Register Guest
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition text-sm md:text-base"
                            >
                                Cancel
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
                        <div key={guest.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-purple-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Guest Name</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Room Type</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.roomType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Check-In Time</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.checkInTime}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Phone</p>
                                    <p className="text-gray-800 text-sm md:text-base mt-1">{guest.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Nights</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{guest.nights} nights</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Total Price</p>
                                    <p className="text-purple-600 font-bold text-sm md:text-base mt-1">{guest.price}</p>
                                </div>
                            </div>

                            <button className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition text-sm md:text-base">
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
