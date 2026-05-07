import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader, ChevronDown, DollarSign, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

export default function TourPaymentTracking() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats] = useState(null);

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendBaseUrl}/tour-payment`);
      const data = await response.json();
      
      if (data.success) {
        let filtered = data.data || [];
        if (filter !== 'all') {
          filtered = filtered.filter(p => p.paymentStatus === filter);
        }
        setPayments(filtered);
        setError(null);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, filter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${backendBaseUrl}/tour-payment/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [backendBaseUrl]);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      success: 'bg-green-100 text-green-800 border border-green-300',
      failed: 'bg-red-100 text-red-800 border border-red-300',
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5 text-yellow-600" />,
      success: <CheckCircle className="w-5 h-5 text-green-600" />,
      failed: <XCircle className="w-5 h-5 text-red-600" />,
    };
    return icons[status] || icons.pending;
  };

  const getPaymentTypeLabel = (type) => {
    return type === 'deposit' ? '50% Advance' : 'Final Payment (50%)';
  };

  const getBookingRef = (payment) => {
    return payment.TourBooking?.bookingRef || 'N/A';
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 bg-gray-50">
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Tracking</h1>
            <p className="text-gray-600">Monitor tour payment status and transactions</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Payments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions ?? stats.total ?? 0}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Successful</p>
                    <p className="text-3xl font-bold text-green-600">{stats.successful ?? stats.success ?? 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Failed</p>
                    <p className="text-3xl font-bold text-red-600">{stats.failed || 0}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
            {['all', 'pending', 'success', 'failed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
                  filter === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'all' ? 'All Payments' : status.charAt(0).toUpperCase() + status.slice(1)}
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

          {/* Payments List */}
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No payments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  
                  {/* Payment Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        {getStatusIcon(payment.paymentStatus)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{getPaymentTypeLabel(payment.paymentType)}</p>
                        <p className="text-sm text-gray-700">Booking Ref: {getBookingRef(payment)}</p>
                        <p className="text-sm text-gray-600">Amount: {formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(payment.paymentStatus)}`}>
                        {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === payment.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Payment Details */}
                  {expandedId === payment.id && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Payment Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Payment Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment ID:</span>
                              <span className="font-mono">{payment.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-semibold">{getPaymentTypeLabel(payment.paymentType)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Booking Ref:</span>
                              <span className="font-semibold">{getBookingRef(payment)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-bold text-blue-600">{formatCurrency(payment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-semibold capitalize">{payment.paymentMethod || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-semibold ${
                                payment.paymentStatus === 'success' ? 'text-green-600' :
                                payment.paymentStatus === 'failed' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Transaction Details</h4>
                          <div className="space-y-2 text-sm">
                            {payment.payhereOrderId && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-mono">{payment.payhereOrderId}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Booking ID:</span>
                              <span className="font-mono">{payment.bookingId}</span>
                            </div>
                            {payment.paidAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Paid On:</span>
                                <span>{new Date(payment.paidAt).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created At:</span>
                              <span>{new Date(payment.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Failed Payment Info */}
                      {payment.paymentStatus === 'failed' && (
                        <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                          <h4 className="font-bold text-red-900 mb-2">Payment Failed</h4>
                          <p className="text-sm text-red-800">
                            This payment could not be processed. Customer should retry payment or contact support.
                          </p>
                        </div>
                      )}

                      {/* Success Info */}
                      {payment.paymentStatus === 'success' && (
                        <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                          <h4 className="font-bold text-green-900 mb-2">Payment Confirmed</h4>
                          <p className="text-sm text-green-800">
                            Payment successfully processed and recorded.
                          </p>
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
    </div>
  );
}
