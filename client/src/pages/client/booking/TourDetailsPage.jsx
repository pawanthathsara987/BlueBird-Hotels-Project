import React, { useState, useEffect } from 'react';
import {
  MapPin, Users, Tag, Check, AlertCircle, Heart, Share2,
  ChevronLeft, ChevronRight, Star, Clock, Shield, X
} from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

/* ─── Helpers ─────────────────────────────────────────────── */
const TABS = ['Overview', "What's Included", 'Terms & Conditions'];

/* ─── Component ───────────────────────────────────────────── */
export default function TourDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTour = location.state?.tour || null;
  const tourIdFromQuery = new URLSearchParams(location.search).get('tourId');
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [searchingBooking, setSearchingBooking] = useState(false);

  const getImages = (t) => {
    if (!t) return [];
    if (Array.isArray(t.images) && t.images.length) return t.images;
    if (t.image) return [t.image];
    return [];
  };

  useEffect(() => {
    if (selectedTour) { setTour(selectedTour); setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const endpoint = tourIdFromQuery
          ? `${backendBaseUrl}/manager/tours/${tourIdFromQuery}`
          : `${backendBaseUrl}/manager/tours`;
        const res = await axios.get(endpoint);
        if (tourIdFromQuery) {
          if (res.data.success && res.data.data) setTour(res.data.data);
          else setPageError('Tour not found');
        } else if (res.data.success && res.data.data.length > 0) {
          setTour(res.data.data[0]);
        } else setPageError('No tours available');
      } catch (e) {
        setPageError(e.message || 'Failed to load tour details');
      } finally { setLoading(false); }
    })();
  }, [backendBaseUrl, selectedTour, tourIdFromQuery]);
  const handleSendInquiry = () => {
    const query = tour?.id ? `?tourId=${tour.id}` : '';
    navigate(`/booking/tour-inquiry${query}`, { state: { tour } });
  };

    const handleSearchBooking = async () => {
      if (!bookingRef.trim()) {
        setBookingError('Please enter your booking reference');
        return;
      }
    
      setSearchingBooking(true);
      setBookingError('');
    
      try {
        const res = await axios.get(`${backendBaseUrl}/tour-booking/ref/${bookingRef.trim()}`);
        if (res.data.success && res.data.data) {
          setFoundBooking(res.data.data);
        } else {
          setBookingError(res.data.message || 'Booking not found');
          setFoundBooking(null);
        }
      } catch (err) {
        setBookingError(err.message || 'Failed to search booking');
        setFoundBooking(null);
      } finally {
        setSearchingBooking(false);
      }
    };

    const handleProceedToPayment = () => {
      if (foundBooking) {
        navigate('/booking/tour-payment', {
          state: {
            bookingId: foundBooking.id,
            bookingData: foundBooking
          }
        });
      }
    };

  const finalPrice = tour
    ? (tour.discount ? tour.price - (tour.price * tour.discount / 100) : tour.price)
    : 0;
  const total = finalPrice;
  const tourLocation = tour?.location || 'Location not specified';
  const itineraryItems = (Array.isArray(tour?.itinerary)
    ? tour.itinerary
    : typeof tour?.itinerary === 'string' && tour.itinerary.trim()
      ? [tour.itinerary]
      : [])
    .map((item) => {
      if (typeof item === 'string') {
        return { date: '', activity: item };
      }

      if (item && typeof item === 'object') {
        return {
          date: item.date || item.day || '',
          activity: item.activity || item.title || item.name || item.description || '',
        };
      }

      return { date: '', activity: '' };
    })
    .filter((item) => item.date || item.activity);
  const images = getImages(tour);
  const isActive = tour?.status === 'active';

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-400">Loading tour details…</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (pageError && !tour) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm text-center">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
          <p className="font-bold text-gray-900 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500">{pageError}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-900 text-white text-sm px-5 py-3.5 rounded-2xl shadow-2xl max-w-xs">
          <Check size={15} className="text-yellow-400 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white/50 hover:text-white transition"><X size={14} /></button>
        </div>
      )}

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden bg-emerald-950" style={{ height: 'clamp(300px, 60vh, 600px)' }}>

        {images.length > 0 ? (
          <img
            src={images[activeImg]}
            alt={tour?.packageName}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-900 to-teal-700 flex items-center justify-center">
            <p className="text-4xl font-bold text-white/10 text-center px-6">{tour?.packageName}</p>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,18,10,.92) 0%, rgba(4,18,10,.18) 55%, transparent 100%)' }}
        />

        {/* Gallery arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition"
            ><ChevronLeft size={18} /></button>
            <button
              onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition"
            ><ChevronRight size={18} /></button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-20 right-5 flex gap-2 z-10">
            {images.map((src, i) => (
              <img
                key={i} src={src} onClick={() => setActiveImg(i)} alt=""
                className={`w-14 h-10 object-cover rounded-lg cursor-pointer border-2 transition-all ${i === activeImg ? 'border-yellow-400 opacity-100' : 'border-transparent opacity-55 hover:opacity-80'}`}
              />
            ))}
          </div>
        )}

        {/* Discount */}
        {tour?.discount > 0 && (
          <div className="absolute top-5 left-5 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
            {tour.discount}% OFF
          </div>
        )}

        {/* Wishlist / Share */}
        <div className="absolute top-5 right-5 z-10 flex gap-2">
          <button
            onClick={() => setWishlist(w => !w)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition"
          ><Heart size={16} fill={wishlist ? '#ff6b6b' : 'none'} color={wishlist ? '#ff6b6b' : 'currentColor'} /></button>
          <button className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition">
            <Share2 size={16} />
          </button>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-7 md:px-10">
          <span className="inline-block bg-yellow-400 text-emerald-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Sri Lanka Tours
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
            {tour?.packageName}
          </h1>
          <div className="flex items-center gap-1.5 text-white/65 text-sm">
            <MapPin size={13} /><span>{tourLocation}</span>
          </div>
        </div>
      </div>

      {/* ══════════════ STATS BAR ══════════════ */}
      <div className="bg-emerald-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
          {[
            { icon: <Users size={15} />, label: 'Group size', value: tour?.groupSize ? `Up to ${tour.groupSize}` : '—' },
            { icon: <Tag size={15} />,   label: 'From',       value: `LKR ${Number(finalPrice).toLocaleString()}` },
            { icon: <Star size={15} />,  label: 'Status',     value: isActive ? 'Available' : 'Unavailable', cls: isActive ? 'text-emerald-300' : 'text-red-300' },
            { icon: <Shield size={15} />,label: 'Cancellation', value: 'Free up to 24h' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <span className="text-yellow-400 shrink-0">{s.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">{s.label}</p>
                <p className={`text-sm font-bold ${s.cls || 'text-white'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ BODY ══════════════ */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Tabs card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors ${
                    activeTab === i
                      ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >{t}</button>
              ))}
            </div>
            <div className="p-6 md:p-8">
              {activeTab === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h2>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{tour?.overview || 'No overview provided.'}</p>
                  <div className="mt-6 grid gap-5">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location</p>
                      <p className="text-sm text-gray-700">{tourLocation}</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Itinerary</p>
                      {itineraryItems.length > 0 ? (
                        <ul className="space-y-2">
                          {itineraryItems.map((item, index) => {
                            return (
                              <li key={index} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-emerald-600 font-semibold">{index + 1}.</span>
                                <span>
                                  {item.date ? <span className="font-semibold text-gray-900">{item.date}: </span> : null}
                                  {item.activity || 'Activity details not provided.'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No itinerary details provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5">What's Included</h2>
                  {tour?.TourItems?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tour.TourItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                          <Check size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No inclusions listed.</p>
                  )}
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
                  <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap">{tour?.termsConditions || 'No terms provided.'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry CTA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready To Inquire?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Continue to the inquiry page to share your travel details. Our team will get back to you with confirmation and pricing.
            </p>
            <button
              type="button"
              onClick={handleSendInquiry}
              disabled={!isActive}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                isActive
                  ? 'bg-emerald-700 hover:bg-emerald-600 active:scale-[.98] text-white shadow-lg shadow-emerald-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isActive ? 'Send Inquiry' : 'Tour Unavailable'}
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-5 rounded-2xl overflow-hidden shadow-lg border border-gray-100">

            {/* Header */}
            <div className="bg-emerald-900 px-6 py-5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-white">LKR {Number(finalPrice).toLocaleString()}</span>
                <span className="text-xs text-white/50">/ package</span>
                {tour?.discount > 0 && (
                  <>
                    <span className="text-xs text-white/35 line-through">LKR {Number(tour.price).toLocaleString()}</span>
                    <span className="ml-auto bg-yellow-400 text-emerald-900 text-[10px] font-bold px-2.5 py-1 rounded-full">−{tour.discount}%</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-xs text-white/55">{isActive ? 'Available to book' : 'Currently unavailable'}</span>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5 space-y-5">

              {/* Price breakdown */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tour package price</span>
                  <span className="font-semibold text-gray-800">LKR {Number(finalPrice).toLocaleString()}</span>
                </div>
                {tour?.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({tour.discount}%)</span>
                    <span className="font-semibold">−LKR {(tour.price * tour.discount / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-emerald-800">LKR {Number(total).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Location</p>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{tourLocation}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Map</p>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    title="Tour location map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(tourLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-52"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Trust */}
              <div className="space-y-2.5">
                {[
                  { icon: <Shield size={12} />, text: 'Payment collected after confirmation' },
                  { icon: <Clock size={12} />,  text: 'Free cancellation up to 24 hours before' },
                  { icon: <Check size={12} />,  text: 'Instant booking confirmation' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-emerald-500 mt-0.5 shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

                {/* Book Now / Complete Payment */}
                <div className="space-y-2.5 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    type="button"
                    className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                  >
                    📋 Check Your Booking
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Have a booking reference? Complete your payment here.
                  </p>
                </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
      {/* ════════ BOOKING MODAL ════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Your Booking</h3>
              <button onClick={() => { setShowBookingModal(false); setFoundBooking(null); setBookingRef(''); setBookingError(''); }} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {!foundBooking ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter your booking reference to find your booking and complete payment.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Booking Reference</label>
                    <input
                      type="text"
                      placeholder="e.g., TB-2026-0001"
                      value={bookingRef}
                      onChange={(e) => { setBookingRef(e.target.value); setBookingError(''); }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchBooking()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-red-700">{bookingError}</span>
                    </div>
                  )}
                  <button
                    onClick={handleSearchBooking}
                    disabled={searchingBooking}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-bold text-sm transition"
                  >
                    {searchingBooking ? 'Searching...' : 'Search Booking'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-emerald-700 font-bold mb-1">Booking Found</p>
                    <p className="text-sm font-bold text-emerald-900">{foundBooking.bookingRef}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold">LKR {Number(foundBooking.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-bold text-emerald-700">{foundBooking.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm transition"
                  >
                    Proceed to Payment
                  </button>
                  <button
                    onClick={() => { setFoundBooking(null); setBookingRef(''); setBookingError(''); }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-bold text-sm transition"
                  >
                    Search Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}