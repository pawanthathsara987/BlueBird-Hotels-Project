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
  const [emailingInquiryId, setEmailingInquiryId] = useState(null);
  const [emailFormByInquiry, setEmailFormByInquiry] = useState({});

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
    return `$${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const getDefaultPricePerGuest = (inquiry) => {
    const basePrice = Number(inquiry?.Tour?.price || 0);
    const discount = Number(inquiry?.Tour?.discount || 0);
    if (!Number.isFinite(basePrice)) return 0;
    return discount > 0 ? basePrice - (basePrice * discount / 100) : basePrice;
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
        alert('Inquiry accepted. You can now send a customized email to the guest.');
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

  const openEmailForm = (inquiry) => {
    const defaultForm = {
      pricePerGuest: String(getDefaultPricePerGuest(inquiry) || ''),
      numberOfAdults: String(Number(inquiry.numberOfAdults || 1)),
      numberOfChildren: String(Number(inquiry.numberOfChildren || 0)),
      tourStartDate: inquiry.startDate ? inquiry.startDate.split('T')[0] : '',
      managerNote: '',
    };

    setEmailFormByInquiry((prev) => ({
      ...prev,
      [inquiry.id]: prev[inquiry.id] || defaultForm,
    }));
    setEmailingInquiryId(inquiry.id);
  };

  const closeEmailForm = () => {
    setEmailingInquiryId(null);
  };

  const handleEmailFormChange = (inquiryId, field, value) => {
    setEmailFormByInquiry((prev) => ({
      ...prev,
      [inquiryId]: {
        ...prev[inquiryId],
        [field]: value,
      },
    }));
  };

  const handleSendAcceptedEmail = async (inquiry) => {
    const form = emailFormByInquiry[inquiry.id] || {};
    const payload = {
      pricePerGuest: Number(form.pricePerGuest),
      numberOfAdults: Number(form.numberOfAdults),
      numberOfChildren: Number(form.numberOfChildren),
      tourStartDate: form.tourStartDate || inquiry.startDate,
      managerNote: (form.managerNote || '').trim(),
    };

    if (!Number.isFinite(payload.pricePerGuest) || payload.pricePerGuest <= 0) {
      alert('Please enter a valid price per guest.');
      return;
    }

    if (!Number.isInteger(payload.numberOfAdults) || payload.numberOfAdults < 1) {
      alert('Adults must be 1 or more.');
      return;
    }

    if (!Number.isInteger(payload.numberOfChildren) || payload.numberOfChildren < 0) {
      alert('Children cannot be negative.');
      return;
    }

    if (!payload.tourStartDate) {
      alert('Please select a tour start date.');
      return;
    }

    setProcessing(inquiry.id);
    try {
      const response = await fetch(`${backendBaseUrl}/tour-inquiry/${inquiry.id}/send-accepted-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Email sent to ${inquiry.email}`);
        setEmailingInquiryId(null);
        await fetchInquiries();
      } else {
        alert(data.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending accepted inquiry email:', err);
      alert('Failed to send email');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 text-center shadow-xl backdrop-blur">
          <Loader className="mx-auto mb-4 h-12 w-12 text-slate-700 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Operations Panel</p>
          <p className="mt-2 text-slate-700">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_28%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Operations Dashboard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Tour Inquiries</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Review customer requests, approve or reject them, and send customized quote emails from a single control panel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-lg">
              {[
                { label: 'Total', value: allInquiries.length, accent: 'from-sky-500 to-cyan-400' },
                { label: 'Pending', value: statusCounts.pending, accent: 'from-amber-500 to-orange-400' },
                { label: 'Accepted', value: statusCounts.accepted, accent: 'from-emerald-500 to-teal-400' },
                { label: 'Rejected', value: statusCounts.rejected, accent: 'from-rose-500 to-pink-400' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-sm">
                  <div className={`mb-3 h-1.5 w-12 rounded-full bg-linear-to-r ${item.accent}`} />
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {['pending', 'accepted', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  filter === status
                    ? status === 'pending'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                      : status === 'accepted'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-rose-600 text-white shadow-md shadow-rose-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'pending' ? 'Pending' : status === 'accepted' ? 'Accepted' : 'Rejected'}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${filter === status ? 'bg-white/20 text-white' : 'bg-white text-slate-700'}`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Active filter: <span className="font-semibold capitalize text-slate-900">{filter}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-800 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load inquiries</p>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-800">No {filter} inquiries</p>
            <p className="mt-2 text-sm text-slate-500">Once inquiries arrive, they will appear here for review and follow-up.</p>
          </div>
        ) : (
          <div className="space-y-5">
              {inquiries.map(inquiry => (
                <div key={inquiry.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
                  
                  {/* Inquiry Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                    className="w-full border-l-4 border-slate-200 px-5 py-5 text-left transition-colors hover:bg-slate-50 md:px-6"
                  >
                    <div className="flex flex-1 items-start gap-4 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="truncate text-lg font-semibold text-slate-900">{getInquiryName(inquiry)}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(inquiry.status)}`}>
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Ref: {inquiry.inquiryRef} • Submitted: {formatDate(inquiry.createdAt)}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 font-medium text-sky-700">
                            {getTourPackageName(inquiry)}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                            Start: {formatDate(inquiry.startDate)}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                            Guests: {(inquiry.numberOfAdults || 0) + (inquiry.numberOfChildren || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-4">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === inquiry.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Inquiry Details */}
                  {expandedId === inquiry.id && (
                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 md:px-6">
                      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        
                        {/* Contact Info */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact Information</h4>
                          <div className="space-y-3 text-sm text-slate-700">
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="break-all">{inquiry.email}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <Phone className="h-4 w-4 text-slate-500" />
                              <span>{inquiry.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span>{inquiry.nationality}</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Booking Information</h4>
                          <div className="grid gap-3 text-sm text-slate-700">
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <AlertCircle className="h-4 w-4 text-slate-500" />
                              <span><strong className="text-slate-900">Tour Package:</strong> {inquiry.Tour?.packageName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <AlertCircle className="h-4 w-4 text-slate-500" />
                              <span><strong className="text-slate-900">Quoted Price:</strong> {formatCurrency(inquiry.Tour?.price)}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span><strong className="text-slate-900">Start Date:</strong> {formatDate(inquiry.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span><strong className="text-slate-900">Guests:</strong> {inquiry.numberOfAdults} Adult(s), {inquiry.numberOfChildren} Child(ren)</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span><strong className="text-slate-900">Pickup:</strong> {inquiry.pickupLocation}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {inquiry.status === 'rejected' && inquiry.rejectionReason && (
                        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                          <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Rejection Reason</h4>
                          <p className="text-sm leading-6 text-rose-800">{inquiry.rejectionReason}</p>
                        </div>
                      )}

                      {/* Special Requests */}
                      {inquiry.specialRequests && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Special Requests</h4>
                          <p className="text-sm leading-6 text-slate-700">{inquiry.specialRequests}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {inquiry.status === 'pending' && (
                        <div className="flex flex-col gap-3 md:flex-row">
                          <button
                            onClick={() => handleAccept(inquiry.id)}
                            disabled={processing === inquiry.id}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-gray-400"
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
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:bg-gray-400"
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

                      {inquiry.status === 'accepted' && (
                        <div className="space-y-4">
                          {emailingInquiryId !== inquiry.id ? (
                            <button
                              onClick={() => openEmailForm(inquiry)}
                              disabled={processing === inquiry.id}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:bg-gray-400"
                            >
                              {processing === inquiry.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                              Send Email to Guest
                            </button>
                          ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                  <h4 className="text-lg font-semibold text-slate-900">Customize Quote Email</h4>
                                  <p className="text-sm text-slate-500">Adjust the quote, guest count, date, and note before sending.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">Ref {inquiry.inquiryRef}</span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">{getTourPackageName(inquiry)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Package Price (USD) *</label>
                                  <p className="mb-2 text-xs text-slate-500">Final total for the entire package</p>
                                  <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={emailFormByInquiry[inquiry.id]?.pricePerGuest || ''}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'pricePerGuest', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Adults</label>
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={emailFormByInquiry[inquiry.id]?.numberOfAdults || '1'}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'numberOfAdults', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Children</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={emailFormByInquiry[inquiry.id]?.numberOfChildren || '0'}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'numberOfChildren', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tour Start Date</label>
                                <input
                                  type="date"
                                  value={emailFormByInquiry[inquiry.id]?.tourStartDate || ''}
                                  onChange={(e) => handleEmailFormChange(inquiry.id, 'tourStartDate', e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Manager Note (Optional)</label>
                                <textarea
                                  rows={3}
                                  value={emailFormByInquiry[inquiry.id]?.managerNote || ''}
                                  onChange={(e) => handleEmailFormChange(inquiry.id, 'managerNote', e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                                  placeholder="Add any special notes for the guest"
                                />
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row">
                                <button
                                  onClick={() => handleSendAcceptedEmail(inquiry)}
                                  disabled={processing === inquiry.id}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:bg-gray-400"
                                >
                                  {processing === inquiry.id ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Mail className="w-4 h-4" />
                                  )}
                                  {processing === inquiry.id ? 'Sending...' : 'Send Email'}
                                </button>
                                <button
                                  onClick={closeEmailForm}
                                  disabled={processing === inquiry.id}
                                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
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
  );
}
