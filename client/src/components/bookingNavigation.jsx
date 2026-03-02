import { useState } from "react";

export default function BookingNavigation(){
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
    return(
        <div className="w-[80%] h-32.5 bg-white absolute -bottom-32.5 inset-x-0 mx-auto rounded-lg flex items-center px-6 gap-8">
                <div className="flex flex-col mb-5">
                    <label className="text-md text-gray-700 ">Hotel</label>
                    <select 
                        value={selectedHotel} 
                        onChange={(e) => setSelectedHotel(e.target.value)}
                        className="w-50 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <option value="">Choose a Hotel</option>
                        {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col mb-5">
                    <label className="text-md text-gray-700 ">Check-In</label>
                    <input 
                        type="date" 
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
                <div className="flex flex-col mb-5">
                    <label className="text-md text-gray-700 ">Check-Out</label>
                    <input 
                        type="date" 
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
                <div className="flex flex-col relative z-20 mb-5">
                    <label className="text-md text-gray-700 ">Guest</label>
                    <button
                        type="button"
                        onClick={() => setGuestOpen((prev) => !prev)}
                        className="w-37.5 px-4 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-expanded={guestOpen}
                    >
                        {adultCount} Adult{adultCount !== 1 ? "s" : ""}, {kidCount} Kid{kidCount !== 1 ? "s" : ""}
                    </button>
                    {guestOpen && (
                        <div className="absolute top-18 left-0 w-65 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-30 pointer-events-auto">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Adults</span>
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
                                <span className="text-sm text-gray-600">Kids</span>
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
                <div className="flex flex-col justify-end">
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                        FIND ROOM
                    </button>
                </div>
            </div>
    );
}