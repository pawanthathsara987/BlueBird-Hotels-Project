import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader, ChevronDown, Mail, Phone, MapPin, Users, Calendar, Search, CheckCircle, Package, User, Globe, FileText, CreditCard } from 'lucide-react';
import axios from 'axios';

export default function TourInquiriesManagement() {
  const [allInquiries, setAllInquiries] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [tourFilter, setTourFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [emailingInquiryId, setEmailingInquiryId] = useState(null);
  const [emailFormByInquiry, setEmailFormByInquiry] = useState({});
  const [emailSentByInquiry, setEmailSentByInquiry] = useState(() => {
    const saved = localStorage.getItem('emailSentByInquiry');
    return saved ? JSON.parse(saved) : {};
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

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


  const formatCurrency = (value) => `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  const hasAcceptedEmailSent = (inquiry) => {
    if (!inquiry || !inquiry.id) return false;
    if (emailSentByInquiry[inquiry.id]) return true;

    // Support backend fields if added later, without breaking current payloads.
    return Boolean(
      inquiry.acceptedEmailSentAt ||
      inquiry.quoteEmailSentAt ||
      inquiry.emailSentAt ||
      inquiry.lastEmailSentAt
    );
  };

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, progress: 0, accepted: 0, rejected: 0, canceled: 0 };
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
      const { data } = await axios.get(`${backendBaseUrl}/tour-inquiry`);
      if (data && data.success) {
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

  // Save emailSentByInquiry to localStorage
  useEffect(() => {
    localStorage.setItem('emailSentByInquiry', JSON.stringify(emailSentByInquiry));
  }, [emailSentByInquiry]);

  useEffect(() => {
    const filtered = allInquiries.filter((inq) => {
      // Status filter
      let matchStatus = false;
      if (filter === 'pending') matchStatus = inq.status === 'pending';
      else if (filter === 'progress') matchStatus = inq.status === 'progress';
      else if (filter === 'accepted') matchStatus = inq.status === 'accepted';
      else if (filter === 'rejected') matchStatus = inq.status === 'rejected';
      else if (filter === 'canceled') matchStatus = inq.status === 'canceled';
      else matchStatus = true;

      // Tour filter (search by tour package name or destination)
      const tourName = getTourPackageName(inq).toLowerCase();
      const matchTour = tourFilter ? tourName.includes(tourFilter.toLowerCase()) : true;

      // Date filter (exact match on startDate, format: YYYY-MM-DD)
      const matchDate = dateFilter ? inq.startDate === dateFilter : true;

      return matchStatus && matchTour && matchDate;
    });
    setInquiries(filtered);
  }, [allInquiries, filter, tourFilter, dateFilter]);

  const handleAccept = async (inquiryId) => {
    setProcessing(inquiryId);
    try {
      const { data } = await axios.put(`${backendBaseUrl}/tour-inquiry/${inquiryId}/accept`);
      if (data && data.success) {
        showToast('Inquiry accepted. You can now send a customized email to the guest.', 'success');
        await fetchInquiries();
      } else {
        showToast((data && data.message) || 'Failed to accept inquiry', 'error');
      }
    } catch (err) {
      console.error('Error accepting inquiry:', err);
      showToast('Failed to accept inquiry', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to reject this inquiry?')) return;
    
    setProcessing(inquiryId);
    try {
      const { data } = await axios.put(`${backendBaseUrl}/tour-inquiry/${inquiryId}/reject`);
      if (data && data.success) {
        showToast('Inquiry rejected successfully', 'success');
        await fetchInquiries();
      } else {
        showToast((data && data.message) || 'Failed to reject inquiry', 'error');
      }
    } catch (err) {
      console.error('Error rejecting inquiry:', err);
      showToast('Failed to reject inquiry', 'error');
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
      showToast('Please enter a valid price per guest.', 'error');
      return;
    }

    if (!Number.isInteger(payload.numberOfAdults) || payload.numberOfAdults < 1) {
      showToast('Adults must be 1 or more.', 'error');
      return;
    }

    if (!Number.isInteger(payload.numberOfChildren) || payload.numberOfChildren < 0) {
      showToast('Children cannot be negative.', 'error');
      return;
    }

    if (!payload.tourStartDate) {
      showToast('Please select a tour start date.', 'error');
      return;
    }

    setProcessing(inquiry.id);
    try {
      const { data } = await axios.put(`${backendBaseUrl}/tour-inquiry/${inquiry.id}/send-accepted-email`, payload);
      if (data && data.success) {
        showToast(`Email sent to ${inquiry.email}`, 'success');
        setEmailSentByInquiry((prev) => ({
          ...prev,
          [inquiry.id]: true,
        }));
        setEmailingInquiryId(null);
        await fetchInquiries();
      } else {
        showToast((data && data.message) || 'Failed to send email', 'error');
      }
    } catch (err) {
      console.error('Error sending accepted inquiry email:', err);
      showToast('Failed to send email', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      progress: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      accepted: 'bg-blue-100 text-blue-800 border border-blue-300',
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 text-slate-900">
      {/* Premium Dashboard Header Card */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operations Panel
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Tour Inquiries Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Review customer requests, confirm bookings, reject inquiries, and generate customized quote emails from a single professional control interface.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full xl:w-auto shrink-0">
          {[
            { label: 'Total', value: allInquiries.length, bg: 'bg-slate-50 border-slate-200 text-slate-700' },
            { label: 'Pending', value: statusCounts.pending, bg: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'In Progress', value: statusCounts.progress, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Confirmed', value: statusCounts.accepted, bg: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Rejected', value: statusCounts.rejected, bg: 'bg-rose-50 border-rose-200 text-rose-700' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border p-4 shadow-inner text-center bg-white ${item.bg}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-1 text-xl font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {['pending', 'progress', 'accepted', 'rejected', 'canceled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  filter === status
                    ? status === 'pending'
                      ? 'bg-amber-100 text-amber-800 shadow-inner'
                      : status === 'progress'
                      ? 'bg-emerald-100 text-emerald-800 shadow-inner'
                      : status === 'accepted'
                      ? 'bg-blue-100 text-blue-800 shadow-inner'
                      : status === 'canceled'
                      ? 'bg-gray-200 text-gray-800 shadow-inner'
                      : 'bg-rose-100 text-rose-800 shadow-inner'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'pending' ? 'Pending' : status === 'progress' ? 'In Progress' : status === 'accepted' ? 'Confirmed' : status === 'canceled' ? 'Canceled' : 'Rejected'}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${filter === status ? 'bg-black/10 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                  {statusCounts[status] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
              <span className="text-sm font-medium text-slate-500">Tour:</span>
              <input
                type="text"
                placeholder="Search tour name..."
                value={tourFilter}
                onChange={(e) => setTourFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-900 outline-none w-32 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
              <span className="text-sm font-medium text-slate-500">Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-900 outline-none"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-transparent">
              Active status: <span className="font-semibold capitalize text-slate-900">{filter}</span>
            </div>
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
                          {inquiry.status === 'progress' && hasAcceptedEmailSent(inquiry) && (
                            <span className="rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                              Email Sent
                            </span>
                          )}
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
                            {inquiry.status === 'progress' && (
                              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                                <Mail className="h-4 w-4 text-slate-500" />
                                <span>
                                  <strong className="text-slate-900">Email Status:</strong>{' '}
                                  {hasAcceptedEmailSent(inquiry) ? (
                                    <span className="font-semibold text-emerald-700">Sent</span>
                                  ) : (
                                    <span className="font-semibold text-amber-700">Not sent yet</span>
                                  )}
                                </span>
                              </div>
                            )}
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
                        <div className="flex flex-col gap-3.5 md:flex-row">
                          <button
                            onClick={() => handleAccept(inquiry.id)}
                            disabled={processing === inquiry.id}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200 py-3.5 text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer"
                          >
                            {processing === inquiry.id ? (
                              <Loader className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <Check className="w-4 h-4 text-white" />
                            )}
                            {processing === inquiry.id ? 'Processing...' : 'Accept & Create Booking'}
                          </button>
                          <button
                            onClick={() => handleReject(inquiry.id)}
                            disabled={processing === inquiry.id}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-250 text-slate-600 disabled:bg-slate-100 py-3.5 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                          >
                            {processing === inquiry.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            {processing === inquiry.id ? 'Processing...' : 'Reject Inquiry'}
                          </button>
                        </div>
                      )}

                      {inquiry.status === 'progress' && (
                        <div className="space-y-4">
                          {emailingInquiryId !== inquiry.id ? (
                            <button
                              onClick={() => openEmailForm(inquiry)}
                              disabled={processing === inquiry.id}
                              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-200 py-3.5 text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer"
                            >
                              {processing === inquiry.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                              {hasAcceptedEmailSent(inquiry) ? 'Send Email Again' : 'Send Email to Guest'}
                            </button>
                          ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                  <h4 className="text-base font-bold text-slate-900">Customize Quote Email</h4>
                                  <p className="text-xs text-slate-450 font-medium mt-0.5">Adjust the quote parameters and note before sending.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px]">
                                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-bold text-slate-700">Ref {inquiry.inquiryRef}</span>
                                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-bold text-slate-700">{getTourPackageName(inquiry)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Total Package Price ({import.meta.env.VITE_CURRENCY_TYPE || 'LKR'}) *</label>
                                  <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={emailFormByInquiry[inquiry.id]?.pricePerGuest || ''}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'pricePerGuest', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Adults</label>
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={emailFormByInquiry[inquiry.id]?.numberOfAdults || '1'}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'numberOfAdults', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Children</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={emailFormByInquiry[inquiry.id]?.numberOfChildren || '0'}
                                    onChange={(e) => handleEmailFormChange(inquiry.id, 'numberOfChildren', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Tour Start Date</label>
                                <input
                                  type="date"
                                  value={emailFormByInquiry[inquiry.id]?.tourStartDate || ''}
                                  onChange={(e) => handleEmailFormChange(inquiry.id, 'tourStartDate', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Manager Note (Optional)</label>
                                <textarea
                                  rows={3}
                                  value={emailFormByInquiry[inquiry.id]?.managerNote || ''}
                                  onChange={(e) => handleEmailFormChange(inquiry.id, 'managerNote', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 resize-none"
                                  placeholder="Add special instructions or greetings for the guest..."
                                />
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row">
                                <button
                                  onClick={() => handleSendAcceptedEmail(inquiry)}
                                  disabled={processing === inquiry.id}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-200 py-3.5 text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer"
                                >
                                  {processing === inquiry.id ? (
                                    <Loader className="w-4 h-4 animate-spin text-white" />
                                  ) : (
                                    <Mail className="w-4 h-4 text-white" />
                                  )}
                                  {processing === inquiry.id ? 'Sending...' : 'Send Quote Email'}
                                </button>
                                <button
                                  onClick={closeEmailForm}
                                  disabled={processing === inquiry.id}
                                  className="flex-1 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-250 disabled:bg-slate-50 py-3.5 text-xs font-black uppercase tracking-wider transition cursor-pointer"
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
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 text-white text-sm px-5 py-3.5 rounded-2xl shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'error' ? 'bg-rose-900' : 'bg-slate-900'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle size={15} className="text-rose-300 shrink-0" />
          ) : (
            <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white/50 hover:text-white transition cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
