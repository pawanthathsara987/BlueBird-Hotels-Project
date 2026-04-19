import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, ChevronDown, Calendar, Users, DollarSign, TrendingUp, XCircle } from 'lucide-react';
import Header from '../../components/header';
import Footer from '../../components/footer';

export default function TourBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [stats, setStats] = useState(null);

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `${backendBaseUrl}/tour-booking`;
      
      if (filter !== 'all') {
        url = `${backendBaseUrl}/tour-booking/status/${filter}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${backendBaseUrl}/tour-booking/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCanceling(bookingId);
    try {
      const response = await fetch(`${backendBaseUrl}/tour-booking/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking canceled successfully');
        await fetchBookings();
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error canceling booking:', err);
      alert('Failed to cancel booking');
    } finally {
      setCanceling(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      payment_pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      half_paid: 'bg-blue-100 text-blue-800 border border-blue-300',
      completed: 'bg-green-100 text-green-800 border border-green-300',
      cancelled: 'bg-red-100 text-red-800 border border-red-300',
    };
    return badges[status] || badges.payment_pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      payment_pending: 'Payment Pending',
      half_paid: '50% Paid',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading bookings...</p>
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
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tour Bookings</h1>
            <p className="text-gray-600">Manage confirmed tour reservations and payment status</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Payment</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.payment_pending || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">50% Paid</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.half_paid || 0}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
            {['all', 'payment_pending', 'half_paid', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
                  filter === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'all' ? 'All Bookings' : getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  
                  {/* Booking Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div>
                        <p className="font-bold text-gray-900">Booking Ref: {booking.bookingRef}</p>
                        <p className="text-sm text-gray-600">Total: ${Number(booking.totalAmount)?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === booking.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Booking Details */}
                  {expandedId === booking.id && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        
                        {/* Booking Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Booking Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Booking Ref:</span>
                              <span className="font-semibold">{booking.bookingRef}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Token:</span>
                              <span className="font-mono text-xs bg-white px-2 py-1 rounded">{booking.paymentToken?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Token Expires:</span>
                              <span>{new Date(booking.tokenExpiresAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Payment Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-semibold">${Number(booking.totalAmount)?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">50% Advance:</span>
                              <span className="font-semibold text-blue-600">${Number(booking.depositAmount)?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining (50%):</span>
                              <span className="font-semibold text-green-600">${Number(booking.remainingAmount)?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {booking.notes && (
                        <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-2">Manager Notes</h4>
                          <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                      )}

                      {/* Refund Info */}
                      {booking.status === 'cancelled' && (
                        <div className="mb-6 p-4 bg-orange-50 rounded border border-orange-200">
                          <h4 className="font-bold text-orange-900 mb-2">Cancellation Details</h4>
                          <div className="space-y-1 text-sm text-orange-800">
                            <div className="flex justify-between">
                              <span>Refund Status:</span>
                              <span className="font-semibold">{booking.refundStatus || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Refund Amount:</span>
                              <span className="font-semibold">${Number(booking.refundAmount)?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {booking.status !== 'cancelled' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={canceling === booking.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
                          >
                            {canceling === booking.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {canceling === booking.id ? 'Canceling...' : 'Cancel Booking'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
