import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader, MapPin, X, ArrowLeft, Users, Calendar, HelpCircle, ShieldCheck, Mail } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';

function Stepper({ label, value, onChange, min = 0, max = Infinity }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs max-w-[160px]">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 flex items-center justify-center text-lg text-slate-705 hover:bg-slate-50 active:bg-slate-100 transition-colors font-bold select-none cursor-pointer"
        >
          -
        </button>
        <span className="flex-1 text-center font-bold text-slate-800 border-x border-slate-200 leading-10 text-sm select-none">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-10 h-10 flex items-center justify-center text-lg transition-colors font-bold select-none cursor-pointer ${
            value >= max 
              ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
              : 'text-slate-705 hover:bg-slate-50 active:bg-slate-100'
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>
      {children}
      {error && <p className="text-rose-600 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 bg-white outline-none transition focus:border-cyan-600 ${err ? 'border-rose-350 bg-rose-50/30' : 'border-slate-200'}`;

const getValidCustomerToken = () => {
  let token = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken');

  if (token === 'undefined' || token === 'null') {
    sessionStorage.removeItem('customerToken');
    localStorage.removeItem('customerToken');
    return null;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded?.exp && decoded.exp < currentTime) {
      sessionStorage.removeItem('customerToken');
      localStorage.removeItem('customerToken');
      return null;
    }

    return token;
  } catch {
    sessionStorage.removeItem('customerToken');
    localStorage.removeItem('customerToken');
    return null;
  }
};

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
  const [authChecked, setAuthChecked] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    idType: 'NIC',
    idNumber: '',
    address: '',
    numberOfAdults: 1,
    numberOfChildren: 0,
    startDate: '',
    pickupLocation: 'Hotel Lobby',
    specialRequests: '',
  });

  const [errors, setErrors] = useState({});

  const minStartDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    const token = getValidCustomerToken();

    if (!token) {
      navigate('/customerLogin', {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendBaseUrl}/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pData = res.data.data;
        if (pData) {
          setCustomerProfile(pData);
          setForm(prev => {
            const fetchedNat = prev.nationality || pData.country || '';
            const isSriLanka = fetchedNat.trim().toLowerCase() === 'sri lanka' || fetchedNat.trim().toLowerCase() === 'srilanka';
            return {
              ...prev,
              fullName: prev.fullName || `${pData.firstName || ''} ${pData.lastName || ''}`.trim(),
              email: prev.email || pData.email || '',
              phone: prev.phone || pData.phoneNumber || '',
              nationality: fetchedNat,
              idType: prev.idType || pData.idType || (isSriLanka ? 'NIC' : 'PASSPORT'),
              idNumber: prev.idNumber || pData.idNumber || '',
              address: prev.address || pData.address || '',
            };
          });
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchProfile();
  }, [location.pathname, location.search, navigate, backendBaseUrl]);

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
    
    if (name === 'nationality') {
      const isSriLanka = value.trim().toLowerCase() === 'sri lanka' || value.trim().toLowerCase() === 'srilanka';
      setForm((p) => ({ 
        ...p, 
        nationality: value,
        idType: isSriLanka ? 'NIC' : 'PASSPORT'
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }

    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Invalid email';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required';
    if (!form.nationality.trim()) nextErrors.nationality = 'Nationality is required';
    if (!form.idType) nextErrors.idType = 'ID Type is required';
    if (!form.idNumber.trim()) nextErrors.idNumber = 'ID Number is required';
    if (!form.address.trim()) nextErrors.address = 'Address is required';
    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    else if (form.startDate < minStartDate) nextErrors.startDate = 'Start date must be at least 4 days from today';
    if (!form.pickupLocation.trim()) nextErrors.pickupLocation = 'Pickup location is required';

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      nationality: '',
      idType: 'NIC',
      idNumber: '',
      address: '',
      numberOfAdults: 1,
      numberOfChildren: 0,
      startDate: '',
      pickupLocation: 'Hotel Lobby',
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

    const token = getValidCustomerToken();
    if (!token) {
      setPageError('Please login to your customer account before submitting a tour inquiry.');
      navigate('/customerLogin', {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (!tour?.id) {
      setPageError('Tour not found. Please return to tour details and try again.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    
    if (saveToProfile) {
      try {
        const names = form.fullName.trim().split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        await axios.put(`${backendBaseUrl}/customers/update-profile`, {
          firstName,
          lastName,
          phoneNumber: form.phone,
          country: form.nationality,
          idType: form.idType,
          idNumber: form.idNumber,
          address: form.address,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to update profile", e);
      }
    }

    try {
      const res = await axios.post(
        `${backendBaseUrl}/tour-inquiry`,
        {
          tourId: tour.id,
          ...form,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const inquiryRef = res.data?.data?.inquiryRef;
        setSuccessData({
          inquiryRef: inquiryRef || 'TI-Pending',
          packageName: tour?.packageName,
          startDate: form.startDate,
          numberOfAdults: form.numberOfAdults,
          numberOfChildren: form.numberOfChildren
        });
        resetForm();
      } else {
        setPageError(res.data.message || 'Submission failed');
      }
    } catch (e) {
      if (e.response?.status === 401) {
        setPageError('Your session expired. Please login again to submit the inquiry.');
        navigate('/customerLogin', {
          replace: true,
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      if (e.response?.status === 500) {
        setPageError('Internal server error. Please try again later.');
        return;
      }

      const backendErrors = e.response?.data?.errors || {};
      const hasFieldErrors = Object.keys(backendErrors).length > 0;

      if (hasFieldErrors) {
        setErrors(backendErrors);
        setPageError(e.response?.data?.message || 'Please fix the errors below');
      } else {
        setPageError(e.response?.data?.message || 'Failed to submit. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTour) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-xs font-semibold text-slate-400">Loading inquiry form…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-55 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-xs font-semibold text-slate-400">Authenticating guest session…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Header />

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-blue-900 text-white text-sm px-5 py-3.5 rounded-2xl shadow-2xl max-w-xs">
          <Check size={15} className="text-yellow-400 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white/55 hover:text-white transition cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col justify-center">
        
        {successData ? (
          /* ════════ SUCCESS STATE LAYOUT ════════ */
          <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.06)] text-center space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs relative">
              <Check size={28} className="stroke-[2.5]" />
              <span className="absolute inset-0 rounded-full bg-emerald-450/20 animate-ping opacity-75 scale-105 pointer-events-none" />
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Submission Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">Inquiry Submitted Successfully!</h2>
              <p className="text-xs text-slate-450 font-semibold">Your excursion coordinates have been logged at the Bluebird Tour Desk.</p>
            </div>

            {/* Reference Number Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Inquiry Reference Code</p>
              <p className="text-2xl font-black text-cyan-800 tracking-wide font-mono select-all">{successData.inquiryRef}</p>
            </div>

            {/* Details Summary Block */}
            <div className="border border-slate-150 rounded-2xl p-5 divide-y divide-slate-150 space-y-3.5 text-left text-xs text-slate-600 font-semibold">
              
              <div className="flex justify-between items-center pb-3">
                <span className="text-slate-400 font-bold">Selected Tour:</span>
                <span className="text-slate-800 font-bold text-right truncate max-w-[240px]">{successData.packageName}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 font-bold">Travel Date:</span>
                <span className="text-slate-800 font-bold text-right">{successData.startDate}</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-slate-400 font-bold">Total Guests:</span>
                <span className="text-slate-800 font-bold text-right">
                  {successData.numberOfAdults} Adults{successData.numberOfChildren > 0 ? `, ${successData.numberOfChildren} Children` : ''}
                </span>
              </div>

            </div>

            {/* Next Steps List */}
            <div className="text-left space-y-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-xs text-slate-500 font-semibold">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Next Steps</p>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-cyan-600 mt-0.5 shrink-0" />
                <span><strong>Reception Check</strong>: Desk coordinators will confirm travel guide schedules and vehicle requirements.</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-cyan-600 mt-0.5 shrink-0" />
                <span><strong>Dashboard Alert</strong>: Once approved, pay the 50% booking advance directly from your dashboard to confirm.</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/booking/tour')}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Browse Other Tours
              </button>
            </div>

          </div>
        ) : (
          /* ════════ FORM STATE LAYOUT ════════ */
          <div className="space-y-6">
            
            {/* Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-450">
              <span>Home</span>
              <span>/</span>
              <span>Tours</span>
              <span>/</span>
              <span className="text-slate-600 truncate">Book Excursion Inquiry</span>
            </div>

            {/* Back Link */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-650 transition bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tour Details
            </button>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Panel (8/12) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-205 p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                  <span className="inline-block bg-cyan-150 text-cyan-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-2">
                    Resort Excursion Booking Desk
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Request Excursion Inquiry</h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">Provide your details below. Excursion pricing and hotel guide pickup times will be coordinated by reception.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Contact Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Guest Contacts</h3>
                    
                    <Field label="Full Name *" error={errors.fullName}>
                      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" className={inputCls(errors.fullName)} />
                    </Field>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email Address *" error={errors.email}>
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className={inputCls(errors.email)} />
                      </Field>
                      <Field label="Phone Number *" error={errors.phone}>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+94 77 000 0000" className={inputCls(errors.phone)} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nationality *" error={errors.nationality}>
                        <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. Sri Lankan, British" className={inputCls(errors.nationality)} />
                      </Field>
                      <Field label="Residential Address *" error={errors.address}>
                        <input name="address" value={form.address} onChange={handleChange} placeholder="Your residential address" className={inputCls(errors.address)} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Identification Document Type *" error={errors.idType}>
                        <select name="idType" value={form.idType} onChange={handleChange} className={`${inputCls(errors.idType)} font-bold text-slate-700 cursor-pointer`}>
                          <option value="NIC">National Identity Card (NIC)</option>
                          <option value="PASSPORT">Passport</option>
                        </select>
                      </Field>
                      <Field label="Identification Document Number *" error={errors.idNumber}>
                        <input name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Passport or NIC number" className={inputCls(errors.idNumber)} />
                      </Field>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="saveToProfile"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
                      />
                      <label htmlFor="saveToProfile" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">
                        Save these contact details to my customer profile
                      </label>
                    </div>
                  </div>

                  {/* Guest Counts Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Travel Guests</h3>
                      {tour?.groupSize && (
                        <span className="text-[10px] font-black text-blue-750 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Capacity limit: {tour.groupSize} Guests
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Stepper 
                        label="Adults *" 
                        value={form.numberOfAdults} 
                        min={1} 
                        max={tour?.groupSize ? tour.groupSize - form.numberOfChildren : Infinity}
                        onChange={(v) => setForm((p) => ({ ...p, numberOfAdults: v }))} 
                      />
                      <Stepper 
                        label="Children" 
                        value={form.numberOfChildren} 
                        min={0} 
                        max={tour?.groupSize ? tour.groupSize - form.numberOfAdults : Infinity}
                        onChange={(v) => setForm((p) => ({ ...p, numberOfChildren: v }))} 
                      />
                    </div>
                  </div>

                  {/* Trip Schedule Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Trip Schedule</h3>
                    
                    <Field label="Desired Start Date *" error={errors.startDate}>
                      <input
                        name="startDate"
                        type="date"
                        min={minStartDate}
                        value={form.startDate}
                        onChange={handleChange}
                        className={`${inputCls(errors.startDate)} cursor-pointer font-bold text-slate-705`}
                      />
                    </Field>
                    
                    <Field label="Pickup Location *" error={errors.pickupLocation}>
                      <input 
                        name="pickupLocation" 
                        value={form.pickupLocation} 
                        disabled 
                        readOnly 
                        className={`${inputCls(errors.pickupLocation)} bg-slate-50 cursor-not-allowed font-bold text-slate-500`} 
                      />
                    </Field>
                  </div>

                  {/* Special Notes Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Special Requests</h3>
                    <textarea
                      name="specialRequests"
                      value={form.specialRequests}
                      onChange={handleChange}
                      rows={4}
                      placeholder="e.g. Vegetarian lunches, child car seats, wheelchair access, pick-up time requests..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white outline-none resize-none focus:border-cyan-600 transition"
                    />
                  </div>

                  {/* Backend validation warnings */}
                  {pageError && (
                    <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3.5 rounded-xl">
                      <AlertCircle size={15} className="shrink-0" />
                      {pageError}
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!tour || isSubmitting || tour?.status !== 'active'}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        tour && tour?.status === 'active' && !isSubmitting
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-[0.99]'
                          : 'bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200/50'
                      }`}
                    >
                      {isSubmitting && <Loader size={14} className="animate-spin text-white" />}
                      {isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                    </button>
                  </div>

                </form>
              </div>

              {/* Right Column: Tour Summary Sidebar (4/12) */}
              <aside className="lg:col-span-4 bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-sm">
                
                {/* Tour Cover Image in Sidebar */}
                <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-200">
                  <img 
                    src={tour?.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"} 
                    alt={tour?.packageName} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  
                  {/* Tour Name Badge */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300 block mb-1">Inquiry Excursion</span>
                    <h4 className="text-sm font-bold truncate leading-tight">{tour?.packageName}</h4>
                  </div>
                </div>

                {/* Tour details body summary */}
                <div className="p-6 space-y-6">
                  
                  {/* Destination */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Destination Locator</span>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
                      <MapPin size={13} className="text-cyan-600" />
                      <span>{tour?.location || 'Location not specified'}</span>
                    </p>
                  </div>

                  {/* Specifications pills */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Duration</span>
                      <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{tour?.duration} {tour?.durationType === 'hours' ? 'Hrs' : 'Days'}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Group capacity</span>
                      <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Users size={13} className="text-slate-400" />
                        <span>Up to {tour?.groupSize || 1} Pax</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing overview */}
                  <div className="pt-5 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Package Base Rate</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900">
                        {import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {Number(tour?.discount ? tour.price - (tour.price * tour.discount / 100) : tour?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ Guest</span>
                    </div>
                    {tour?.discount > 0 && (
                      <p className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded px-2 py-0.5 inline-block mt-2">
                        Includes special {tour.discount}% off rate
                      </p>
                    )}
                  </div>

                  {/* Trust checklist */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3 text-xs text-slate-500 font-semibold">
                    <div className="flex items-start gap-2 text-[11px]">
                      <HelpCircle size={13} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>Inquiries are non-binding. Coordination changes can be made before paying the deposit.</span>
                    </div>
                  </div>

                </div>

              </aside>

            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
