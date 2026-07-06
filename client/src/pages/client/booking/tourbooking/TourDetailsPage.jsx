import React, { useState, useEffect } from 'react';
import {
  MapPin, Users, Tag, Check, AlertCircle, Heart, Share2,
  ChevronLeft, ChevronRight, Star, Clock, Shield, X
} from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';

/* ─── Helpers ─────────────────────────────────────────────── */
const TABS = ['Overview', "What's Included", 'Terms & Conditions'];

/* ─── Component ───────────────────────────────────────────── */
export default function TourDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTour = location.state?.tour || null;
  const inquiry = location.state?.inquiry || null;
  const tourIdFromQuery = new URLSearchParams(location.search).get('tourId');
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toastLocal, setToastLocal] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

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

  const handleProceedToPayment = () => {
    navigate('/booking/tour-payment', { state: { tour, inquiry } });
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
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
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
      <div className="relative overflow-hidden bg-slate-950" style={{ height: 'clamp(320px, 60vh, 600px)' }}>

        {images.length > 0 ? (
          <img
            src={images[activeImg]}
            alt={tour?.packageName}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
            <p className="text-4xl font-bold text-white/10 text-center px-6">{tour?.packageName}</p>
          </div>
        )}

        {/* Dark linear gradient vignette overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none"
        />

        {/* Gallery arrows navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/35 active:scale-95 transition cursor-pointer"
            ><ChevronLeft size={20} /></button>
            <button
              onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/35 active:scale-95 transition cursor-pointer"
            ><ChevronRight size={20} /></button>
          </>
        )}

        {/* Thumbnails list indicators overlay */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            {images.map((src, i) => (
              <img
                key={i} src={src} onClick={() => setActiveImg(i)} alt=""
                className={`w-16 h-11 object-cover rounded-xl cursor-pointer border-2 transition-all shadow-sm ${i === activeImg ? 'border-cyan-500 scale-105 opacity-100' : 'border-transparent opacity-60 hover:opacity-85'}`}
              />
            ))}
          </div>
        )}

        {/* Discount floating badge */}
        {tour?.discount > 0 && (
          <div className="absolute top-5 left-5 z-10 bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg animate-pulse">
            {tour.discount}% OFF SPECIAL
          </div>
        )}

        {/* Wishlist / Share */}
        <div className="absolute top-5 right-5 z-10 flex gap-2">
          <button
            onClick={() => setWishlist(w => !w)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/35 active:scale-95 transition cursor-pointer"
          ><Heart size={16} fill={wishlist ? '#ef4444' : 'none'} color={wishlist ? '#ef4444' : 'currentColor'} /></button>
        </div>

        {/* Hero title overlay content */}
        <div className="absolute bottom-6 left-6 right-6 z-10 max-w-4xl space-y-2">
          <span className="inline-block bg-cyan-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            Bluebird Experiences
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md tracking-tight">
            {tour?.packageName}
          </h1>
          <div className="flex items-center gap-1.5 text-slate-200 text-sm font-semibold">
            <MapPin size={14} className="text-cyan-400" /><span>{tourLocation}</span>
          </div>
        </div>
      </div>

      {/* ══════════════ STATS BAR ══════════════ */}
      <div className="bg-slate-900 border-y border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {[
            { icon: <Users size={16} />, label: 'Group size', value: tour?.groupSize ? `Up to ${tour.groupSize} Pax` : '—' },
            { icon: <Tag size={16} />,   label: 'From',       value: `${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${Number(finalPrice).toLocaleString()}` },
            { icon: <Star size={16} />,  label: 'Status',     value: isActive ? 'Available' : 'Unavailable', cls: isActive ? 'text-emerald-400' : 'text-rose-400' },
            { icon: <Clock size={16} />, label: 'Duration',   value: tour?.duration ? `${tour.duration} ${tour?.durationType === 'hours' ? 'hours' : 'days'}` : '—' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3.5 px-6 py-4.5">
              <span className="text-cyan-500 shrink-0 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/30">{s.icon}</span>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-455 font-black">{s.label}</p>
                <p className={`text-sm font-bold mt-0.5 ${s.cls || 'text-white'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ BODY ══════════════ */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Left Details Content ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Clean Segmented Tabs card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === i
                      ? 'text-cyan-700 border-cyan-700 bg-white'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 border-transparent'
                  }`}
                >{t}</button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-850 mb-3">About This Tour</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{tour?.overview || 'No overview description has been specified.'}</p>
                  </div>
                  
                  {/* Detailed Timeline Itinerary schedule */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 mb-4 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> Planned Tour Timeline
                    </h3>
                    {itineraryItems.length > 0 ? (
                      tour?.durationType === 'hours' ? (
                        <div className="space-y-3 pl-3">
                          {itineraryItems.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-2 shrink-0"></span>
                              <span className="text-sm text-slate-700 leading-relaxed">{item.activity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
                          {itineraryItems.map((item, index) => (
                            <div key={index} className="relative">
                              <span className="absolute -left-[30px] top-0.5 w-3 h-3 rounded-full border-2 border-slate-355 bg-white flex items-center justify-center" />
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {item.date || `Day ${index + 1}`}
                                </span>
                                <p className="text-sm font-bold text-slate-800 mt-1.5 leading-snug">{item.activity || 'Activity details not provided.'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-slate-450 italic">No itinerary details provided.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-850 mb-1">What's Included</h2>
                  <p className="text-xs text-slate-400 font-medium">Standard list of items included in package pricing.</p>
                  {tour?.TourItems?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {tour.TourItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3">
                          <Check size={14} className="text-emerald-600 shrink-0 bg-emerald-50 p-0.5 rounded-full border border-emerald-250" />
                          <span className="text-xs font-bold text-slate-707">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No inclusions listed.</p>
                  )}
                </div>
              )}

              {activeTab === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-850">Terms & Conditions</h2>
                  <div className="text-sm text-slate-655 leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-200/50 mt-2">
                    {tour?.termsConditions || 'Standard cancellations and hotel reservation guidelines apply.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry CTA Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-205 p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Ready To Explore?</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Submit your inquiry parameters. Our desk coordinators will review departure availability and contact you with custom package estimates.
            </p>
            <button
              type="button"
              onClick={handleSendInquiry}
              disabled={!isActive}
              className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-700 hover:bg-blue-650 active:scale-[.98] text-white shadow-lg shadow-blue-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isActive ? 'Send Inquiry' : 'Tour Unavailable'}
            </button>
          </div>
        </div>

        {/* ── Right Column Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-5 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">

            {/* Price Header Sidebar */}
            <div className="bg-blue-900 px-6 py-5.5 text-white">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-3xl font-black">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(finalPrice).toLocaleString()}</span>
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">/ package</span>
              </div>
              
              {tour?.discount > 0 && (
                <div className="flex items-center gap-2 mt-1.5 select-none">
                  <span className="text-xs text-white/35 line-through">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(tour.price).toLocaleString()}</span>
                  <span className="bg-yellow-400 text-blue-900 text-[9px] font-black px-2 py-0.5 rounded-full">−{tour.discount}%</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-3.5">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-xs text-white/50 font-semibold">{isActive ? 'Booking available' : 'Currently offline'}</span>
              </div>
            </div>

            {/* Sidebar Pricing & map components */}
            <div className="bg-white px-6 py-5 space-y-5">
              
              {/* Pricing table */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-550 font-bold">
                  <span>Tour package price</span>
                  <span>{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(finalPrice).toLocaleString()}</span>
                </div>
                {tour?.discount > 0 && (
                  <div className="flex justify-between text-sm text-blue-600 font-bold">
                    <span>Discount ({tour.discount}%)</span>
                    <span>−{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {(tour.price * tour.discount / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-blue-800">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(total).toLocaleString()}</span>
                </div>

                <div className="mt-3.5 pt-1.5">
                  {inquiry && inquiry.rawStatus === 'progress' && (
                    <button
                      onClick={handleProceedToPayment}
                      type="button"
                      className="w-full py-3 rounded-lg text-sm font-bold tracking-wide bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white transition-all shadow-md cursor-pointer"
                    >
                      💳 Pay 50% Advance
                    </button>
                  )}
                </div>
              </div>

              {/* Map embed box */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> Destination Locator
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    title="Tour location map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(tourLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-48 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Trust signals list */}
              <div className="space-y-2.5 pt-1.5">
                {[
                  { icon: <Shield size={13} />, text: 'Inquiry checked before payment' },
                  { icon: <Clock size={13} />,  text: 'Cancel up to 24 hours before' },
                  { icon: <Check size={13} />,  text: 'Fast booking coordination' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-450 font-semibold">
                    <span className="text-blue-500 mt-0.5 shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}