import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Tag, X, SlidersHorizontal, RotateCcw, Search, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

/* ===================================
   TOUR CARD COMPONENT
   ==================================== */
function TourCard({ tour, onSelect }) {
  const finalPrice = tour.discount 
    ? tour.price - (tour.price * tour.discount / 100)
    : tour.price;

  const savings = tour.discount ? (tour.price * tour.discount / 100).toFixed(2) : 0;

  return (
    <div
      onClick={() => onSelect(tour)}
      className="bg-white/95 backdrop-blur rounded-3xl shadow-[0_14px_40px_rgba(15,23,42,0.12)] overflow-hidden border border-slate-200/70 hover:shadow-[0_22px_48px_rgba(2,6,23,0.18)] transition-all hover:-translate-y-1.5 cursor-pointer group"
    >
      {/* Tour Image */}
      <div className="relative h-56 overflow-hidden bg-linear-to-br from-cyan-500 to-blue-700">
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.packageName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-center px-4 font-semibold text-lg">{tour.packageName}</p>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-900/65 via-slate-900/10 to-transparent" />

        {/* Discount Badge */}
        {tour.discount > 0 && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {tour.discount}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg border ${
              tour.status === 'active'
                ? 'bg-emerald-500/95 text-white border-emerald-300/50'
                : 'bg-slate-500/95 text-white border-slate-300/50'
            }`}
          >
            {tour.status === 'active' ? '✓ Active' : '● Inactive'}
          </span>
        </div>
      </div>

      {/* Tour Info */}
      <div className="p-5">
        {/* Tour Name */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
          {tour.packageName || 'Untitled Tour'}
        </h3>

        {/* Location */}
        {tour.location && (
          <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-cyan-700 shrink-0" />
            <span className="line-clamp-1">{tour.location}</span>
          </div>
        )}

        {/* Overview */}
        {tour.overview && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">
            {tour.overview}
          </p>
        )}

        {/* Group Size */}
        {tour.groupSize && (
          <div className="text-xs text-slate-500 mb-3 bg-slate-100 inline-flex rounded-full px-2.5 py-1">
            Max {tour.groupSize} guests / package
          </div>
        )}

        {/* Tour Items Tags */}
        {tour.TourItems && tour.TourItems.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tour.TourItems.slice(0, 2).map((item) => (
              <span
                key={item.id}
                className="px-2 py-1 text-xs rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200"
              >
                {item.name}
              </span>
            ))}
            {tour.TourItems.length > 2 && (
              <span className="px-2 py-1 text-xs rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                +{tour.TourItems.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Pricing Section */}
        <div className="border-t border-slate-200 pt-4">
          {tour.discount > 0 ? (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1">Original Price</p>
              <p className="text-sm text-slate-500 line-through mb-2">
${Number(tour.price).toFixed(2)}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-700">
${finalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-700 font-semibold">
                  Save ${savings}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-cyan-700 mb-3">
${Number(tour.price).toFixed(2)}
            </p>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tour);
            }}
            className="w-full bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold border border-cyan-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================
   FILTER SIDEBAR COMPONENT
   ==================================== */
function FilterSidebar({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  statusFilter,
  setStatusFilter,
  onReset,
  maxAvailablePrice,
  locations,
  selectedLocation,
  setSelectedLocation,
}) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-3xl shadow-[0_12px_36px_rgba(2,6,23,0.12)] border border-slate-200 p-6 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-cyan-700" />
          Filters
        </h2>
        <button
          onClick={onReset}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Location Filter */}
      {locations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-700" />
            Location
          </h3>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-700" />
          Price Range
        </h3>

        {/* Min Price */}
        <div className="mb-4">
          <label className="block text-xs text-slate-600 mb-2">Min Price</label>
          <input
            type="range"
            min="0"
            max={maxAvailablePrice || 10000}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-slate-900">${minPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Max Price */}
        <div className="mb-4">
          <label className="block text-xs text-slate-600 mb-2">Max Price</label>
          <input
            type="range"
            min="0"
            max={maxAvailablePrice || 10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-slate-900">${maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Price Range Display */}
        <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200">
          <p className="text-sm text-center font-semibold text-cyan-900">
${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-700" />
          Tour Status
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value="all"
              checked={statusFilter === 'all'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 cursor-pointer accent-cyan-700"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">All Tours</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value="active"
              checked={statusFilter === 'active'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 cursor-pointer accent-green-600"
            />
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-sm text-slate-700 group-hover:text-slate-900">Active Tours</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={statusFilter === 'inactive'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 cursor-pointer accent-gray-600"
            />
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-gray-600 rounded-full"></span>
              <span className="text-sm text-slate-700 group-hover:text-slate-900">Inactive Tours</span>
            </div>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset All Filters
      </button>
    </div>
  );
}

/* ===================================
   MAIN TOUR VIEW COMPONENT
   ==================================== */
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);

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
            setMaxAvailablePrice(Math.ceil(max * 1.5));
            setMaxPrice(Math.ceil(max * 1.5));
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
     APPLY FILTERS
  ========================== */
  useEffect(() => {
    let filtered = tours;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tour =>
        (tour.packageName && tour.packageName.toLowerCase().includes(query)) ||
        (tour.location && tour.location.toLowerCase().includes(query)) ||
        (tour.overview && tour.overview.toLowerCase().includes(query))
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(tour => tour.location === selectedLocation);
    }

    // Apply price filter
    filtered = filtered.filter(tour => {
      const price = tour.price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tour => tour.status === statusFilter);
    }

    setFilteredTours(filtered);
  }, [tours, searchQuery, selectedLocation, minPrice, maxPrice, statusFilter]);

  /* =========================
     RESET FILTERS
  ========================== */
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setMinPrice(0);
    setMaxPrice(maxAvailablePrice);
    setStatusFilter('all');
  };

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (selectedLocation ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (minPrice > 0 || maxPrice < maxAvailablePrice ? 1 : 0);

  /* =========================
     HANDLE TOUR SELECT
  ========================== */
  const handleSelectTour = (tour) => {
    navigate(`/booking/tour-details?tourId=${tour.id}`, { state: { tour } });
  };

  /* =========================
     LOADING STATE
  ========================== */
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading tours...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* =========================
     ERROR STATE
  ========================== */
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col">
        <Header />
        <div className="flex-1 md:w-[90%] mx-auto py-12 flex items-center justify-center bg-gray-50">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-md">
            <p className="font-semibold mb-2">Unable to load tours</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-linear-to-b from-cyan-50 via-slate-50 to-white">
        <div className="w-full md:w-[95%] lg:w-[90%] mx-auto py-8 px-4">
          
          {/* Page Title */}
          <div className="mb-8 rounded-3xl bg-slate-900 text-white px-6 py-8 md:px-8 md:py-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200 font-semibold mb-2">BlueBird Experiences</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Explore Our Tours
              </h1>
              <p className="text-slate-200 text-lg max-w-2xl">
              Discover amazing experiences at the best prices
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-3 bg-white/90 border border-slate-300 rounded-2xl px-4 py-3 shadow-[0_8px_24px_rgba(2,6,23,0.08)] focus-within:ring-2 focus-within:ring-cyan-600 focus-within:border-transparent transition-all max-w-3xl">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tours by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent text-slate-700 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 p-4 bg-cyan-50 rounded-2xl border border-cyan-200 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-cyan-900 font-semibold">
              Showing <span className="text-lg font-bold">{filteredTours.length}</span> of{' '}
              <span className="text-lg font-bold">{tours.length}</span> tours
            </p>
            <p className="text-xs font-semibold text-slate-600">
              Active filters: <span className="text-cyan-800">{activeFiltersCount}</span>
            </p>
          </div>

          {/* Main Layout - Cards and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Side: Filter Sidebar */}
            <div className="lg:col-span-1">
              <FilterSidebar
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onReset={handleResetFilters}
                maxAvailablePrice={maxAvailablePrice}
                locations={locations}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />
            </div>

            {/* Right Side: Tour Cards */}
            <div className="lg:col-span-3">
              {filteredTours.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-[0_12px_28px_rgba(2,6,23,0.1)] border border-slate-200 p-12 text-center">
                  <div className="mb-4">
                    <X className="w-16 h-16 text-slate-300 mx-auto" />
                  </div>
                  <p className="text-xl text-slate-600 font-semibold mb-2">No tours found</p>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your filters to find more tours
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      onSelect={handleSelectTour}
                    />
                  ))}
                </div>
              )}
            </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}