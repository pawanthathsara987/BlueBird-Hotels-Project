import React, { useState, useEffect } from "react";
import { MdSearch, MdCheckCircle, MdClose } from "react-icons/md";
import axios from "axios";

export default function CheckIn() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [pendingCheckIns, setPendingCheckIns] = useState([]);

    const fetchPendingCheckIns = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/reception/pending-checkins`
            );
            setPendingCheckIns(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPendingCheckIns();
    }, []);

    const filteredGuests = pendingCheckIns.filter((guest) => {
        const name = `${guest.firstName || ""} ${guest.lastName || ""}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleCheckIn = async (guest) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/reception/check-in/${guest.reservation_id}`
            );

            setSelectedGuest(null);
            fetchPendingCheckIns();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full px-6 py-6 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Check-In Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage today’s guest arrivals
                </p>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
                <MdSearch className="text-gray-400 text-2xl" />
                <input
                    className="w-full outline-none"
                    placeholder="Search guest name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuests.map((guest) => (
                    <div
                        key={guest.firstName + guest.lastName}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border border-gray-100"
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {guest.firstName} {guest.lastName}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Pending Check-in
                                </p>
                            </div>
                        </div>

                        {/* ROOMS */}
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">Rooms</p>

                            <div className="flex flex-wrap gap-2 mt-1">
                                {guest.rooms?.split(",").map((room, i) => (
                                    <span
                                        key={i}
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs"
                                    >
                                        Room {room}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                            <p>Check-in: <b>{guest.checkIn}</b></p>
                            <p>Total Rooms: <b>{guest.totalRooms}</b></p>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => handleCheckIn(guest)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                            >
                                <MdCheckCircle />
                                Check In
                            </button>

                            <button
                                onClick={() => setSelectedGuest(guest)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl"
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredGuests.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No pending check-ins found
                </div>
            )}

            {/* MODAL */}
            {selectedGuest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Guest Details</h2>
                            <button onClick={() => setSelectedGuest(null)}>
                                <MdClose size={22} />
                            </button>
                        </div>

                        <div className="space-y-2 text-gray-700">
                            <p><b>Name:</b> {selectedGuest.firstName} {selectedGuest.lastName}</p>
                            <p><b>Rooms:</b> {selectedGuest.rooms}</p>
                            <p><b>Total:</b> {selectedGuest.totalRooms}</p>
                            <p><b>Check-In:</b> {selectedGuest.checkIn}</p>
                        </div>

                        <button
                            onClick={() => handleCheckIn(selectedGuest)}
                            className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <MdCheckCircle />
                            Confirm Check-In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}