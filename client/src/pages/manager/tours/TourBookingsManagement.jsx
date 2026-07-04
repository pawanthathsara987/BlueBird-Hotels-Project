import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Calendar, MapPin, Search, ChevronDown, CheckCircle, Package } from 'lucide-react';

export default function TourBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
            <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Left col: Core info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between sm:justify-start gap-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                      {booking.bookingRef}
                    </div>
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
    </div>
  );
}
