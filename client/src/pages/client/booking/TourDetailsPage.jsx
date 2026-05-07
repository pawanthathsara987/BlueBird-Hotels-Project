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
  const [toastLocal, setToastLocal] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [searchingBooking, setSearchingBooking] = useState(false);
  // Availability modal state
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availDate, setAvailDate] = useState('');
  const [availAdults, setAvailAdults] = useState('1');
  const [availChildren, setAvailChildren] = useState('0');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

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

  const tourPrice = Number(tour?.price || 0);
  const finalPrice = tour ? (tour?.discount ? tourPrice - (tourPrice * Number(tour.discount || 0) / 100) : tourPrice) : 0;
  const total = finalPrice;
  const tourLocation = tour?.location || 'Location not specified';
  // Normalize itinerary to a simple shape depending on durationType
  const itineraryItems = (() => {
    const raw = tour?.itinerary;
    const type = tour?.durationType || 'days';

    if (!raw) return [];

    // Hours mode: present as a flat activity list
    if (type === 'hours') {
      const items = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split('\n') : []);
      return items
        .map((it) => {
          if (typeof it === 'string') return { activity: it.toString().trim() };
          if (it && typeof it === 'object') return { activity: (it.description || it.activity || it.title || it.name || '').toString().trim() };
          return { activity: '' };
        })
        .filter((i) => i.activity);
    }

    // Days mode: keep day/date ordering
    const list = Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
    return list
      .map((entry, idx) => {
        if (typeof entry === 'string') {
          return { date: `Day ${idx + 1}`, activity: entry.toString().trim() };
        }
        if (entry && typeof entry === 'object') {
          const dateLabel = entry.date || (entry.day ? `Day ${entry.day}` : `Day ${idx + 1}`);
          return {
            date: dateLabel,
            activity: (entry.activity || entry.title || entry.name || entry.description || '').toString().trim(),
          };
        }
        return { date: `Day ${idx + 1}`, activity: '' };
      })
      .filter((i) => i.activity || i.date);
  })();
  const images = getImages(tour);
  const isActive = tour?.status === 'active';

  // Sync availability defaults when tour loads
  useEffect(() => {
    if (tour) {
      setAvailAdults(String(tour.groupSize || 1));
    }
  }, [tour]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
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
      {toastLocal && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-blue-900 text-white text-sm px-5 py-3.5 rounded-2xl shadow-2xl max-w-xs">
          <Check size={15} className="text-yellow-400 shrink-0" />
          <span>{toastLocal}</span>
          <button onClick={() => setToastLocal(null)} className="ml-auto text-white/50 hover:text-white transition"><X size={14} /></button>
        </div>
      )}

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden bg-blue-950" style={{ height: 'clamp(300px, 60vh, 600px)' }}>

        {images.length > 0 ? (
          <img
            src={images[activeImg]}
            alt={tour?.packageName}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-900 to-blue-700 flex items-center justify-center">
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
          <span className="inline-block bg-yellow-400 text-blue-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
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
      <div className="bg-blue-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
          {[
            { icon: <Users size={15} />, label: 'Group size', value: tour?.groupSize ? `Up to ${tour.groupSize}` : '—' },
            { icon: <Tag size={15} />,   label: 'From',       value: `$${Number(finalPrice).toLocaleString()}` },
            { icon: <Star size={15} />,  label: 'Status',     value: isActive ? 'Available' : 'Unavailable', cls: isActive ? 'text-blue-300' : 'text-red-300' },
            { icon: <Clock size={15} />, label: 'Duration',   value: tour?.duration ? `${tour.duration} ${tour?.durationType === 'hours' ? 'hours' : 'days'}` : '—' },
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
                      ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/60'
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
                        // Render differently for hours vs days
                        tour?.durationType === 'hours' ? (
                          <ul className="space-y-2 list-inside list-disc text-sm text-gray-700">
                            {itineraryItems.map((item, index) => (
                              <li key={index} className="truncate">{item.activity}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-3">
                            {itineraryItems.map((item, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                <div className="flex gap-2">
                                  <span className="text-blue-600 font-semibold">{item.date || `Day ${index + 1}`}</span>
                                  <span className="truncate">{item.activity || 'Activity details not provided.'}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )
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
                        <div key={item.id} className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                          <Check size={14} className="text-blue-600 shrink-0" />
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
                  ? 'bg-blue-700 hover:bg-blue-600 active:scale-[.98] text-white shadow-lg shadow-blue-100'
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
            <div className="bg-blue-900 px-6 py-5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-white">${Number(finalPrice).toLocaleString()}</span>
                <span className="text-xs text-white/50">/ package</span>
                {tour?.discount > 0 && (
                  <>
                    <span className="text-xs text-white/35 line-through">${Number(tour.price).toLocaleString()}</span>
                    <span className="ml-auto bg-yellow-400 text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-full">−{tour.discount}%</span>
                  </>
                )}
                {tour?.duration && (
                  <div className="w-full mt-2">
                    <p className="text-xs text-white/55">Duration</p>
                    <p className="text-sm font-semibold text-white">{tour.duration} {tour?.durationType === 'hours' ? 'hours' : 'days'}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400' : 'bg-red-400'}`} />
                <span className="text-xs text-white/55">{isActive ? 'Available to book' : 'Currently unavailable'}</span>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5 space-y-5">

              {/* Price breakdown */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tour package price</span>
                  <span className="font-semibold text-gray-800">${Number(finalPrice).toLocaleString()}</span>
                </div>
                {tour?.discount > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Discount ({tour.discount}%)</span>
                    <span className="font-semibold">−${(tour.price * tour.discount / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-blue-800">${Number(total).toLocaleString()}</span>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setShowAvailabilityModal(true)}
                    type="button"
                    className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wide bg-blue-700 hover:bg-blue-600 text-white transition-all shadow-md"
                  >
                    🔎 Check Availability
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Location</p>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-blue-600 mt-0.5 shrink-0" />
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
                    <span className="text-blue-500 mt-0.5 shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

                {/* Book Now / Complete Payment */}
                <div className="space-y-2.5 border-t border-gray-200 pt-4">
                
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
            <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-red-700">{bookingError}</span>
                    </div>
                  )}
                  <button
                    onClick={handleSearchBooking}
                    disabled={searchingBooking}
                    className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-bold text-sm transition"
                  >
                    {searchingBooking ? 'Searching...' : 'Search Booking'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-bold mb-1">Booking Found</p>
                    <p className="text-sm font-bold text-blue-900">{foundBooking.bookingRef}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold">${Number(foundBooking.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-bold text-blue-700">{foundBooking.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm transition"
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
      {/* ════════ AVAILABILITY MODAL ════════ */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold">Check Availability</h3>
              <button onClick={() => { setShowAvailabilityModal(false); setAvailabilityResult(null); }} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Travel Date</label>
                  <input
                    type="date"
                    value={availDate}
                    onChange={(e) => setAvailDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Adults</label>
                    <input
                      type="number"
                      min="1"
                      value={availAdults}
                      onChange={(e) => setAvailAdults(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={availChildren}
                      onChange={(e) => setAvailChildren(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={async () => {
                      // client-side validation
                      setAvailabilityResult(null);
                      if (!availDate) {
                        setAvailabilityResult({ ok: false, message: 'Please select a date' });
                        return;
                      }
                      if (!Number.isFinite(Number(availAdults)) || Number(availAdults) < 1) {
                        setAvailabilityResult({ ok: false, message: 'Adults must be 1 or more' });
                        return;
                      }

                      setCheckingAvailability(true);
                      try {
                        const payload = {
                          tourId: tour?.id,
                          date: availDate,
                          adults: Number(availAdults),
                          children: Number(availChildren || 0),
                        };

                        // Attempt backend check (endpoint may not exist yet)
                        const res = await axios.post(`${backendBaseUrl}/tour-availability/check`, payload).catch(err => ({ data: null, error: err }));
                        if (res && res.data && res.data.success) {
                          setAvailabilityResult({ ok: !!res.data.available, message: res.data.message || (res.data.available ? 'Available' : 'Not available') });
                        } else if (res && res.data === null) {
                          setAvailabilityResult({ ok: false, message: 'Availability API not configured on server' });
                        } else {
                          setAvailabilityResult({ ok: false, message: (res.data && res.data.message) || 'Not available' });
                        }
                      } catch (err) {
                        setAvailabilityResult({ ok: false, message: err.message || 'Error checking availability' });
                      } finally {
                        setCheckingAvailability(false);
                      }
                    }}
                    disabled={checkingAvailability}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>

                {availabilityResult && (
                  <div className={`p-3 rounded-lg ${availabilityResult.ok ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
                    <p className="text-sm font-semibold">{availabilityResult.ok ? 'Available' : 'Unavailable'}</p>
                    <p className="text-sm mt-1">{availabilityResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}