import axios from "axios";
import React, { useState, useEffect } from "react";
import { MdCheckCircle, MdPersonPin, MdHotel, MdCalendarToday } from "react-icons/md";

export default function Dashboard() {
    const [availableRooms, setAvailableRooms] = useState(0);
    const [todayCheckIns, setTodayCheckIns] = useState(0);
    const [todayCheckOuts, setTodayCheckOuts] = useState(0);
    const [occupiedRooms, setOccupiedRooms] = useState(0);
    const [recentCheckIns, setRecentCheckIns] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    const fetchAvailableRooms = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/available-rooms`);
            const result = response.data;
            setAvailableRooms(result?.data?.availableRoom || result?.data?.count || 0);
        } catch (error) {
            console.error("Error fetching available rooms:", error);
        }
    };

    const fetchTodayCheckIns = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/today-checkins`);
            const result = response.data;
            setTodayCheckIns(result?.data?.checkIns || result?.data?.count || 0);
        } catch (error) {
            console.error("Error fetching today check-ins:", error);
        }
    };

    const fetchTodayCheckOuts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/today-checkouts`);
            const result = response.data;
            setTodayCheckOuts(result?.data?.checkOuts || result?.data?.count || 0);
        } catch (error) {
            console.error("Error fetching today check-outs:", error);
        }
    };

    const fetchOccupiedRooms = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/occupied-rooms`);
            const result = response.data;
            setOccupiedRooms(result?.data?.occupiedRooms || result?.data?.count || 0);
        } catch (error) {
            console.error("Error fetching occupied rooms:", error);
        }
    };

    const fetchRecentCheckIns = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/recent-checkins`);
            const result = response.data;
            setRecentCheckIns(result?.data || []);
        } catch (error) {
            console.error("Error fetching recent check-ins:", error);
        }
    };

    const fetchRecentBookings = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/recent-bookings`);
            const result = response.data;
            setRecentBookings(result?.data || []);
        } catch (error) {
            console.error("Error fetching recent bookings:", error);
        }
    };

    useEffect(() => {
        fetchAvailableRooms();
        fetchTodayCheckIns();
        fetchTodayCheckOuts();
        fetchOccupiedRooms();
        fetchRecentCheckIns();
        fetchRecentBookings();
    }, []);

    const stats = [
        {
            label: "Today's Check-Ins",
            value: todayCheckIns,
            icon: MdCheckCircle,
            color: "bg-blue-500",
        },
        {
            label: "Today's Check-Outs",
            value: todayCheckOuts,
            icon: MdPersonPin,
            color: "bg-orange-500",
        },
        {
            label: "Available Rooms",
            value: availableRooms,
            icon: MdHotel,
            color: "bg-green-500",
        },
        {
            label: "Occupied Rooms",
            value: occupiedRooms,
            icon: MdCalendarToday,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reception Dashboard</h1>
                <p className="text-gray-600 text-sm md:text-base mt-2">Welcome back! Here's your overview for today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-600 text-xs md:text-sm font-medium">{stat.label}</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-2 md:p-3 rounded-lg ml-2 flex-shrink-0`}>
                                    <Icon className="text-white text-xl md:text-2xl" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Check-Ins */}
                <div className="bg-white p-5 rounded-2xl shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        Recent Check-Ins
                    </h2>

                    <div className="space-y-4">
                        {recentCheckIns.map((item) => (
                            <div
                                key={item.reservation_id}
                                className="border rounded-xl p-4 hover:shadow-md transition"
                            >
                                {/* HEADER */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-base">
                                            {item.firstName} {item.lastName}
                                        </h3>
                                    </div>

                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                        Checked In
                                    </span>
                                </div>

                                {/* ROOMS */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.rooms?.split(",").map((room, i) => (
                                        <span
                                            key={i}
                                            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md"
                                        >
                                            Room {room}
                                        </span>
                                    ))}
                                </div>

                                {/* DETAILS */}
                                <div className="mt-3 grid grid-cols-2 text-xs text-gray-600">
                                    <p>
                                        Check-In:{" "}
                                        <span className="font-medium text-gray-800">
                                            {item.checkIn}
                                        </span>
                                    </p>

                                    <p>
                                        Rooms:{" "}
                                        <span className="font-medium text-gray-800">
                                            {item.totalRooms}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
                    <div className="space-y-3 md:space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, index) => (
                                <div
                                    key={booking.reservation_id}
                                    className="border rounded-xl p-4 hover:shadow-md transition"
                                >
                                    {/* HEADER */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm md:text-base">
                                                {booking.firstName} {booking.lastName}
                                            </p>

                                            <p className="text-xs md:text-sm text-gray-600">
                                                Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <span className={`text-xs px-3 py-1 rounded-full ${
                                            booking.roomStatuses?.includes('checked_in') ? 'bg-green-100 text-green-800' :
                                            booking.roomStatuses?.includes('reserved') ? 'bg-blue-100 text-blue-800' :
                                            booking.roomStatuses?.includes('checked_out') ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {
                                                booking.roomStatuses?.includes('checked_in') ? 'Checked In' :
                                                booking.roomStatuses?.includes('reserved') ? 'Reserved' :
                                                booking.roomStatuses?.includes('checked_out') ? 'Checked Out' :
                                                'Pending'
                                            }
                                        </span>
                                    </div>

                                    {/* ROOMS */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {booking.rooms?.split(",").map((room, i) => (
                                            <span
                                                key={i}
                                                className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md"
                                            >
                                                Room {room}
                                            </span>
                                        ))}
                                    </div>

                                    {/* DETAILS */}
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p>
                                            Total Rooms:{" "}
                                            <span className="font-medium text-gray-800">
                                                {booking.totalRooms}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-sm">No recent bookings</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
