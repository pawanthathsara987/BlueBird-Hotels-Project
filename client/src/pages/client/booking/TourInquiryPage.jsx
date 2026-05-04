import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader, MapPin, X } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

function Stepper({ label, value, onChange, min = 0 }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 flex items-center justify-center text-lg text-emerald-700 hover:bg-gray-200 transition-colors font-semibold"
        >
          -
        </button>
        <span className="flex-1 text-center font-bold text-gray-800 border-x border-gray-200 leading-10 text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 flex items-center justify-center text-lg text-emerald-700 hover:bg-gray-200 transition-colors font-semibold"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-gray-50 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

export default function TourInquiryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTour = location.state?.tour || null;
  const tourIdFromQuery = new URLSearchParams(location.search).get('tourId');
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const [tour, setTour] = useState(selectedTour);
  const [loadingTour, setLoadingTour] = useState(!selectedTour);
  const [pageError, setPageError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    numberOfAdults: 2,
    numberOfChildren: 0,
    startDate: '',
    pickupLocation: '',
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});

  const minStartDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    if (selectedTour) {
      setTour(selectedTour);
      return;
    }

    if (!tourIdFromQuery) {
      setPageError('Tour not found. Please select a tour again.');
      setLoadingTour(false);
      return;
    }

    (async () => {
      try {
        setLoadingTour(true);
        const res = await axios.get(`${backendBaseUrl}/manager/tours/${tourIdFromQuery}`);
        if (res.data.success && res.data.data) {
          setTour(res.data.data);
        } else {
          setPageError('Tour not found. Please select a tour again.');
        }
      } catch (e) {
        setPageError(e.response?.data?.message || 'Failed to load selected tour.');
      } finally {
        setLoadingTour(false);
      }
    })();
  }, [backendBaseUrl, selectedTour, tourIdFromQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Required';
    if (!form.email.trim()) nextErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Invalid email';
    if (!form.phone.trim()) nextErrors.phone = 'Required';
    if (!form.nationality.trim()) nextErrors.nationality = 'Required';
    if (!form.startDate) nextErrors.startDate = 'Required';
    else if (form.startDate < minStartDate) nextErrors.startDate = 'Start date must be at least 2 days from today';
    if (!form.pickupLocation.trim()) nextErrors.pickupLocation = 'Required';

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      nationality: '',
      numberOfAdults: 2,
      numberOfChildren: 0,
      startDate: '',
      pickupLocation: '',
      specialRequests: '',
    });
    setErrors({});
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError(null);

    if (!tour?.id) {
      setPageError('Tour not found. Please return to tour details and try again.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${backendBaseUrl}/tour-inquiry`, {
        tourId: tour.id,
        ...form,
      });

      if (res.data.success) {
        const inquiryRef = res.data?.data?.inquiryRef;
        showToast(inquiryRef ? `Inquiry submitted! Ref: ${inquiryRef}` : 'Inquiry submitted successfully!');
        resetForm();
      } else {
        setPageError(res.data.message || 'Submission failed');
      }
    } catch (e) {
      setPageError(e.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTour) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Loading inquiry page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-900 text-white text-sm px-5 py-3.5 rounded-2xl shadow-2xl max-w-xs">
          <Check size={15} className="text-yellow-400 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white/50 hover:text-white transition">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tour Inquiry</p>
              <h1 className="text-2xl font-bold text-gray-900">Send Your Inquiry</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
            >
              Back to Details
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Contact Details</p>
              <Field label="Full Name *" error={errors.fullName}>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" className={inputCls(errors.fullName)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email *" error={errors.email}>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+94 77 000 0000" className={inputCls(errors.phone)} />
                </Field>
              </div>
              <Field label="Nationality *" error={errors.nationality}>
                <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. British" className={inputCls(errors.nationality)} />
              </Field>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Guests</p>
              <div className="grid grid-cols-2 gap-4">
                <Stepper label="Adults *" value={form.numberOfAdults} min={1} onChange={(v) => setForm((p) => ({ ...p, numberOfAdults: v }))} />
                <Stepper label="Children" value={form.numberOfChildren} min={0} onChange={(v) => setForm((p) => ({ ...p, numberOfChildren: v }))} />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Trip Details</p>
              <Field label="Start Date *" error={errors.startDate}>
                <input
                  name="startDate"
                  type="date"
                  min={minStartDate}
                  value={form.startDate}
                  onChange={handleChange}
                  className={inputCls(errors.startDate)}
                />
              </Field>
              <Field label="Pickup Location *" error={errors.pickupLocation}>
                <input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} placeholder="e.g. Colombo City Hotel" className={inputCls(errors.pickupLocation)} />
              </Field>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Special Requests</p>
              <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder="Dietary requirements, accessibility needs, celebrations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none resize-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {pageError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={14} className="shrink-0" />
                {pageError}
              </div>
            )}

            <button
              type="submit"
              disabled={!tour || isSubmitting || tour?.status !== 'active'}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                tour && tour?.status === 'active' && !isSubmitting
                  ? 'bg-emerald-700 hover:bg-emerald-600 active:scale-[.98] text-white shadow-lg shadow-emerald-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting && <Loader size={14} className="animate-spin" />}
              {isSubmitting ? 'Submitting...' : tour?.status === 'active' ? 'Submit Inquiry' : 'Tour Unavailable'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Selected Tour</p>
            <h2 className="text-xl font-bold text-gray-900">{tour?.packageName || 'Tour not found'}</h2>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <span>{tour?.location || 'Location not specified'}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Package Price</p>
              <p className="text-2xl font-bold text-emerald-800">
                LKR {Number(tour?.discount ? tour.price - (tour.price * tour.discount / 100) : tour?.price || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
