import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader, ChevronDown, Mail, Phone, MapPin, Users, Calendar } from 'lucide-react';

export default function TourInquiriesManagement() {
  const [allInquiries, setAllInquiries] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [processing, setProcessing] = useState(null);

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

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

  const formatLkr = (amount) => {
    if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return 'N/A';
    return `LKR ${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getInquiryName = (inquiry) => {
    return (
      inquiry.fullName ||
      inquiry.name ||
      inquiry.customerName ||
      [inquiry.firstName, inquiry.lastName].filter(Boolean).join(' ') ||
      'Name not provided'
    );
  };

  const getTourPackageName = (inquiry) => {
    return inquiry.Tour?.packageName || inquiry.tour?.packageName || inquiry.packageName || 'Tour package not found';
  };

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, accepted: 0, rejected: 0 };
    allInquiries.forEach((inq) => {
      if (counts[inq.status] !== undefined) {
        counts[inq.status] += 1;
      }
    });
    return counts;
  }, [allInquiries]);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendBaseUrl}/tour-inquiry`);
      const data = await response.json();
      
      if (data.success) {
        setAllInquiries(data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch inquiries');
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl]);

  // Fetch inquiries
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    const filtered = allInquiries.filter((inq) => {
      if (filter === 'pending') return inq.status === 'pending';
      if (filter === 'accepted') return inq.status === 'accepted';
      if (filter === 'rejected') return inq.status === 'rejected';
      return true;
    });
    setInquiries(filtered);
  }, [allInquiries, filter]);

  const handleAccept = async (inquiryId) => {
    setProcessing(inquiryId);
    try {
      const response = await fetch(`${backendBaseUrl}/tour-inquiry/${inquiryId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Inquiry accepted! Booking and tokens generated.');
        await fetchInquiries();
      } else {
        alert(data.message || 'Failed to accept inquiry');
      }
    } catch (err) {
      console.error('Error accepting inquiry:', err);
      alert('Failed to accept inquiry');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to reject this inquiry?')) return;
    
    setProcessing(inquiryId);
    try {
      const response = await fetch(`${backendBaseUrl}/tour-inquiry/${inquiryId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Inquiry rejected');
        await fetchInquiries();
      } else {
        alert(data.message || 'Failed to reject inquiry');
      }
    } catch (err) {
      console.error('Error rejecting inquiry:', err);
      alert('Failed to reject inquiry');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading inquiries...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tour Inquiries</h1>
            <p className="text-gray-600">Manage customer booking requests</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            {['pending', 'accepted', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors capitalize ${
                  filter === status
                    ? status === 'pending'
                      ? 'border-amber-500 text-amber-700'
                      : status === 'accepted'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-rose-600 text-rose-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'pending' ? 'Pending' : status === 'accepted' ? 'Accepted' : 'Rejected'}
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  filter === status
                    ? status === 'pending'
                      ? 'bg-amber-100 text-amber-800 ml-2'
                      : status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 ml-2'
                        : 'bg-rose-100 text-rose-800 ml-2'
                    : 'bg-gray-100 text-gray-700 ml-2'
                }`}>
                  {statusCounts[status]}
                </span>
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

          {/* Inquiries List */}
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No {filter} inquiries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map(inquiry => (
                <div key={inquiry.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  
                  {/* Inquiry Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div>
                        <p className="font-bold text-gray-900">{getInquiryName(inquiry)}</p>
                        <p className="text-sm text-gray-600">Ref: {inquiry.inquiryRef} • Submitted: {formatDate(inquiry.createdAt)}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {getTourPackageName(inquiry)}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Start: {formatDate(inquiry.startDate)}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Guests: {(inquiry.numberOfAdults || 0) + (inquiry.numberOfChildren || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === inquiry.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Inquiry Details */}
                  {expandedId === inquiry.id && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        
                        {/* Contact Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-600" />
                              <span>{inquiry.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-600" />
                              <span>{inquiry.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span>{inquiry.nationality}</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Booking Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-gray-600" />
                              <span><strong>Tour Package:</strong> {inquiry.Tour?.packageName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-gray-600" />
                              <span><strong>Quoted Price:</strong> {formatLkr(inquiry.Tour?.price)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span><strong>Start Date:</strong> {formatDate(inquiry.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span><strong>Guests:</strong> {inquiry.numberOfAdults} Adult(s), {inquiry.numberOfChildren} Child(ren)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span><strong>Pickup:</strong> {inquiry.pickupLocation}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {inquiry.status === 'rejected' && inquiry.rejectionReason && (
                        <div className="mb-6 p-4 bg-rose-50 rounded border border-rose-200">
                          <h4 className="font-bold text-rose-800 mb-2">Rejection Reason</h4>
                          <p className="text-sm text-rose-700">{inquiry.rejectionReason}</p>
                        </div>
                      )}

                      {/* Special Requests */}
                      {inquiry.specialRequests && (
                        <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-2">Special Requests</h4>
                          <p className="text-sm text-gray-700">{inquiry.specialRequests}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {inquiry.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(inquiry.id)}
                            disabled={processing === inquiry.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
                          >
                            {processing === inquiry.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {processing === inquiry.id ? 'Processing...' : 'Accept & Create Booking'}
                          </button>
                          <button
                            onClick={() => handleReject(inquiry.id)}
                            disabled={processing === inquiry.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
                          >
                            {processing === inquiry.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            {processing === inquiry.id ? 'Processing...' : 'Reject'}
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
    </div>
  );
}
