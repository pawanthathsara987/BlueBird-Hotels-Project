import React, { useState } from "react";
import { MdSearch, MdLogout, MdClose } from "react-icons/md";

export default function CheckOut() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuest, setSelectedGuest] = useState(null);

    // Mock data for guests to check out
    const checkOutGuests = [
        {
            id: 1,
            guestName: "John Doe",
            roomNumber: "101",
            roomType: "Deluxe",
            checkOutDate: "2026-04-25",
            phone: "+1-234-567-8900",
            email: "john@example.com",
            totalBill: "$250",
            nights: 2,
        },
        {
            id: 2,
            guestName: "Jane Smith",
            roomNumber: "205",
            roomType: "Standard",
            checkOutDate: "2026-04-26",
            phone: "+1-234-567-8901",
            email: "jane@example.com",
            totalBill: "$180",
            nights: 3,
        },
        {
            id: 3,
            guestName: "Sarah Davis",
            roomNumber: "315",
            roomType: "Suite",
            checkOutDate: "2026-04-28",
            phone: "+1-234-567-8905",
            email: "sarah@example.com",
            totalBill: "$400",
            nights: 5,
        },
    ];

    const filteredGuests = checkOutGuests.filter(
        (guest) =>
            guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.roomNumber.includes(searchTerm)
    );

    const handleCheckOut = (guest) => {
        alert(`${guest.guestName} checked out successfully!`);
        setSelectedGuest(null);
    };

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Check-Out Management</h1>
                <p className="text-gray-600 text-sm md:text-base mt-2">Process guest check-outs and finalize billing</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-2.5 md:top-3 text-gray-400 text-lg md:text-xl" />
                    <input
                        type="text"
                        placeholder="Search by guest name or room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Check-Out Cards */}
            {filteredGuests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredGuests.map((guest) => (
                        <div key={guest.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                            <div className="flex items-start justify-between mb-4">
                                <div className="min-w-0">
                                    <h3 className="text-base md:text-lg font-bold text-gray-800">{guest.guestName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600">Room {guest.roomNumber}</p>
                                </div>
                                <span className="bg-orange-100 text-orange-800 px-2 md:px-3 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0">
                                    {guest.roomType}
                                </span>
                            </div>

                            <div className="space-y-2 md:space-y-3 mb-4 text-xs md:text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Check-Out:</span> {guest.checkOutDate}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Stay:</span> {guest.nights} nights
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Total Bill:</span> <span className="font-bold text-lg">{guest.totalBill}</span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Phone:</span> {guest.phone}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    onClick={() => handleCheckOut(guest)}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <MdLogout className="text-lg" />
                                    Check Out
                                </button>
                                <button
                                    onClick={() => setSelectedGuest(guest)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm md:text-base"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
                    <p className="text-gray-600 text-base md:text-lg">
                        {searchTerm ? "No guests found matching your search." : "No guests scheduled for check-out today."}
                    </p>
                </div>
            )}

            {/* Details Modal */}
            {selectedGuest && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">Billing Details</h2>
                            <button
                                onClick={() => setSelectedGuest(null)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                <MdClose />
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4 mb-6">
                            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                <p className="text-gray-600 text-xs md:text-sm font-medium">Guest Name</p>
                                <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{selectedGuest.guestName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Room</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{selectedGuest.roomNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Type</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{selectedGuest.roomType}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Nights</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{selectedGuest.nights}</p>
                                </div>
                                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">Check-Out</p>
                                    <p className="text-gray-800 font-semibold text-sm md:text-base mt-1">{selectedGuest.checkOutDate}</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 p-3 md:p-4 rounded-lg border-l-4 border-orange-500">
                                <p className="text-gray-600 text-xs md:text-sm font-medium">Total Bill</p>
                                <p className="text-orange-600 font-bold text-xl md:text-2xl mt-1">{selectedGuest.totalBill}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-xs md:text-sm font-medium">Email</p>
                                <p className="text-gray-800 font-semibold text-sm md:text-base mt-1 break-all">{selectedGuest.email}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCheckOut(selectedGuest)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm md:text-base"
                            >
                                Check Out
                            </button>
                            <button
                                onClick={() => setSelectedGuest(null)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-3 rounded-lg transition text-sm md:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
