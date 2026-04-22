import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, DollarSign, Check, AlertCircle, Heart, Share2, Loader } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

export default function TourDetailsPage() {
  const location = useLocation();
  const selectedTour = location.state?.tour || null;
  const tourIdFromQuery = new URLSearchParams(location.search).get('tourId');
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    numberOfAdults: 1,
    numberOfChildren: 0,
    startDate: '',
    pickupLocation: '',
    specialRequests: '',
  });

  const [errors, setErrors] = useState({});

  // Prefer selected tour from navigation state, then fallback to API.
  useEffect(() => {
    if (selectedTour) {
      setTour(selectedTour);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchTour = async () => {
      try {
        setLoading(true);
        const endpoint = tourIdFromQuery
          ? `${backendBaseUrl}/manager/tours/${tourIdFromQuery}`
          : `${backendBaseUrl}/manager/tours`;
        const response = await axios.get(endpoint);

        if (tourIdFromQuery) {
          if (response.data.success && response.data.data) {
            setTour(response.data.data);
            setError(null);
          } else {
            setError('Tour not found');
          }
        } else if (response.data.success && response.data.data.length > 0) {
          setTour(response.data.data[0]);
          setError(null);
        } else {
          setError('No tours available');
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
        setError(error.message || 'Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [backendBaseUrl, selectedTour, tourIdFromQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfAdults' || name === 'numberOfChildren' ? parseInt(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (formData.numberOfAdults < 1) newErrors.numberOfAdults = 'At least 1 adult is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit inquiry to backend
      const response = await axios.post(`${backendBaseUrl}/tour-inquiry`, {
        tourId: tour.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        numberOfAdults: formData.numberOfAdults,
        numberOfChildren: formData.numberOfChildren,
        startDate: formData.startDate,
        pickupLocation: formData.pickupLocation,
        specialRequests: formData.specialRequests,
      });

      if (response.data.success) {
        // Get inquiry data
        const inquiryData = response.data.data;
        
        // Show confirmation message
        alert(`Inquiry submitted successfully!\nReference: ${inquiryData.inquiryRef}\n\nPlease wait for manager approval.`);
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          nationality: '',
          numberOfAdults: 1,
          numberOfChildren: 0,
          startDate: '',
          pickupLocation: '',
          specialRequests: '',
        });

        setError(null);
      } else {
        setError(response.data.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (!tour) return 0;
    const finalPrice = tour.discount 
      ? tour.price - (tour.price * tour.discount / 100)
      : tour.price;
    return finalPrice * (formData.numberOfAdults + formData.numberOfChildren);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tour details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-md">
            <p className="font-semibold mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const finalPrice = tour.discount 
    ? tour.price - (tour.price * tour.discount / 100)
    : tour.price;

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Tour Details */}
            <div className="lg:col-span-2">
              
              {/* Tour Hero Image */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 relative group">
                {tour.image ? (
                  <img src={tour.image} alt={tour.packageName} className="w-full h-80 object-cover" />
                ) : (
                  <div className="w-full h-80 bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <p className="text-white text-center text-2xl font-semibold">{tour.packageName}</p>
                  </div>
                )}
                
                {/* Wishlist & Share Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setWishlist(!wishlist)}
                    className="bg-white hover:bg-red-50 p-3 rounded-full shadow-lg transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${wishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="bg-white hover:bg-blue-50 p-3 rounded-full shadow-lg transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Discount Badge */}
                {tour.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                    {tour.discount}% OFF
                  </div>
                )}
              </div>

              {/* Tour Overview */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{tour.packageName}</h1>
                    {tour.location && (
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="text-lg">{tour.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Info */}
                {tour.groupSize && (
                  <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Group Size</p>
                      <p className="font-bold text-gray-900">{tour.groupSize} People</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Starting Price</p>
                      <p className="font-bold text-green-600">LKR {Number(finalPrice).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`font-bold ${tour.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {tour.status === 'active' ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Overview */}
                {tour.overview && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{tour.overview}</p>
                  </div>
                )}

                {/* Includes */}
                {tour.TourItems && tour.TourItems.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {tour.TourItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Check className="w-5 h-5 text-green-600 shrink-0" />
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                {tour.termsConditions && (
                  <div className="border-t pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Terms & Conditions</h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{tour.termsConditions}</p>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Book Your Tour</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone & Nationality */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nationality *</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Your nationality"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                          errors.nationality ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                    </div>
                  </div>

                  {/* Adults & Children */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of Adults *</label>
                      <select
                        name="numberOfAdults"
                        value={formData.numberOfAdults}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      {errors.numberOfAdults && <p className="text-red-500 text-sm mt-1">{errors.numberOfAdults}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of Children</label>
                      <select
                        name="numberOfChildren"
                        value={formData.numberOfChildren}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Location *</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="Enter pickup location (e.g., Colombo Hotel, Negombo Beach)"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                        errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.pickupLocation && <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Any special requirements or requests? (dietary restrictions, accessibility needs, etc.)"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={tour.status !== 'active' || isSubmitting}
                    className={`w-full font-bold py-4 rounded-lg transition-colors text-lg mt-8 flex items-center justify-center gap-2 ${
                      tour.status === 'active' && !isSubmitting
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting && <Loader size={20} className="animate-spin" />}
                    {isSubmitting ? 'Submitting...' : (tour.status === 'active' ? 'Submit Booking' : 'Tour Not Available')}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-4 h-fit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h3>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per person</span>
                    <span className="font-bold text-lg">LKR {Number(finalPrice).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Adults: {formData.numberOfAdults}
                    </span>
                    <span className="font-bold">LKR {(finalPrice * formData.numberOfAdults).toFixed(2)}</span>
                  </div>

                  {formData.numberOfChildren > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Children: {formData.numberOfChildren}
                      </span>
                      <span className="font-bold">LKR {(finalPrice * formData.numberOfChildren).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-bold text-gray-900 text-lg">Total Cost</span>
                    <span className="font-bold text-blue-600 text-3xl">LKR {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Discount */}
                {tour.discount > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-700 font-bold">✓ {tour.discount}% Discount Applied!</p>
                    <p className="text-xs text-green-600 mt-1">You're saving LKR {(tour.price * tour.discount / 100 * (formData.numberOfAdults + formData.numberOfChildren)).toFixed(2)}</p>
                  </div>
                )}

                {/* Info Cards */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">Payment will be collected upon tour confirmation</p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Check className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">Free cancellation up to 24 hours before</p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Check className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">Instant booking confirmation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
