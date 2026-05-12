import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdLogout, MdClose } from "react-icons/md";

export default function CheckOut() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [checkOutGuests, setCheckOutGuests] = useState([]);

    const fetchCheckOuts = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/reception/pending-checkouts`
            );

            setCheckOutGuests(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCheckOuts();
    }, []);

    const filteredGuests = checkOutGuests.filter((g) => {
        const name = `${g.firstName} ${g.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleCheckOut = async (guest) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/reception/bookings/${guest.booking_id}/checkout`
            );

            setSelectedGuest(null);
            fetchCheckOuts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full px-6 py-6 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Check-Out Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage guest departures
                </p>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
                <MdSearch className="text-gray-400 text-2xl" />
                <input
                    className="w-full outline-none"
                    placeholder="Search guest..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuests.map((guest) => (
                    <div
                        key={guest.booking_id}
                        className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
                    >
                        <h2 className="text-lg font-bold text-gray-800">
                            {guest.firstName} {guest.lastName}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Room {guest.roomNumber}
                        </p>

                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                            <p>Check-out: <b>{guest.checkOut}</b></p>
                            <p>Nights: <b>{guest.nights}</b></p>
                        </div>

                        <button
                            onClick={() => setSelectedGuest(guest)}
                            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl"
                        >
                            Process Checkout
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {selectedGuest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6">

                        <div className="flex justify-between mb-4">
                            <h2 className="font-bold text-lg">Confirm Check-Out</h2>
                            <button onClick={() => setSelectedGuest(null)}>
                                <MdClose />
                            </button>
                        </div>

                        <p className="text-gray-700">
                            {selectedGuest.firstName} {selectedGuest.lastName}
                        </p>

                        <p className="text-sm text-gray-500">
                            Room {selectedGuest.roomNumber}
                        </p>

                        <button
                            onClick={() => handleCheckOut(selectedGuest)}
                            className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl flex justify-center gap-2"
                        >
                            <MdLogout />
                            Confirm Check-Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}