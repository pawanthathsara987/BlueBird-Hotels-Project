import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ArrowLeft, Check, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/header';
import Footer from '../../../../components/footer';

export default function TourPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tour = location.state?.tour || null;
  const inquiry = location.state?.inquiry || null;
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  const [billing, setBilling] = useState({
    fullName: inquiry?.fullName || '',
    email: inquiry?.email || '',
    phone: inquiry?.phone || '',
    address: inquiry?.address || ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tour || !inquiry) {
      navigate('/dashboard', { replace: true });
    }
  }, [tour, inquiry, navigate]);

  if (!tour || !inquiry) return null;

  const advanceAmount = Number((tour.price * inquiry.adults * 0.5).toFixed(2));

  const handlePayment = async () => {
    if (!billing.fullName || !billing.email || !billing.phone) {
      setError('Please fill in Name, Email and Phone.');
      return;
    }
    setError('');
    setProcessing(true);

    try {
      let token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      const orderId = `TOUR_${inquiry.realId}`;
      const nameParts = billing.fullName.trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "N/A";

      const hashRes = await axios.post(
        `${backendBaseUrl}/payment/payhere-hash`,
        { orderId, amount: advanceAmount, currency: "LKR" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!hashRes.data?.success || !hashRes.data?.hash) {
        throw new Error("Failed to generate payment hash");
      }

      const { hash, merchantId } = hashRes.data;

      setTimeout(() => {
        if (!window.payhere) {
          setError("Payment portal failed to initialize.");
          setProcessing(false);
          return;
        }

        window.payhere.onCompleted = function (oid) {
          alert("Payment completed successfully! Your tour is confirmed.");
          navigate('/dashboard');
        };
        window.payhere.onDismissed = function () {
          setProcessing(false);
        };
        window.payhere.onError = function () {
          setError("Payment failed. Please try again.");
          setProcessing(false);
        };

        window.payhere.startPayment({
          sandbox: true,
          merchant_id: merchantId,
          return_url: `${window.location.origin}/dashboard`,
          cancel_url: `${window.location.origin}/dashboard`,
          notify_url: import.meta.env.VITE_NOTIFY_URL || "https://bluebird.com/notify",
          order_id: orderId,
          items: `Advance Payment - ${tour.packageName || 'Tour Package'}`,
          amount: advanceAmount,
          currency: "LKR",
          hash,
          first_name: firstName,
          last_name: lastName,
          email: billing.email,
          phone: billing.phone,
          address: billing.address || "N/A",
          city: "Colombo",
          country: "Sri Lanka"
        });
      }, 500);
    } catch (err) {
      console.error(err);
      setError("Failed to initiate payment.");
      setProcessing(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 mb-6 transition">
          <ArrowLeft size={16} /> Back to Tour Details
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-500 text-sm mb-8">Review your details and pay the 50% advance to confirm your tour booking.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Customer Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" /> Billing Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                  <input type="text" value={billing.fullName} onChange={(e) => setBilling({...billing, fullName: e.target.value})} className={inputCls} placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Email</label>
                    <input type="email" value={billing.email} onChange={(e) => setBilling({...billing, email: e.target.value})} className={inputCls} placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Phone</label>
                    <input type="tel" value={billing.phone} onChange={(e) => setBilling({...billing, phone: e.target.value})} className={inputCls} placeholder="+94 77 123 4567" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Address</label>
                  <input type="text" value={billing.address} onChange={(e) => setBilling({...billing, address: e.target.value})} className={inputCls} placeholder="No.1, Galle Road, Colombo" />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              {[
                { icon: <Lock size={12} />, text: '256-bit SSL Encryption' },
                { icon: <Shield size={12} />, text: 'Secured by PayHere' },
                { icon: <Check size={12} />, text: 'Instant Confirmation' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-blue-500">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-900 px-6 py-5">
                <h3 className="text-white font-bold text-lg">Order Summary</h3>
                <p className="text-white/60 text-xs mt-1">{tour.packageName || inquiry.destination}</p>
              </div>
              <div className="px-6 py-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tour Price (per person)</span>
                  <span className="font-semibold text-gray-900">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(tour.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>No. of Adults</span>
                  <span className="font-semibold text-gray-900">{inquiry.adults}</span>
                </div>
                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(tour.price * inquiry.adults).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="font-bold text-blue-800">50% Advance</span>
                  <span className="text-2xl font-bold text-blue-900">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {advanceAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-3">
                {error && (
                  <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Pay ${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${advanceAmount.toLocaleString()} Now`}
                </button>
                <p className="text-[10px] text-center text-gray-400">Remaining 50% payable on the day of the tour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
