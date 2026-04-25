import React, { useState, useMemo } from "react";
import { MdCalendarToday, MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function Booking() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock booking data
    const allBookings = [
        {
            id: 1,
            guestName: "John Doe",
            roomNumber: "101",
            roomType: "Deluxe",
            checkInDate: "2026-04-23",
            checkOutDate: "2026-04-25",
            status: "Checked In",
            price: "$250",
            phone: "+1-234-567-8900",
        },
        {
            id: 2,
            guestName: "Jane Smith",
            roomNumber: "205",
            roomType: "Standard",
            checkInDate: "2026-04-23",
            checkOutDate: "2026-04-26",
            status: "Checked In",
            price: "$180",
            phone: "+1-234-567-8901",
        },
        {
            id: 3,
            guestName: "Michael Johnson",
            roomNumber: "312",
            roomType: "Suite",
            checkInDate: "2026-04-23",
            checkOutDate: "2026-04-27",
            status: "Pending",
            price: "$400",
            phone: "+1-234-567-8902",
        },
        {
            id: 4,
            guestName: "Emily Wilson",
            roomNumber: "104",
            roomType: "Deluxe",
            checkInDate: "2026-04-24",
            checkOutDate: "2026-04-26",
            status: "Confirmed",
            price: "$250",
            phone: "+1-234-567-8903",
        },
        {
            id: 5,
            guestName: "David Brown",
            roomNumber: "201",
            roomType: "Standard",
            checkInDate: "2026-04-25",
            checkOutDate: "2026-04-27",
            status: "Confirmed",
            price: "$180",
            phone: "+1-234-567-8904",
        },
        {
            id: 6,
            guestName: "Sarah Davis",
            roomNumber: "315",
            roomType: "Suite",
            checkInDate: "2026-04-23",
            checkOutDate: "2026-04-28",
            status: "Checked In",
            price: "$400",
            phone: "+1-234-567-8905",
        },
        {
            id: 7,
            guestName: "Robert Miller",
            roomNumber: "102",
            roomType: "Standard",
            checkInDate: "2026-04-24",
            checkOutDate: "2026-04-25",
            status: "Pending",
            price: "$180",
            phone: "+1-234-567-8906",
        },
        {
            id: 8,
            guestName: "Lisa Anderson",
            roomNumber: "208",
            roomType: "Deluxe",
            checkInDate: "2026-04-25",
            checkOutDate: "2026-04-29",
            status: "Confirmed",
            price: "$250",
            phone: "+1-234-567-8907",
        },
    ];

    // Filter bookings by date
    const filteredBookings = useMemo(() => {
        return allBookings.filter((booking) => {
            const matchesDate =
                booking.checkInDate === selectedDate || booking.checkOutDate === selectedDate;
            const matchesSearch =
                booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.roomNumber.includes(searchTerm);
            return matchesDate && matchesSearch;
        });
    }, [selectedDate, searchTerm]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Checked In":
                return "bg-green-100 text-green-800";
            case "Confirmed":
                return "bg-blue-100 text-blue-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Checked Out":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handlePreviousDate = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate.toISOString().split("T")[0]);
    };

    const handleNextDate = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate.toISOString().split("T")[0]);
    };

    const formatDate = (dateString) => {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", options);
    };

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bookings Management</h1>
                <p className="text-gray-600 text-sm md:text-base mt-2">View and manage all bookings filtered by date</p>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={handlePreviousDate}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Previous Date"
                        >
                            <MdChevronLeft className="text-xl md:text-2xl text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleNextDate}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Next Date"
                        >
                            <MdChevronRight className="text-xl md:text-2xl text-gray-600" />
                        </button>
                    </div>

                    {/* Search Box */}
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-2.5 md:top-3 text-gray-400 text-lg md:text-xl" />
                        <input
                            type="text"
                            placeholder="Search by guest name or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Date Display */}
                    <div className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-lg">
                        <MdCalendarToday className="text-blue-600 text-lg md:text-xl flex-shrink-0" />
                        <span className="text-blue-900 font-semibold text-sm md:text-base">{formatDate(selectedDate)}</span>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {filteredBookings.length > 0 ? (
                    <>
                        {/* Desktop Table - hidden on mobile */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Guest Name
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Room
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Room Type
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Check-In
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Check-Out
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Price
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                                            Phone
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking, index) => (
                                        <tr key={booking.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-800 font-medium">
                                                {booking.guestName}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                                                {booking.roomNumber}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                                                {booking.roomType}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                                                {formatDate(booking.checkInDate)}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                                                {formatDate(booking.checkOutDate)}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                                                <span
                                                    className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-800 font-semibold">
                                                {booking.price}
                                            </td>
                                            <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                                                {booking.phone}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - shown on mobile */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredBookings.map((booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b">
                                        <div>
                                            <p className="font-bold text-gray-800">{booking.guestName}</p>
                                            <p className="text-sm text-gray-600">Room {booking.roomNumber}</p>
                                        </div>
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                            <p className="text-gray-600 text-xs">Type</p>
                                            <p className="text-gray-800 font-medium">{booking.roomType}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-xs">Price</p>
                                            <p className="text-gray-800 font-medium">{booking.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-xs">Check-In</p>
                                            <p className="text-gray-800 font-medium text-xs">{formatDate(booking.checkInDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-xs">Check-Out</p>
                                            <p className="text-gray-800 font-medium text-xs">{formatDate(booking.checkOutDate)}</p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-2">
                                        <p className="text-xs text-gray-600">Phone: <span className="font-medium">{booking.phone}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-6 md:p-8 text-center">
                        <p className="text-gray-600 text-base md:text-lg">
                            No bookings found for {formatDate(selectedDate)}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm mt-2">Try selecting a different date or adjusting your search</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {filteredBookings.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-md p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="border-l-4 border-blue-500 pl-3 md:pl-4">
                            <p className="text-gray-600 text-xs md:text-sm">Total Bookings</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{filteredBookings.length}</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-3 md:pl-4">
                            <p className="text-gray-600 text-xs md:text-sm">Checked In</p>
                            <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">
                                {filteredBookings.filter((b) => b.status === "Checked In").length}
                            </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-3 md:pl-4">
                            <p className="text-gray-600 text-xs md:text-sm">Pending</p>
                            <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1">
                                {filteredBookings.filter((b) => b.status === "Pending").length}
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-600 pl-3 md:pl-4">
                            <p className="text-gray-600 text-xs md:text-sm">Confirmed</p>
                            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1">
                                {filteredBookings.filter((b) => b.status === "Confirmed").length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
