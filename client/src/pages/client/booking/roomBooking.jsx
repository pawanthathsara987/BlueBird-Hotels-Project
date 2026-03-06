import React, { useState, useEffect } from 'react';
import {
  UserCheck, Home,
  Grid3x3, List, Star
} from 'lucide-react';
import { RoomDetailsModal, RoomCard, RoomCardList } from './RoomViewingPanel';

export default function BookingRoom() {

  /* =========================
      STATE
  ========================== */

  const [rooms, setRooms] = useState([
    { id: 1, type: "Deluxe Double Room", adults: 2, kids: 0, price: 156, quantity: 8, rating: 4.8, reviews: 245, availability: 8, discount: 0 },
    { id: 2, type: "Double Room with Balcony", adults: 2, kids: 0, price: 175, quantity: 0, rating: 4.9, reviews: 312, availability: 3, discount: 15 },
    { id: 3, type: "Superior Family Room", adults: 2, kids: 2, price: 196, quantity: 2, rating: 4.7, reviews: 189, availability: 2, discount: 10 },
  ]);

  // View State
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =========================
      SCROLL LOCK
  ========================== */
  useEffect(() => {
    document.body.style.overflow = selectedRoom ? "hidden" : "unset";
  }, [selectedRoom]);


  /* =========================
      ROOM TYPE DATA
  ========================== */

  const roomType = [
    {
      type: "Deluxe Double Room",
      description: "King bed, private balcony, oceanfront bath, smart lighting.",
      description2: "4 Adults - Breakfast Included",
      cancel: "Free Cancel - Up to 4 days",
      cancelDate: "Free cancel until March 14, 2026",
      price: 156,
      date: "March 14, 2028",
      mainFeatures: ["Balcony", "Garden View", "Air Conditioner", "Free Wifi"],
      amenities: ["Free toiletries", "Toilet", "Bath or shower", "TV", "Hairdryer"],
      maxGuests: "4 (4 Adults, 2 Children)",
      roomSize: "72m²",
      checkIn: "2.00 PM",
      checkOut: "12.00 PM",
      images: 5
    },
    {
      type: "Double Room with Balcony",
      description: "King bed, private balcony, oceanfront bath, smart lighting.",
      description2: "2 Adults - Breakfast Included",
      cancel: "Free Cancel - Up to 4 days",
      cancelDate: "Free cancel until March 14, 2026",
      price: 175,
      date: "March 14, 2028",
      mainFeatures: ["Balcony", "Ocean View", "Air Conditioner", "Free Wifi"],
      amenities: ["Free toiletries", "Toilet", "Bath or shower", "TV", "Hairdryer"],
      maxGuests: "2 (2 Adults, 0 Children)",
      roomSize: "68m²",
      checkIn: "2.00 PM",
      checkOut: "12.00 PM",
      images: 5
    },
    {
      type: "Superior Family Room",
      description: "King bed, private balcony, oceanfront bath, smart lighting.",
      description2: "2 Adults - Breakfast Included",
      cancel: "Free Cancel - Up to 4 days",
      cancelDate: "Free cancel until March 14, 2026",
      price: 196,
      date: "March 14, 2028",
      mainFeatures: ["Balcony", "Garden View", "Air Conditioner", "Free Wifi"],
      amenities: ["Free toiletries", "Toilet", "Bath or shower", "TV", "Hairdryer"],
      maxGuests: "4 (4 Adults, 2 Children)",
      roomSize: "85m²",
      checkIn: "2.00 PM",
      checkOut: "12.00 PM",
      images: 5
    }
  ];

  /* =========================
      QUANTITY UPDATE
  ========================== */

  const updateQuantity = (id, change) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === id
          ? { ...room, quantity: Math.max(0, room.quantity + change) }
          : room
      )
    );
  };

  const handleQuantityInput = (id, value) => {
    const numValue = parseInt(value) || 0;
    setRooms(prev =>
      prev.map(room =>
        room.id === id
          ? { ...room, quantity: Math.max(0, numValue) }
          : room
      )
    );
  };

  /* =========================
      TOTALS
  ========================== */

  const totalRooms = rooms.reduce((sum, r) => sum + r.quantity, 0);
  const totalPrice = rooms.reduce((sum, r) => sum + r.quantity * r.price, 0);
  const totalAdults = rooms.reduce((sum, r) => sum + r.quantity * r.adults, 0);
  const totalKids = rooms.reduce((sum, r) => sum + r.quantity * r.kids, 0);

  /* =========================
      MODAL FUNCTIONS
  ========================== */

  const openModal = (room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % selectedRoom.images);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      (prev - 1 + selectedRoom.images) % selectedRoom.images
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-2">
            DISCOVER OUR ROOMS
          </h1>
          <p className="text-gray-600 text-lg">
            Find the perfect room for your stay with our interactive booking system
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <SummaryCard icon={<Home />} label="Rooms" value={totalRooms} color="blue" />
          <SummaryCard icon={<UserCheck />} label="Adults" value={totalAdults} color="green" />
          <SummaryCard icon={<UserCheck />} label="Children" value={totalKids} color="purple" />
        </div>

        {/* ROOM ASSIGNMENT BLOCK */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl mb-12 border-t-4 border-blue-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Room Assignment</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline">
                  View Pricing Details
                </button>
            </div>

            {/* Mobile View - Cards */}
            <div className="block lg:hidden space-y-4">
                {rooms.map(room => (
                <div key={room.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{room.type}</h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-800">{room.rating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                        <span className="text-gray-500">Adults:</span>
                        <span className="font-semibold ml-2">{room.adults}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Kids:</span>
                        <span className="font-semibold ml-2">{room.kids}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-semibold ml-2 text-blue-600">${room.price}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Free:</span>
                        <span className="font-semibold ml-2 text-green-600">{room.availability}</span>
                    </div>
                    </div>

                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rooms to book:</span>
                    <div className={"inline-flex items-center rounded-lg border-2 border-blue-400"}>
                        <button
                          onClick={() => updateQuantity(room.id, -1)}
                          className={`px-4 py-2 font-bold text-blue-600 hover:bg-blue-100`}
                        >
                        −
                        </button>
                        <input
                        type="number"
                        value={room.quantity}
                        onChange={(e) => handleQuantityInput(room.id, e.target.value)}
                        className={`w-16 text-center font-bold bg-transparent outline-none text-gray-900
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        min="0"
                        />
                        <button
                        onClick={() => updateQuantity(room.id, 1)}
                        className={`px-4 py-2 font-bold text-blue-600 hover:bg-blue-100`}>
                        +
                        </button>
                    </div>
                    </div>
                </div>
                ))}

                {/* Mobile Total */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 font-bold flex justify-between items-center border-2 border-blue-200">
                <span className="text-lg">Total</span>
                <span className="text-2xl text-blue-600">${totalPrice}</span>
                </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full rounded-xl overflow-hidden border border-gray-200">
                <thead className="bg-linear-to-r from-blue-50 to-indigo-50">
                    <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Room Type</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Rating</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Adults</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Kids</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Price</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Available</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Rooms</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                    <tr key={room.id} className="border-t hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{room.type}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-800">{room.rating}</span>
                            <span className="text-xs text-gray-500">({room.reviews})</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">{room.adults}</td>
                        <td className="p-4 text-center">{room.kids}</td>
                        <td className="p-4 text-center font-bold text-blue-600">${room.price}</td>
                        <td className="p-4 text-center font-semibold text-green-600">{room.availability}</td>
                        <td className="p-4 text-center">
                        <div className={`inline-flex items-center rounded-lg border-2 border-blue-400`}>
                            <button
                              onClick={() => updateQuantity(room.id, -1)}
                              className={`px-4 py-2 font-bold text-blue-600 hover:bg-blue-100`}>
                              −
                            </button>
                            <input
                              type="number"
                              value={room.quantity}
                              onChange={(e) => handleQuantityInput(room.id, e.target.value)}
                              className={`w-16 text-center font-bold bg-transparent outline-none text-gray-900
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                              min="0"
                            />
                            <button
                            onClick={() => updateQuantity(room.id, 1)}
                            className={`px-4 py-2 font-bold text-blue-600 hover:bg-blue-100`}>
                            +
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}

                    <tr className="bg-linear-to-r from-blue-100 to-indigo-100 font-bold">
                    <td colSpan="5" className="p-4 text-right">Total Price</td>
                    <td colSpan="2" className="p-4 text-right text-2xl text-blue-600">${totalPrice}</td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* BOOK NOW BUTTON */}
            <div className="mt-6 flex justify-end gap-3">
                <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl transition-colors"
                onClick={() => window.location.reload()}
                >
                Clear Selection
                </button>
                <button 
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
                onClick={() => alert('Proceeding to booking...')}
                >
                Book Now →
                </button>
            </div>
        </div>

        {/* ROOMS SECTION */}
        <div>
          {/* MAIN CONTENT */}
          <div>
            
            {/* View Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ROOM CARDS */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {roomType.map((room, index) => {
                  const roomData = rooms.find(r => r.type === room.type);
                  return (
                    <RoomCard
                      key={index}
                      room={room}
                      roomData={roomData}
                      onViewDetails={() => openModal(room)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {roomType.map((room, index) => {
                  const roomData = rooms.find(r => r.type === room.type);
                  return (
                    <RoomCardList
                      key={index}
                      room={room}
                      roomData={roomData}
                      onViewDetails={() => openModal(room)}
                    />
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* MODAL */}
        <RoomDetailsModal
          selectedRoom={selectedRoom}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          onClose={closeModal}
          onPrevImage={prevImage}
          onNextImage={nextImage}
        />

      </div>
    </div>
  );
}

/* SUMMARY CARD COMPONENT */
function SummaryCard({ icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
      <div className={`${colorClasses[color]} text-3xl mb-2`}>{icon}</div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}