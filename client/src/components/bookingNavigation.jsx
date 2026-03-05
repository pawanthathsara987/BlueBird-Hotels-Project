import { useState } from "react";

export default function BookingNavigation() {
    const [selectedHotel, setSelectedHotel] = useState("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [adultCount, setAdultCount] = useState(1);
    const [kidCount, setKidCount] = useState(0);
    const [guestOpen, setGuestOpen] = useState(false);

    const hotels = [
        { id: 1, name: "BlueBird Hotel Downtown" },
        { id: 2, name: "BlueBird Hotel Beach Resort" },
        { id: 3, name: "BlueBird Hotel Mountain View" },
        { id: 4, name: "BlueBird Hotel City Center" },
    ];
    return (
        <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%] bg-white absolute inset-x-0 mx-auto rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-between px-2 sm:px-3 md:px-5 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-5 lg:py-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 shadow-lg z-10">
            <div className="flex flex-col w-full sm:w-40 md:w-44 lg:w-48 xl:w-52">
                <label className="text-xs sm:text-sm md:text-base lg:text-base text-gray-700 mb-1">Hotel</label>
                <select
                    value={selectedHotel}
                    onChange={(e) => setSelectedHotel(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    <option value="">Choose a Hotel</option>
                    {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                            {hotel.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col w-full sm:w-36 md:w-40 lg:w-44 xl:w-48">
                <label className="text-xs sm:text-sm md:text-base lg:text-base text-gray-700 mb-1">Check-In</label>
                <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
            </div>
            <div className="flex flex-col w-full sm:w-36 md:w-40 lg:w-44 xl:w-48">
                <label className="text-xs sm:text-sm md:text-base lg:text-base text-gray-700 mb-1">Check-Out</label>
                <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
            </div>
            <div className="flex flex-col relative z-20 w-full sm:w-40 md:w-44 lg:w-48 xl:w-52">
                <label className="text-xs sm:text-sm md:text-base lg:text-base text-gray-700 mb-1">Guest</label>
                <button
                    type="button"
                    onClick={() => setGuestOpen((prev) => !prev)}
                    className="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-expanded={guestOpen}
                >
                    {adultCount} Adult{adultCount !== 1 ? "s" : ""}, {kidCount} Kid{kidCount !== 1 ? "s" : ""}
                </button>
                {guestOpen && (
                    <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 w-full sm:w-56 md:w-64 lg:w-72 xl:w-80 bg-white border border-gray-200 rounded-md shadow-lg p-3 sm:p-4 z-30 pointer-events-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm md:text-base text-gray-600">Adults</span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdultCount((prev) => Math.max(1, prev - 1))}
                                    className="w-8 h-8 border border-gray-300 rounded-md text-lg"
                                    aria-label="Decrease adults"
                                >
                                    -
                                </button>
                                <span className="w-6 text-center">{adultCount}</span>
                                <button
                                    type="button"
                                    onClick={() => setAdultCount((prev) => prev + 1)}
                                    className="w-8 h-8 border border-gray-300 rounded-md text-lg"
                                    aria-label="Increase adults"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs sm:text-sm md:text-base text-gray-600">Kids</span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setKidCount((prev) => Math.max(0, prev - 1))}
                                    className="w-8 h-8 border border-gray-300 rounded-md text-lg"
                                    aria-label="Decrease kids"
                                >
                                    -
                                </button>
                                <span className="w-6 text-center">{kidCount}</span>
                                <button
                                    type="button"
                                    onClick={() => setKidCount((prev) => prev + 1)}
                                    className="w-8 h-8 border border-gray-300 rounded-md text-lg"
                                    aria-label="Increase kids"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full sm:w-auto mt-6 flex justify-center">
                <button className="w-full sm:w-32 md:w-36 lg:w-40 xl:w-44 bg-blue-500 text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-2 md:py-2 text-xs sm:text-sm md:text-base rounded-md hover:bg-blue-600 transition-colors">
                    FIND ROOM
                </button>
            </div>
        </div>
    );
}