import React from 'react';
import { X, Check, Star, BedDouble, UserCheck } from 'lucide-react';

export default function RoomDetailsModal({
  selectedRoom,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  onPrevImage,
  onNextImage
}) {
  if (!selectedRoom) return null;
  const imageCount = Math.max(1, Number(selectedRoom.images) || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl lg:max-w-5xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-30 rounded-full bg-white p-1.5 shadow-lg transition-all hover:bg-gray-100 sm:right-4 sm:top-4 sm:p-2"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar">
          
          {/* Image Carousel */}
          <div className="relative h-44 overflow-hidden sm:h-72 lg:h-96">
            <img
              src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=600&fit=crop`}
              alt={selectedRoom.type}
              className="h-full w-full object-cover"
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={onPrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all hover:bg-white sm:left-4 sm:p-2.5"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all hover:bg-white sm:right-4 sm:p-2.5"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
              {[...Array(imageCount)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all sm:h-2 ${
                    idx === currentImageIndex ? 'w-6 bg-white sm:w-8' : 'w-1.5 bg-white/50 sm:w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8">
            
            {/* Room Title & Type */}
            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-4xl">
                  {selectedRoom.type}
                </h2>
                <p className="text-sm text-gray-600 sm:text-lg">{selectedRoom.description2}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 sm:px-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-sm font-bold text-gray-900 sm:text-base">4.8</p>
                  <p className="text-xs text-gray-600">(245 reviews)</p>
                </div>
              </div>
            </div>

            {/* Room Information Grid */}
            <div className="mb-6 grid gap-3 rounded-xl bg-gray-50 p-4 sm:mb-8 sm:gap-6 sm:p-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                  <UserCheck className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Max Guests</p>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{selectedRoom.maxGuests}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                  <BedDouble className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Room Size</p>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{selectedRoom.roomSize}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Check-In</p>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{selectedRoom.checkIn}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Check-Out</p>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{selectedRoom.checkOut}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 sm:mb-8 sm:gap-3 sm:p-4">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-8 sm:w-8">
                <Check className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
              </div>
              <p className="text-xs font-medium text-green-800 sm:text-sm">{selectedRoom.cancel}</p>
            </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs text-gray-500 sm:text-sm">Price per night</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 sm:text-4xl">${selectedRoom.price}</span>
                <span className="text-sm text-gray-500 sm:text-lg">/night</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
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
