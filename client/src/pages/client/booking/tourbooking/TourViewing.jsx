import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Search, SlidersHorizontal, Users, CalendarDays, 
  ArrowRight, X, Sparkles, Compass, Shield, Clock, RotateCcw, 
  BadgeDollarSign, Tag, ChevronDown, Check
} from 'lucide-react';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';
import FloatingChatbot from '../../../../components/FloatingChatbot';

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function TourViewPage() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  /* =========================
     FETCH TOURS
  ========================== */
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendBaseUrl}/manager/tours`);

        if (response.data.success) {
          const toursData = response.data.data || [];
          setTours(toursData);

          // Extract unique locations
          const uniqueLocations = [...new Set(toursData
            .map(tour => tour.location)
            .filter(loc => loc && loc.trim() !== '')
          )].sort();
          setLocations(uniqueLocations);

          // Calculate max price from tours
          if (toursData.length > 0) {
            const prices = toursData.map(tour => tour.price || 0);
            const max = Math.max(...prices);
            setMaxAvailablePrice(Math.ceil(max));
            setMaxPrice(Math.ceil(max));
          }

          setError(null);
        } else {
          setError(response.data.message || 'Failed to load tours');
        }
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError(err.message || 'Failed to fetch tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [backendBaseUrl]);

  /* =========================
     APPLY FILTERS & SORT
  ========================== */
  useEffect(() => {
    let result = tours;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tour =>
        (tour.packageName && tour.packageName.toLowerCase().includes(query)) ||
        (tour.location && tour.location.toLowerCase().includes(query)) ||
        (tour.overview && tour.overview.toLowerCase().includes(query))
      );
    }

    // Apply location filter
    if (selectedLocation) {
      result = result.filter(tour => tour.location === selectedLocation);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(tour => tour.status === statusFilter);
    }

    // Apply price filter
    result = result.filter(tour => {
      const finalPrice = tour.discount
        ? tour.price - (tour.price * tour.discount / 100)
        : tour.price;
      return finalPrice >= minPrice && finalPrice <= maxPrice;
    });

    // Apply Sorting
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => {
          const pA = a.discount ? a.price - (a.price * a.discount / 100) : a.price;
          const pB = b.discount ? b.price - (b.price * b.discount / 100) : b.price;
          return pA - pB;
        });
        break;
      case 'price-high':
        result = [...result].sort((a, b) => {
          const pA = a.discount ? a.price - (a.price * a.discount / 100) : a.price;
          const pB = b.discount ? b.price - (b.price * b.discount / 100) : b.price;
          return pB - pA;
        });
        break;
      case 'duration':
        result = [...result].sort((a, b) => Number(b.duration || 0) - Number(a.duration || 0));
        break;
      default:
        result = [...result];
    }

    setFilteredTours(result);
  }, [tours, searchQuery, selectedLocation, minPrice, maxPrice, statusFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setMinPrice(0);
    setMaxPrice(maxAvailablePrice);
    setStatusFilter('all');
    setSortBy('featured');
  };

  const handleSelectTour = (tour) => {
    navigate(`/booking/tour-details?tourId=${tour.id}`, { state: { tour } });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      {/* Main Catalog Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resort Excursions & Guided Tours</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium font-sans">Explore Sri Lanka’s wild safaris, historic ruins, and golden coasts.</p>
          </div>
          
          {/* Sorting and Count in Top Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none transition cursor-pointer text-slate-700 focus:border-blue-450"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Premium Left Filter Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 lg:sticky lg:top-6">
            
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-650" /> Filter Excursions
              </h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Ella, Safari, Temple..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none transition text-slate-700"
                />
              </div>
            </div>

            {/* Destination Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Destination Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-xs outline-none transition text-slate-750 font-bold cursor-pointer"
              >
                <option value="">All Destinations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Price Budget limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Max Budget</label>
                <span className="text-xs font-bold text-slate-700">{formatMoney(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxAvailablePrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Min: 0.00</span>
                <span>Max: {maxAvailablePrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Tour Status Filters (All, Active, Inactive) */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status Category</label>
              <div className="flex flex-col gap-2.5">
                {[
                  { value: 'all', label: 'All Packages' },
                  { value: 'active', label: 'Active / Available' },
                  { value: 'inactive', label: 'Inactive / Private' }
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2.5 cursor-pointer select-none group text-xs font-bold text-slate-600 hover:text-slate-900">
                    <input 
                      type="radio" 
                      name="tourStatus" 
                      value={item.value} 
                      checked={statusFilter === item.value}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-4 h-4 accent-slate-900 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Right Column: Grid of Cards */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Count Indicator */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400">{filteredTours.length} tours match your search criteria</span>
            </div>

            {/* Loading / Error States */}
            {loading ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-20 text-center shadow-xs">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-sm font-semibold text-slate-455">Retrieving excursions...</p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-750 font-bold">
                <p className="text-lg">Failed to Load Tours</p>
                <p className="text-xs font-semibold mt-1">{error}</p>
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-20 text-center shadow-xs">
                <p className="text-lg font-bold text-slate-800">No excursions match your queries</p>
                <p className="text-xs text-slate-450 mt-1">Try expanding the budget slider or resetting location filters.</p>
              </div>
            ) : (
              /* Tours Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTours.map((tour) => {
                  const finalPrice = tour.discount
                    ? tour.price - (tour.price * tour.discount / 100)
                    : tour.price;
                  const isTourActive = tour.status === 'active';

                  return (
                    <article
                      key={tour.id}
                      onClick={() => handleSelectTour(tour)}
                      className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
                    >
                      {/* Cover Image aspect-video */}
                      <div className="relative aspect-video overflow-hidden bg-slate-100 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                        <img 
                          src={tour.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"} 
                          alt={tour.packageName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Discount floating badge */}
                        {tour.discount > 0 && (
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                              {tour.discount}% OFF
                            </span>
                          </div>
                        )}

                        {/* Status Category floating badge */}
                        <div className="absolute top-4 right-4 z-20">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${
                            isTourActive ? 'bg-emerald-600' : 'bg-slate-500'
                          }`}>
                            {isTourActive ? '✓ Active' : '● Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Info Content Body */}
                      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                        <div className="space-y-2">
                          
                          {/* Location Label */}
                          {tour.location && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-blue-650 uppercase tracking-widest">
                              <MapPin size={12} className="text-blue-500" />
                              <span className="truncate max-w-[150px]">{tour.location}</span>
                            </div>
                          )}

                          {/* Tour Title */}
                          <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors font-sans">
                            {tour.packageName}
                          </h3>

                          {/* Short description */}
                          <p className="text-xs text-slate-550 leading-relaxed line-clamp-2 h-8">
                            {tour.overview || "No package overview description has been specified."}
                          </p>

                          {/* Detail indicators */}
                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            {tour.duration && (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-55 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {tour.duration} {tour.durationType === 'hours' ? 'Hrs' : 'Days'}
                              </span>
                            )}
                            {tour.groupSize && (
                              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Max {tour.groupSize} Guests
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom pricing row & button */}
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 mt-auto">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">From Rate</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-sm font-black text-slate-900">{formatMoney(finalPrice)}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTour(tour);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-[10px] transition uppercase tracking-wider"
                          >
                            Explore Details
                          </button>
                        </div>

                      </div>

                    </article>
                  );
                })}
              </div>
            )}

          </main>

        </div>

      </div>

      <FloatingChatbot />
      <Footer />
    </div>
  );
}