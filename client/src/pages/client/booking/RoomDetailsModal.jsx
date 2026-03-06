import React from 'react';
import { X, Check, Star, BedDouble, UserCheck, MapPin, Wifi, Wind, Waves } from 'lucide-react';

export default function RoomDetailsModal({
  selectedRoom,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  onPrevImage,
  onNextImage
}) {
  if (!selectedRoom) return null;

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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
        >
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
              onClick={onPrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg transition-all"
            >
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
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {selectedRoom.type}
                </h2>
                <p className="text-gray-600 text-lg">{selectedRoom.description2}</p>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-600">(245 reviews)</p>
                </div>
              </div>
            </div>

            {/* Main Features Pills */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Key Features</h3>
              <div className="flex flex-wrap gap-3">
                {selectedRoom.mainFeatures.map((feature, idx) => {
                  const Icon = getFeatureIcon(feature);
                  return (
                    <div key={idx} className="flex items-center gap-2.5 px-5 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-default">
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
                {[
                  'Socket near the bed',
                  'Tile/marble floor',
                  'Desk',
                  'Seating area',
                  'Private entrance',
                  'Alarm clock',
                  'Wardrobe or closet',
                  'Carpeted',
                  'Electric kettle',
                  'Fan',
                  'Outdoor furniture',
                  'Cable channels',
                  'Towels/sheets (extra fee)',
                  'Board games/puzzles',
                  'Books & DVDs for children'
                ].map((amenity, idx) => (
                  <div key={`extra-${idx}`} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </div>
                ))}
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
  );
}
