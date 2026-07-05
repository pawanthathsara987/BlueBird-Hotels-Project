import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ArrowLeft, Check, Shield, CheckCircle, Mail, AlertTriangle } from 'lucide-react';
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
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState(null);

  useEffect(() => {
    if (!tour || !inquiry) {
      navigate('/dashboard', { replace: true });
    }
  }, [tour, inquiry, navigate]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        let token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
        if (token) {
          const profileRes = await axios.get(
            `${backendBaseUrl}/customer/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (profileRes.data) {
            const customer = profileRes.data;
            setBilling({
              fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || inquiry?.fullName || '',
              email: customer.email || inquiry?.email || '',
              phone: customer.phoneNumber || inquiry?.phone || '',
              address: customer.address || inquiry?.address || ''
            });
          }
        }
      } catch (err) {
        console.error("Error fetching customer profile:", err);
      }
    };

    fetchCustomerProfile();
  }, [backendBaseUrl, inquiry]);

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
        { orderId, amount: advanceAmount, currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR" },
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

        window.payhere.onCompleted = async function (oid) {
          const finalOid = oid || `PAY_PAYHERE_TOUR_${inquiry.realId}`;
          try {
            await axios.post(
              `${backendBaseUrl}/payment/tour-confirm`,
              {
                inquiryId: inquiry.realId,
                paymentNo: finalOid,
                amount: advanceAmount,
                currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR"
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPaymentSuccessDetails({
              inquiryRef: inquiry.inquiryRef,
              paymentNo: finalOid,
              packageName: tour.packageName,
              amountPaid: advanceAmount,
              startDate: inquiry.startDate,
              guests: `${inquiry.adults} Adults${inquiry.children > 0 ? `, ${inquiry.children} Children` : ''}`
            });
          } catch (err) {
            console.error("Error confirming tour payment:", err);
            setPaymentSuccessDetails({
              inquiryRef: inquiry.inquiryRef,
              paymentNo: finalOid,
              packageName: tour.packageName,
              amountPaid: advanceAmount,
              startDate: inquiry.startDate,
              guests: `${inquiry.adults} Adults${inquiry.children > 0 ? `, ${inquiry.children} Children` : ''}`,
              warning: "Logged payment on gateway, but server synchronization is delayed. Please keep order reference details."
            });
          } finally {
            setProcessing(false);
          }
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
          currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR",
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

  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-cyan-600 transition";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 flex flex-col justify-center">
        
        {paymentSuccessDetails ? (
          /* ════════ GORGEOUS SUCCESS RECEIPT LAYOUT ════════ */
          <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-slate-205 p-8 md:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.06)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs relative">
              <Check className="w-8 h-8 stroke-[2.5]" />
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-75 scale-105 pointer-events-none" />
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight pt-2">Deposit Paid Successfully!</h2>
              <p className="text-xs text-slate-450 font-semibold">Your 50% excursion reservation advance has been safely captured.</p>
            </div>

            {/* Warning callout (if server synch delayed) */}
            {paymentSuccessDetails.warning && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-left text-xs p-4 rounded-2xl font-semibold">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span>{paymentSuccessDetails.warning}</span>
              </div>
            )}

            {/* Reference & Transaction No. Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Inquiry Reference</p>
                <p className="text-sm font-black text-slate-700 font-mono">{paymentSuccessDetails.inquiryRef}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Transaction ID</p>
                <p className="text-xs font-black text-slate-705 font-mono truncate select-all">{paymentSuccessDetails.paymentNo}</p>
              </div>
            </div>

            {/* Transaction Receipt Table */}
            <div className="border border-slate-150 rounded-2xl p-5 divide-y divide-slate-150 space-y-3.5 text-left text-xs text-slate-600 font-semibold">
              
              <div className="flex justify-between items-center pb-3">
                <span className="text-slate-400 font-bold">Excursion Excursion:</span>
                <span className="text-slate-800 font-bold text-right truncate max-w-[240px]">{paymentSuccessDetails.packageName}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 font-bold">Departure Date:</span>
                <span className="text-slate-800 font-bold text-right">
                  {paymentSuccessDetails.startDate ? new Date(paymentSuccessDetails.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 font-bold">Confirmed Guests:</span>
                <span className="text-slate-800 font-bold text-right">{paymentSuccessDetails.guests}</span>
              </div>

              <div className="flex justify-between items-center pt-3 text-slate-800">
                <span className="text-slate-400 font-bold">50% Advance Charged:</span>
                <span className="text-lg font-black text-cyan-800">
                  {import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {paymentSuccessDetails.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

            </div>

            {/* Reminder */}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Remaining balance is due on guide pickup departure.
            </p>

            {/* Actions */}
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
                Explore Other Tours
              </button>
            </div>

          </div>
        ) : (
          /* ════════ BILLING DETAILS FORM STATE ════════ */
          <div className="space-y-6">
            
            {/* Back button */}
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-650 transition bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            >
              <ArrowLeft size={15} /> Back to Tour Details
            </button>

            <div>
              <span className="inline-block bg-blue-50 text-blue-750 border border-blue-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-2">
                Deposit Payment Desk
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Deposit Payment</h1>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">Review your booking coordinates and submit the 50% reservation deposit.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Left Column — Billing details form (3/5 cols) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-205 p-6 md:p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CreditCard size={18} className="text-cyan-600" /> Billing Specifications
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                      <input type="text" value={billing.fullName} onChange={(e) => setBilling({...billing, fullName: e.target.value})} className={inputCls} placeholder="John Doe" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                        <input type="email" value={billing.email} onChange={(e) => setBilling({...billing, email: e.target.value})} className={inputCls} placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                        <input type="tel" value={billing.phone} onChange={(e) => setBilling({...billing, phone: e.target.value})} className={inputCls} placeholder="+94 77 123 4567" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Billing Address</label>
                      <input type="text" value={billing.address} onChange={(e) => setBilling({...billing, address: e.target.value})} className={inputCls} placeholder="No.1, Galle Road, Colombo" />
                    </div>
                  </div>
                </div>

                {/* Secure payments trust flags */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold px-2">
                  {[
                    { icon: <Lock size={12} />, text: '256-bit SSL secure payment validation' },
                    { icon: <Shield size={12} />, text: 'Encrypted Gateway confirmation' },
                    { icon: <Check size={12} />, text: 'Immediate coordination status update' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-500">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column — Pricing details block (2/5 cols) */}
              <div className="lg:col-span-2">
                <div className="sticky top-5 bg-white rounded-3xl shadow-sm border border-slate-205 overflow-hidden">
                  
                  {/* Order Summary Header */}
                  <div className="bg-slate-900 px-6 py-5.5 text-white">
                    <span className="text-[9px] font-black text-cyan-300 uppercase tracking-wider block">Excursion Invoice</span>
                    <h3 className="text-white font-black text-lg tracking-tight mt-0.5">Booking Invoice</h3>
                    <p className="text-slate-400 text-xs mt-1 truncate">{tour.packageName || inquiry.destination}</p>
                  </div>
                  
                  {/* Pricing Breakdown Body */}
                  <div className="px-6 py-6 space-y-3.5 text-xs text-slate-500 font-semibold">
                    <div className="flex justify-between">
                      <span>Excursion Base Rate</span>
                      <span className="text-slate-800 font-bold">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(tour.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Adults Guest count</span>
                      <span className="text-slate-800 font-bold">{inquiry.adults} Guest(s)</span>
                    </div>
                    <div className="flex justify-between pt-3.5 border-t border-slate-150">
                      <span>Total Balance Invoice</span>
                      <span className="text-slate-800 font-bold">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {Number(tour.price * inquiry.adults).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4.5 border-t border-slate-200">
                      <span className="font-black text-cyan-800 uppercase tracking-wide">50% Advance Due</span>
                      <span className="text-2xl font-black text-slate-900">{import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} {advanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Payment Trigger Section */}
                  <div className="px-6 pb-6 space-y-3.5">
                    {error && (
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={handlePayment}
                      disabled={processing}
                      className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing Payment...' : `Confirm & Pay ${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${advanceAmount.toLocaleString()} Now`}
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                      Remaining 50% payable on guide pickup departure.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
      <Footer />
    </div>
  );
}
