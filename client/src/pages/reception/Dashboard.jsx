import React, { useState, useEffect } from "react";
import { MdCheckCircle, MdPersonPin, MdHotel, MdCalendarToday } from "react-icons/md";

export default function Dashboard() {
    const [availableRooms, setAvailableRooms] = useState(0);

    useEffect(() => {
        gettodayAvailableRooms().then((rooms) => {
            if (rooms !== null) {
                setAvailableRooms(rooms);
            }
        });
    }, []);

    async function gettodayAvailableRooms() {
        try {
            const response = await fetch("http://localhost:3002/api/reception/available-rooms", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                return result.data.availableRoom;
            } else {
                console.error("API Error:", result.message);
                return null;
            }
        } catch (error) {
            console.error("Error fetching available rooms:", error);
            return null;
        }
    }

    const stats = [
        {
            label: "Today's Check-Ins",
            value: "12",
            icon: MdCheckCircle,
            color: "bg-blue-500",
        },
        {
            label: "Today's Check-Outs",
            value: "8",
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
            label: "Pending Bookings",
            value: "5",
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
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Check-Ins</h2>
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between pb-3 md:pb-4 border-b">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">John Doe</p>
                                <p className="text-xs md:text-sm text-gray-600">Room 101</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">10:30 AM</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 md:pb-4 border-b">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">Jane Smith</p>
                                <p className="text-xs md:text-sm text-gray-600">Room 205</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">11:15 AM</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">Michael Johnson</p>
                                <p className="text-xs md:text-sm text-gray-600">Room 312</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">12:45 PM</span>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between pb-3 md:pb-4 border-b">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">Emily Wilson</p>
                                <p className="text-xs md:text-sm text-gray-600">Check-in: Apr 25</p>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">Confirmed</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 md:pb-4 border-b">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">David Brown</p>
                                <p className="text-xs md:text-sm text-gray-600">Check-in: Apr 26</p>
                            </div>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">Pending</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">Sarah Davis</p>
                                <p className="text-xs md:text-sm text-gray-600">Check-in: Apr 27</p>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">Confirmed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
