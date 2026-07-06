import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Calendar, MapPin, Search, ChevronDown, CheckCircle, Package, X, User, Mail, Phone, Globe, FileText, CreditCard, Users } from 'lucide-react';

export default function TourBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${backendBaseUrl}/manager/tour-bookings`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (data && data.success) {
          setBookings(data.data || []);
          setError(null);
        } else {
          setError('Failed to fetch tour bookings');
        }
      } catch (err) {
        console.error('Error fetching tour bookings:', err);
        setError('Failed to load tour bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [backendBaseUrl]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value) => `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchSearch = searchTerm === '' || 
        (booking.fullName && booking.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.bookingRef && booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.inquiryRef && booking.inquiryRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.packageName && booking.packageName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium animate-pulse">Loading confirmed tour bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg shadow-sm border border-red-100">
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 text-slate-900">
      {/* Premium Dashboard Header Card */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Calendar size={12} className="animate-pulse" />
              Confirmed Tours
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Confirmed Tour Bookings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Overview of all confirmed tour bookings, passenger numbers, payment deposits, and active balances.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex gap-4 w-full xl:w-auto shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner min-w-[140px] text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <p className="mt-1 text-2xl font-black text-slate-800">{bookings.length}</p>
          </div>
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 shadow-inner min-w-[180px] text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Revenue</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, ref or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="half_paid">Half Paid (Deposit)</option>
            <option value="full_paid">Fully Paid</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No bookings found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              We couldn't find any confirmed tour bookings matching your current filters.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div 
              key={booking.id} 
              onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Left col: Core info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                      Booking: {booking.bookingRef}
                    </div>
                    {booking.inquiryRef && (
                      <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                        Inquiry: {booking.inquiryRef}
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 ${
                      booking.status === 'half_paid' ? 'bg-orange-50 text-orange-700' : 
                      booking.status === 'full_paid' ? 'bg-emerald-50 text-emerald-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{booking.packageName || 'Unknown Package'}</h3>
                    <p className="text-slate-500 font-medium">{booking.fullName || 'Unknown Customer'}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{formatDate(booking.tourStartDate)}</span>
                    </div>
                    {booking.duration && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{booking.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                       <span className="font-medium bg-slate-100 px-2 rounded-md">
                          {booking.numberOfAdults || 1} Adult(s) {booking.numberOfChildren > 0 && `, ${booking.numberOfChildren} Child(ren)`}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Right col: Financials */}
                <div className="lg:w-64 bg-slate-50 rounded-xl p-4 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Total Amount</span>
                      <span className="font-bold text-slate-800">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Deposit Paid</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(booking.depositAmount)}</span>
                    </div>
                    <div className="h-px w-full bg-slate-200"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Balance Due</span>
                      <span className="font-bold text-orange-600">{formatCurrency(booking.remainingAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Tour Booking Details Dialog Popup Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                    Booking: {selectedBooking.bookingRef}
                  </span>
                  {selectedBooking.inquiryRef && (
                    <span className="text-[10px] font-bold text-slate-650 tracking-wider bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                      Inquiry: {selectedBooking.inquiryRef}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-xl text-slate-800 mt-2.5">Tour Booking Details</h3>
              </div>
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedBooking(null); }}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-2 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Tour Information */}
              <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/30 space-y-3.5">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider text-[10px]">
                  <Package size={14} /> <span>Selected Excursion Package</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-snug">{selectedBooking.packageName}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Duration: {selectedBooking.duration || "N/A"}</p>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <span className="text-[10px] text-slate-450 block font-bold uppercase">Tour Departure Date</span>
                    <span className="font-extrabold text-slate-800 text-sm flex items-center md:justify-end gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(selectedBooking.tourStartDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Customer / Passenger Details */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" /> Guest Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Contact Name</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nationality</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.nationality || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-850 mt-0.5 block flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" /> {selectedBooking.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone Number</span>
                    <span className="font-bold text-slate-850 mt-0.5 block flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" /> {selectedBooking.phone || "Not Provided"}
                    </span>
                  </div>
                  {selectedBooking.nic && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">NIC (National Identity Card)</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.nic}</span>
                    </div>
                  )}
                  {selectedBooking.passportId && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Passport ID</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.passportId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 block">Passenger Breakdown</span>
                    <span className="font-bold text-slate-850 mt-0.5 block flex items-center gap-1.5">
                      <Users size={13} className="text-slate-400" />
                      {selectedBooking.numberOfAdults || 1} Adult(s) {selectedBooking.numberOfChildren > 0 && `, ${selectedBooking.numberOfChildren} Child(ren)`}
                    </span>
                  </div>
                  {selectedBooking.pickupLocation && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pickup Location</span>
                      <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5 text-blue-650">
                        <MapPin size={13} className="text-blue-500" /> {selectedBooking.pickupLocation}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" /> Special Requests & Notes
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 italic leading-relaxed">
                    "{selectedBooking.specialRequests}"
                  </div>
                </div>
              )}

              {/* Row 4: Billing & Payments */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-400" /> Billing & Payments
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-550">
                    <span>Tour Price Package:</span>
                    <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-emerald-600">
                    <span>Deposit Paid (Online):</span>
                    <span>{formatCurrency(selectedBooking.depositAmount)}</span>
                  </div>
                  <div className="h-px bg-slate-200 w-full" />
                  <div className="flex justify-between items-center text-sm font-black">
                    <span className="text-slate-700">Remaining Balance:</span>
                    <span className={parseFloat(selectedBooking.remainingAmount) > 0 ? "text-orange-600" : "text-emerald-600"}>
                      {formatCurrency(selectedBooking.remainingAmount)}
                    </span>
                  </div>
                  {selectedBooking.balancePaidAt && (
                    <div className="text-[10px] text-slate-450 mt-1 border-t border-slate-200/50 pt-2 flex justify-between">
                      <span>Cleared: {new Date(selectedBooking.balancePaidAt).toLocaleString()}</span>
                      <span>Method: {selectedBooking.balancePaymentMethod?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedBooking(null); }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
