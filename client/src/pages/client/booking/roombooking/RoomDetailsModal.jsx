import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  X, Check, Star, BedDouble, UserCheck, Clock3, ShieldCheck, 
  Sparkles, CalendarDays
} from 'lucide-react';

// Room Details Modal component that escapes CSS transform scopes using a React Portal.

export default function RoomDetailsModal({ selectedRoom, onClose }) {
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Safe extraction of variables that might be needed in hooks dependency array
  const roomImage = selectedRoom?.image || selectedRoom?.pimage || "";

  useEffect(() => {
    if (!selectedRoom) return;

    // If the room object directly contains predefined images/imageList (e.g. mock roomTypes)
    if (selectedRoom.imageList && Array.isArray(selectedRoom.imageList)) {
      setImageList(selectedRoom.imageList);
      setLoading(false);
      return;
    }
    if (selectedRoom.images && Array.isArray(selectedRoom.images)) {
      setImageList(selectedRoom.images);
      setLoading(false);
      return;
    }

    if (!selectedRoom.id) {
      setImageList(roomImage ? [roomImage] : []);
      setLoading(false);
      return;
    }

    const getPackageImages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/admin/packageimage/${selectedRoom.id}`
        );
        const images = response?.data?.data;

        if (!Array.isArray(images) || images.length === 0) {
          setImageList(roomImage ? [roomImage] : []);
        } else {
          setImageList(images.map((img) => img.url ?? img.imageUrl ?? img));
        }
      } catch (error) {
        console.error('Failed to fetch package images:', error);
        setImageList(roomImage ? [roomImage] : []);
      } finally {
        setLoading(false);
      }
    };

    getPackageImages();
    setCurrentIndex(0);
  }, [selectedRoom?.id, roomImage]);

  const canSlide = imageList.length > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }, [imageList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }, [imageList.length]);

  // Keyboard navigation support
  useEffect(() => {
    if (!selectedRoom || !canSlide) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedRoom, canSlide, handlePrev, handleNext, onClose]);

  // Early return placed AFTER all hooks have run!
  if (!selectedRoom) return null;

  // Resolve naming conventions for backend/frontend fields
  const roomName = selectedRoom.name || selectedRoom.pname || "Island Luxury Room";
  
  // Robust price parsing to handle string prices like "$250" or "$1,250" from mock models
  const parsePrice = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const cleanStr = String(val).replace(/[^0-9.]/g, '');
    return Number(cleanStr) || 0;
  };

  const roomPrice = parsePrice(selectedRoom.price || selectedRoom.pprice || 0);
  const roomOriginalPrice = parsePrice(selectedRoom.originalPrice || selectedRoom.pprice || selectedRoom.price || 0);
  const roomDiscount = Number(selectedRoom.discount || 0);
  const roomDescription = selectedRoom.description || selectedRoom.pdescription || "Indulge in unmatched comfort and premium amenities in this beautifully designed five-star room.";
  const roomDescription2 = selectedRoom.description2 || selectedRoom.tagline || "Experience signature luxury with breathtaking coastal details.";
  
  const roomGuests = selectedRoom.maxGuests || selectedRoom.maxOccupancy || 
    (selectedRoom.maxAdults ? `${selectedRoom.maxAdults} Adults ${selectedRoom.maxKids ? `& ${selectedRoom.maxKids} Kids` : ""}` : "3 Guests");
  
  const roomSize = selectedRoom.roomSize || selectedRoom.size || "45 m² / 484 sq ft";
  const roomCheckIn = selectedRoom.checkIn || "2:00 PM";
  const roomCheckOut = selectedRoom.checkOut || "12:00 PM";

  const roomCancellationPolicy = selectedRoom.cancellationPolicy || selectedRoom.cancelPolicy || 
    "Free cancellation up to 48 hours prior to arrival.";
  const roomPaymentPolicy = selectedRoom.paymentPolicy || 
    "No prepayment required. Secure your booking online and pay at the hotel.";

  const currentImage = imageList[currentIndex] ?? roomImage;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/75 p-2 backdrop-blur-xs sm:p-4 animate-fadeIn">
      <div className="relative flex h-[94vh] w-[96vw] max-w-6xl flex-col md:flex-row overflow-hidden rounded-3xl border border-stone-250/10 bg-white shadow-[0_25px_60px_rgba(28,25,23,0.25)] transition-all duration-300 animate-slideUp">
        
        {/* Floating Close Button - Always visible on desktop and mobile */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 z-50 rounded-full bg-white/90 p-2 text-stone-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-emerald-850 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-stone-200/50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Left Side: Interactive Media Hub ── */}
        <div className="w-full md:w-[45%] h-56 md:h-auto shrink-0 relative bg-stone-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100">
          
          <div className="absolute inset-0 z-0">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/20 border-t-white" />
              </div>
            ) : (
              <img
                key={currentIndex}
                src={currentImage}
                alt={`${roomName} – View ${currentIndex + 1}`}
                className="h-full w-full object-cover transition-opacity duration-300 animate-fadeIn"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/20 pointer-events-none" />
          </div>

          {/* Carousel Chevrons */}
          {canSlide && (
            <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous image"
                className="pointer-events-auto rounded-xl bg-white/95 p-2 text-stone-700 shadow-lg hover:text-emerald-850 hover:bg-white active:scale-90 transition-all cursor-pointer border border-stone-200/30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next image"
                className="pointer-events-auto rounded-xl bg-white/95 p-2 text-stone-700 shadow-lg hover:text-emerald-850 hover:bg-white active:scale-90 transition-all cursor-pointer border border-stone-200/30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Top Info overlay */}
          <div className="relative z-10 p-4 flex justify-between items-start w-full">
            {imageList.length > 1 && (
              <span className="rounded-lg bg-stone-900/60 px-2.5 py-1 text-xs font-black tracking-wider text-white backdrop-blur-xs uppercase">
                Image {currentIndex + 1} / {imageList.length}
              </span>
            )}
            <span className="bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1 backdrop-blur-xs ml-auto">
              <Sparkles className="w-3 h-3 text-emerald-250 animate-pulse" /> Luxury
            </span>
          </div>

          {/* Bottom Thumbnails Preview (Desktop only) */}
          {imageList.length > 1 && (
            <div className="relative z-10 p-4 mt-auto hidden md:flex items-center gap-2 overflow-x-auto scrollbar-none bg-gradient-to-t from-stone-950/80 to-transparent w-full">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-12 h-10 rounded-lg overflow-hidden shrink-0 transition-all duration-300 border-2 cursor-pointer ${
                    idx === currentIndex ? 'border-emerald-500 scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Side: Immersive Specifications ── */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
          
          {/* Scrollable details wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 md:p-8 pr-12 md:pr-14 space-y-6">
            
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-4.5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight">
                  {roomName}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-semibold leading-relaxed">
                  {roomDescription2}
                </p>
              </div>
            </div>

            {/* Comprehensive Room Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-405">About this suite</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-600 font-medium">
                {roomDescription}
              </p>
            </div>

            {/* Premium Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-stone-50 p-4 border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                  <UserCheck className="h-4.5 w-4.5 text-emerald-850" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-stone-450 leading-none mb-1">Max Occupancy</p>
                  <p className="text-xs font-bold text-stone-800 leading-none">{roomGuests}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                  <BedDouble className="h-4.5 w-4.5 text-emerald-850" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-stone-450 leading-none mb-1">Room Dimensions</p>
                  <p className="text-xs font-bold text-stone-800 leading-none">{roomSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                  <Clock3 className="h-4.5 w-4.5 text-emerald-850" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-stone-450 leading-none mb-1">Premium Check-In</p>
                  <p className="text-xs font-bold text-stone-800 leading-none">{roomCheckIn}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                  <svg className="h-4.5 w-4.5 text-emerald-850" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-stone-450 leading-none mb-1">Standard Check-Out</p>
                  <p className="text-xs font-bold text-stone-800 leading-none">{roomCheckOut}</p>
                </div>
              </div>
            </div>

            {/* Curated Luxury Amenities Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-405">Included Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {Array.isArray(selectedRoom.features) && selectedRoom.features.length > 0 ? (
                  selectedRoom.features.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-stone-50/50 hover:bg-stone-50 border border-stone-200/50 px-3 py-2 rounded-xl transition duration-200 animate-fadeIn">
                      <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                      <span className="text-xs font-extrabold text-stone-700 truncate leading-snug">{name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-450 italic col-span-full">No specific amenities configured for this suite.</p>
                )}
              </div>
            </div>

            {/* Cancellation & Payment Policy Card */}
            <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
              
              <div className="flex gap-3 bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl shadow-3xs hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-850 shadow-3xs">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-stone-450 leading-none">Cancellation Policy</p>
                  <p className="text-xs leading-relaxed text-stone-600 font-bold">{roomCancellationPolicy}</p>
                </div>
              </div>

              <div className="flex gap-3 bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl shadow-3xs hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-850 shadow-3xs">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-stone-450 leading-none">Payment Policy</p>
                  <p className="text-xs leading-relaxed text-stone-600 font-bold">{roomPaymentPolicy}</p>
                </div>
              </div>

            </div>

          </div>

          {/* ── Immersive Footer Sizing ── */}
          <div className="shrink-0 border-t border-stone-150 bg-stone-50/50 px-4 py-3.5 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex flex-col w-full sm:w-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-stone-450 leading-none mb-1">Total Stay Value</span>
              <div className="flex items-baseline gap-1.5 leading-none">
                {roomDiscount > 0 && roomOriginalPrice > roomPrice && (
                  <span className="text-xs font-bold text-stone-400 line-through">${roomOriginalPrice.toFixed(2)}</span>
                )}
                <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">${roomPrice.toFixed(2)}</span>
                <span className="text-xs font-bold text-stone-500">/ night</span>
              </div>
              {roomDiscount > 0 && (
                <p className="mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 self-start">{roomDiscount}% discount applied</p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial rounded-xl border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 px-5 py-3 text-xs font-bold text-stone-700 transition cursor-pointer active:scale-95 shadow-3xs"
              >
                Close
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-950 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(6,95,70,0.15)]"
              >
                Confirm Room Choice
              </button>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f5f5f4; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { transform: translateY(30px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-fadeIn { animation: fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideUp { animation: slideUp 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>,
    document.body
  );
}