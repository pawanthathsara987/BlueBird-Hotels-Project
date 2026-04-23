import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { X, Check, Star, BedDouble, UserCheck, Clock3, ShieldCheck } from 'lucide-react';

export default function RoomDetailsModal({ selectedRoom, onClose }) {
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

   if (!selectedRoom) return null;

  useEffect(() => {
    if (!selectedRoom?.id) return;

    const getPackageImages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/admin/packageimage/${selectedRoom.id}`
        );
        const images = response?.data?.data;

        if (!Array.isArray(images) || images.length === 0) {
          // Fallback to the single image on the room object
          setImageList(selectedRoom.image ? [selectedRoom.image] : []);
        } else {
          // Map whatever shape your API returns — adjust the key if needed
          setImageList(images.map((img) => img.url ?? img.imageUrl ?? img));
        }
      } catch (error) {
        console.error('Failed to fetch package images:', error);
        setImageList(selectedRoom.image ? [selectedRoom.image] : []);
      } finally {
        setLoading(false);
      }
    };

    getPackageImages();
    setCurrentIndex(0); // Reset index when room changes
  }, [selectedRoom?.id]);

  const canSlide = imageList.length > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }, [imageList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }, [imageList.length]);

  // Keyboard arrow support
  useEffect(() => {
    if (!canSlide) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canSlide, handlePrev, handleNext, onClose]);

  const currentImage = imageList[currentIndex] ?? selectedRoom?.image ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:p-5">
      <div className="relative flex max-h-[82vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl sm:max-w-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-3 top-3 z-30 rounded-full bg-white/95 p-1.5 text-gray-700 shadow-lg transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto custom-scrollbar">

          {/* ── Image Carousel ── */}
          <div className="relative h-48 overflow-hidden sm:h-56 bg-slate-200">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
              </div>
            ) : (
              <img
                key={currentIndex}               // re-mounts to trigger fade
                src={currentImage}
                alt={`${selectedRoom.type} – image ${currentIndex + 1}`}
                className="h-full w-full object-cover animate-fadeIn"
              />
            )}

            {/* Arrows */}
            {canSlide && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-lg transition hover:bg-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-lg transition hover:bg-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Go to image ${idx + 1}`}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/55'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image counter badge */}
            {imageList.length > 1 && (
              <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
                {currentIndex + 1} / {imageList.length}
              </div>
            )}
          </div>

          {/* ── Room Info ── */}
          <div className="space-y-5 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  {selectedRoom.name || ""}
                </h2>
                <p className="mt-1 text-sm text-gray-600">{selectedRoom.description2}</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-600">(245 reviews)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <UserCheck className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Max Guests</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRoom.maxGuests || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <BedDouble className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Room Size</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRoom.roomSize || 'Spacious Suite'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Clock3 className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Check-In</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRoom.checkIn || '2:00 PM'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-4 w-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Check-Out</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRoom.checkOut || '12:00 PM'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs font-medium text-green-800">
                  {selectedRoom.description || 'Free cancellation available'}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                </div>
                <p className="text-xs font-medium text-sky-900">Secure payment and instant booking confirmation</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Price per night</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900 sm:text-3xl">${selectedRoom.price}</span>
                <span className="text-sm text-gray-500">/night</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #eef2f7; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2e2; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8ea0b8; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.25s ease; }
      `}</style>
    </div>
  );
}