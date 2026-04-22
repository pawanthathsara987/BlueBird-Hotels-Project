import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Tag, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
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

  return (
    <div
      onClick={() => onSelect(tour)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group"
    >
      {/* Tour Image */}
      <div className="relative h-56 overflow-hidden bg-linear-to-br from-blue-400 to-blue-600">
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.packageName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-center px-4 font-semibold">{tour.packageName}</p>
          </div>
        )}

        {/* Discount Badge */}
        {tour.discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {tour.discount}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
              tour.status === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {tour.status === 'active' ? '✓ Active' : '● Inactive'}
          </span>
        </div>
      </div>

      {/* Tour Info */}
      <div className="p-5">
        {/* Tour Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {tour.packageName || 'Untitled Tour'}
        </h3>

        {/* Location */}
        {tour.location && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="line-clamp-1">{tour.location}</span>
          </div>
        )}

        {/* Overview */}
        {tour.overview && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
            {tour.overview}
          </p>
        )}

        {/* Tour Items Tags */}
        {tour.TourItems && tour.TourItems.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tour.TourItems.slice(0, 2).map((item) => (
              <span
                key={item.id}
                className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                {item.name}
              </span>
            ))}
            {tour.TourItems.length > 2 && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                +{tour.TourItems.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Pricing Section */}
        <div className="border-t pt-4 flex items-end justify-between">
          <div>
            {tour.discount > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Original</p>
                <p className="text-sm text-gray-500 line-through">LKR {Number(tour.price).toFixed(2)}</p>
                <p className="text-xl font-bold text-green-600">LKR {finalPrice.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-2xl font-bold text-blue-600">LKR {Number(tour.price).toFixed(2)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tour);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            View
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
  maxAvailablePrice
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </h2>
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Price Range
        </h3>

        {/* Min Price */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 mb-2">Min Price</label>
          <input
            type="range"
            min="0"
            max={maxAvailablePrice || 10000}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-gray-900">LKR {minPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Max Price */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 mb-2">Max Price</label>
          <input
            type="range"
            min="0"
            max={maxAvailablePrice || 10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-gray-900">LKR {maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Price Range Display */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-center font-semibold text-blue-900">
            LKR {minPrice.toLocaleString()} - LKR {maxPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4" />
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
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">All Tours</span>
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
              <span className="text-sm text-gray-700 group-hover:text-gray-900">Active Tours</span>
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
              <span className="text-sm text-gray-700 group-hover:text-gray-900">Inactive Tours</span>
            </div>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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

  // Filter state
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [statusFilter, setStatusFilter] = useState('all');
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

          // Calculate max price from tours
          if (toursData.length > 0) {
            const prices = toursData.map(tour => tour.price || 0);
            const max = Math.max(...prices);
            setMaxAvailablePrice(Math.ceil(max * 1.5)); // Add 50% cushion
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
  }, [tours, minPrice, maxPrice, statusFilter]);

  /* =========================
     RESET FILTERS
  ========================== */
  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(maxAvailablePrice);
    setStatusFilter('all');
  };

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
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Loading tours...</p>
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
      <div className="w-full h-full flex flex-col">
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
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="w-full md:w-[95%] lg:w-[90%] mx-auto py-8 px-4">
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Explore Our Tours
            </h1>
            <p className="text-gray-600 text-lg">
              Discover amazing experiences at the best prices
            </p>
          </div>

          {/* Results Count */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold">
              Showing <span className="text-lg font-bold">{filteredTours.length}</span> of{' '}
              <span className="text-lg font-bold">{tours.length}</span> tours
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
              />
            </div>

            {/* Right Side: Tour Cards */}
            <div className="lg:col-span-3">
              {filteredTours.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="mb-4">
                    <X className="w-16 h-16 text-gray-300 mx-auto" />
                  </div>
                  <p className="text-xl text-gray-600 font-semibold mb-2">No tours found</p>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters to find more tours
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
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
