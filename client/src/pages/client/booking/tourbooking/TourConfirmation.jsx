import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Home, Calendar, Users, MapPin, CreditCard, DollarSign } from 'lucide-react';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';

export default function TourConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const CURRENCY = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

  const {
    tour,
    inquiry,
    paymentNo,
    amountPaid,
    totalAmount,
    balanceDue,
    originalSubtotal,
    discountPercentage,
    discountAmount,
    billing
  } = location.state || {};

  if (!tour || !inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
            <p className="text-red-500 font-bold mb-4">No tour confirmation details found.</p>
            <button
              onClick={() => navigate('/booking/tour')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md"
            >
              Browse Tours
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-gray-50 flex flex-col justify-between">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden animate-fadeIn">
          
          {/* Header Status */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-10 text-center text-white relative">
            <div className="absolute inset-0 bg-grid-white/5 mask-gradient" />
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h1 className="text-3xl font-bold tracking-tight">Tour Booking Confirmed!</h1>
            <p className="text-blue-200 text-sm mt-2 max-w-md mx-auto">
              Thank you for booking with BlueBird! Your 50% advance payment has been processed successfully.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Booking Reference Box */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Tour Inquiry ID</span>
                <span className="font-extrabold text-xl text-blue-900">#TOUR_{inquiry.realId}</span>
              </div>
              {paymentNo && (
                <div className="sm:text-right">
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Payment Receipt No</span>
                  <span className="font-bold text-sm text-gray-700">{paymentNo}</span>
                </div>
              )}
            </div>

            {/* Tour & Destination details */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" /> Tour Destination Details
              </h2>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Package Name</span>
                  <span className="font-semibold text-gray-800">{tour.packageName || inquiry.destination}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Created Date</span>
                  <span className="font-semibold text-gray-800">
                    {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    }) : new Date().toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Tour Duration</span>
                  <span className="font-semibold text-gray-800">{tour.duration || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Guests Summary</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Users size={14} className="text-gray-500" />
                    {inquiry.adults} Adults
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Location Details</span>
                  <span className="font-semibold text-gray-800">{tour.location || 'Katunayake'}</span>
                </div>
              </div>
            </div>

            {/* Billing details */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> Passenger & Billing Details
              </h2>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Lead Passenger</span>
                  <span className="font-semibold text-gray-800">{billing?.fullName || "Guest"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Email Address</span>
                  <span className="font-semibold text-gray-800">{billing?.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Phone Number</span>
                  <span className="font-semibold text-gray-800">{billing?.phone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" /> Payment & Settlement Summary
              </h2>
              <div className="border border-gray-150 rounded-2xl overflow-hidden">
                {discountPercentage > 0 ? (
                  <>
                    <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Original Subtotal ({inquiry.adults} Adults × {CURRENCY} {Number(tour.price).toLocaleString()})</span>
                      <span className="font-bold text-gray-800">{CURRENCY} {Number(originalSubtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between text-sm text-emerald-700">
                      <span className="font-medium">Discount ({discountPercentage}%)</span>
                      <span className="font-bold">-{CURRENCY} {Number(discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Discounted Subtotal</span>
                      <span className="font-bold text-gray-800">{CURRENCY} {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal ({inquiry.adults} Adults × {CURRENCY} {Number(tour.price).toLocaleString()})</span>
                    <span className="font-bold text-gray-800">{CURRENCY} {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="p-4 bg-emerald-50/50 border-b border-gray-150 flex justify-between text-sm">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    50% Advance Paid Online
                  </span>
                  <span className="font-black text-emerald-700">{CURRENCY} {Number(amountPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-4 bg-blue-50/30 flex justify-between text-sm items-center">
                  <div>
                    <span className="text-blue-900 font-bold block">Remaining Balance</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Payable directly to tour operator on arrival</span>
                  </div>
                  <span className="text-lg font-extrabold text-blue-950">{CURRENCY} {Number(balanceDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Info */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold">💡 Important Information:</p>
              <p>A verification email with detailed tour schedule itineraries, pick-up points and contact references has been sent to your email.</p>
              <p>Please present the confirmation receipt ID <strong className="font-bold">#TOUR_{inquiry.realId}</strong> to the concierge or your chauffeur guide upon departure.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold transition shadow-lg shadow-blue-200 cursor-pointer text-sm uppercase tracking-wider"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3.5 px-6 rounded-xl font-bold transition cursor-pointer text-sm uppercase tracking-wider bg-white"
              >
                <Home size={16} />
                Return Home
              </button>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
