import React, { useState, useEffect } from 'react';
import {
  BedDouble, UserCheck, Home,
  X, Check, Wifi, Wind, Waves, MapPin, Info
} from 'lucide-react';

export default function BookingRoom() {

  /* =========================
      STATE
  ========================== */

  const [rooms, setRooms] = useState([
    { id: 1, type: "Deluxe Double Room", adults: 2, kids: 0, price: 156, quantity: 8 },
    { id: 2, type: "Double Room with Balcony", adults: 2, kids: 0, price: 175, quantity: 0 },
    { id: 3, type: "Superior Family Room", adults: 2, kids: 2, price: 196, quantity: 2 },
  ]);

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
      ICON MAPPING
  ========================== */

  const getFeatureIcon = (feature) => {
    const iconMap = {
      Balcony: MapPin,
      "Garden View": Waves,
      "Ocean View": Waves,
      "Air Conditioner": Wind,
      "Free Wifi": Wifi
    };
    return iconMap[feature] || MapPin;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900">
            ROOM ASSIGNMENT FOR YOUR GROUP
          </h1>
          <p className="text-gray-600 mt-3">
            Automatically assign rooms for you by system
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <SummaryCard icon={<Home />} label="Rooms" value={totalRooms} />
          <SummaryCard icon={<UserCheck />} label="Adults" value={totalAdults} />
          <SummaryCard icon={<UserCheck />} label="Children" value={totalKids} />
        </div>

        {/* ROOM ASSIGNMENT BLOCK */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Room Assignment</h2>
            </div>

            {/* Mobile View - Cards */}
            <div className="block lg:hidden space-y-4">
                {rooms.map(room => (
                <div key={room.id} className="border-2 border-gray-200 rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-3">{room.type}</h3>
                    
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
                        <span className="font-semibold ml-2">${room.price}</span>
                    </div>
                    </div>

                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rooms:</span>
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
                <div className="bg-blue-50 rounded-xl p-4 font-bold flex justify-between items-center">
                <span className="text-lg">Total</span>
                <span className="text-xl">${totalPrice}</span>
                </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-blue-50">
                    <tr>
                    <th className="p-4 text-left">Room Type</th>
                    <th className="p-4 text-center">Adults</th>
                    <th className="p-4 text-center">Kids</th>
                    <th className="p-4 text-center">Price</th>
                    <th className="p-4 text-center">Rooms</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                    <tr key={room.id} className="border-t">
                        <td className="p-4">{room.type}</td>
                        <td className="p-4 text-center">{room.adults}</td>
                        <td className="p-4 text-center">{room.kids}</td>
                        <td className="p-4 text-center">${room.price}</td>
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

                    <tr className="bg-blue-50 font-bold">
                    <td colSpan="3" className="p-4">Total</td>
                    <td colSpan="2" className="p-4 text-right">${totalPrice}</td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* BOOK NOW BUTTON */}
            <div className="mt-6 flex justify-end">
                <button 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                onClick={() => alert('Proceeding to booking...')}
                >
                Book Now
                </button>
            </div>
        </div>

        {/* ROOM CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          {roomType.map((room, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              
              {/* Room Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop`}
                  alt={room.type}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Featured
                </div>
              </div>

              {/* Room Info */}
              <div className="p-5 border-t-4 border-blue-500">
                
                {/* Room Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 border-b-2 border-dotted border-gray-300 pb-2">
                  {room.type}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-3">
                  {room.description}
                </p>

                {/* Guest Info */}
                <p className="text-sm text-gray-600 mb-2">
                  {room.description2}
                </p>

                {/* Cancellation */}
                <p className="text-sm text-gray-600 mb-4">
                  {room.cancel}
                </p>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${room.price}</span>
                    <span className="text-sm text-gray-600">/night</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{room.cancelDate}</p>
                </div>

                {/* Info Button */}
                <button
                  onClick={() => openModal(room)}
                  className="w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center ml-auto transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-30 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all">
                <X className="w-6 h-6" />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto custom-scrollbar">
                
                {/* Image Carousel */}
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=600&fit=crop`}
                    alt={selectedRoom.type}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Carousel Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {[...Array(selectedRoom.images)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  
                  {/* Room Title & Type */}
                  <div className="mb-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                      {selectedRoom.type}
                    </h2>
                    <p className="text-gray-600 text-lg">{selectedRoom.description2}</p>
                  </div>

                  {/* Main Features Pills */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Key Features</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedRoom.mainFeatures.map((feature, idx) => {
                        const Icon = getFeatureIcon(feature);
                        return (
                          <div key={idx} className="flex items-center gap-2.5 px-5 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                            <Icon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Information Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Max Guests</p>
                        <p className="text-base font-semibold text-gray-900">{selectedRoom.maxGuests}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BedDouble className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Room Size</p>
                        <p className="text-base font-semibold text-gray-900">{selectedRoom.roomSize}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Check-In</p>
                        <p className="text-base font-semibold text-gray-900">{selectedRoom.checkIn}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Check-Out</p>
                        <p className="text-base font-semibold text-gray-900">{selectedRoom.checkOut}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-800">{selectedRoom.cancel}</p>
                  </div>

                  {/* Room Amenities */}
                  <div className="mb-32">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Room Amenities</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                      {selectedRoom.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      ))}
                      {/* Additional amenities */}
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Socket near the bed</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Tile/marble floor</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Desk</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Seating area</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Private entrance</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Alarm clock</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Wardrobe or closet</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Carpeted</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Electric kettle</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Fan</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Outdoor furniture</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Cable channels</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Towels/sheets (extra fee)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Board games/puzzles</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Books & DVDs for children</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price per night</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">${selectedRoom.price}</span>
                      <span className="text-lg text-gray-500">/night</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
          </div>
        )}

      </div>
    </div>
  );
}

/* SUMMARY CARD COMPONENT */
function SummaryCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
      <div className="text-blue-600">{icon}</div>
      <div className="text-right">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}