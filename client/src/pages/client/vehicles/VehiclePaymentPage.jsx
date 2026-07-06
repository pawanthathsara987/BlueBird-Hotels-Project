import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import { Car, CalendarDays, Sparkles, ShieldCheck, ShieldAlert, CreditCard, ChevronLeft, Clock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export default function VehiclePaymentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState(null);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    idType: "NIC",
    idNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    country: "Sri Lanka",
    customerLicenseNo: "",
    customerLicenseExpiry: ""
  });

  // Attempt to load customer info if logged in
  useEffect(() => {
    let storedToken = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
    if (storedToken === "undefined" || storedToken === "null") {
      storedToken = null;
    }
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded) {
          setCustomerForm((prev) => ({
            ...prev,
            name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
            email: decoded.email || "",
            phone: decoded.phoneNumber || decoded.phone || "",
            idType: decoded.idType || "NIC",
            idNumber: decoded.idNumber || "",
            addressLine1: decoded.address ? decoded.address.split(",")[0] : "",
            city: decoded.address ? decoded.address.split(",").pop().trim() : "",
            country: decoded.country || "Sri Lanka",
          }));
        }
      } catch (err) {
        console.error("Error decoding customer token:", err);
      }
    }
  }, []);

  if (!state || !state.vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Booking Details Found</h2>
          <p className="text-slate-600 mb-6">Please start your booking process again from the fleet catalog.</p>
          <Link to="/vehicles" className="rounded-xl bg-slate-950 px-6 py-3 text-white font-semibold hover:bg-slate-800 transition">
            Return to Fleet
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { vehicle, pickupDate, returnDate, driverOption, availability, bookingForm } = state;
  const depositAmount = availability?.depositAmount || (availability?.totalPrice * 0.5);
  const balanceAmount = availability?.balanceAmount || (availability?.totalPrice - depositAmount);

  const handleGoBack = () => {
    navigate(`/vehicles/${id}/summary`, { state });
  };

  const handlePayDeposit = async () => {
    if (!bookingSuccess?.bookingId) {
      setPaymentError("Booking details are missing. Please create the booking again.");
      return;
    }

    setPaymentError("");
    setPaymentLoading(true);

    try {
      let token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
      if (token === "undefined" || token === "null") {
        token = null;
      }

      if (!token) {
        throw new Error("Your session has expired. Please login again.");
      }

      const orderId = `VEHICLE_${bookingSuccess.bookingId}`;
      const amount = Number(bookingSuccess.depositAmount || depositAmount || 0).toFixed(2);
      const nameParts = (customerForm.name || "Customer").trim().split(/\s+/);
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      const hashRes = await axios.post(
        `${backendBaseUrl}/payment/payhere-hash`,
        {
          orderId,
          amount,
          currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!hashRes.data?.success || !hashRes.data?.hash) {
        throw new Error(hashRes.data?.message || "Failed to generate payment hash");
      }

      const { hash, merchantId } = hashRes.data;

      setTimeout(() => {
        if (!window.payhere) {
          setPaymentError("Payment portal failed to initialize. Please refresh the page and try again.");
          setPaymentLoading(false);
          return;
        }

        window.payhere.onCompleted = async function onCompleted(orderRef) {
          console.log("Vehicle payment completed. OrderID:", orderRef);
          try {
            await axios.post(
              `${backendBaseUrl}/payment/vehicle-confirm`,
              {
                bookingId: bookingSuccess.bookingId,
                paymentNo: orderRef || `PAY_PAYHERE_VEHICLE_${bookingSuccess.bookingId}`,
                amount: amount,
                currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR"
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentSuccessDetails({
              bookingNo: bookingSuccess.bookingNo,
              paymentNo: orderRef || `PAY_PAYHERE_VEHICLE_${bookingSuccess.bookingId}`,
              amountPaid: amount,
              vehicleName: `${vehicle.brand} ${vehicle.model}`,
              pickup: pickupDate,
              returnDate: returnDate,
              driverOption: driverOption,
              balanceDue: Number(bookingSuccess.balanceAmount || balanceAmount || 0)
            });
          } catch (err) {
            console.error("Error confirming vehicle payment:", err);
            setPaymentSuccessDetails({
              bookingNo: bookingSuccess.bookingNo,
              paymentNo: orderRef || `PAY_PAYHERE_VEHICLE_${bookingSuccess.bookingId}`,
              amountPaid: amount,
              vehicleName: `${vehicle.brand} ${vehicle.model}`,
              pickup: pickupDate,
              returnDate: returnDate,
              driverOption: driverOption,
              balanceDue: Number(bookingSuccess.balanceAmount || balanceAmount || 0),
              apiError: "Payment logged but database syncing is pending. Please preserve this transaction ID."
            });
          }
          setPaymentLoading(false);
        };

        window.payhere.onDismissed = function onDismissed() {
          setPaymentError("Payment window was closed. You can retry payment.");
          setPaymentLoading(false);
        };

        window.payhere.onError = function onError(error) {
          console.error("PayHere Error:", error);
          setPaymentError("Payment transaction failed. Please try again.");
          setPaymentLoading(false);
        };

        const backendUrl = String(import.meta.env.VITE_BACKEND_URL || backendBaseUrl);
        const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;

        window.payhere.startPayment({
          sandbox: true,
          merchant_id: merchantId,
          return_url: `${window.location.origin}/customer/dashboard`,
          cancel_url: `${window.location.origin}/vehicles/${id}/payment`,
          notify_url: import.meta.env.VITE_NOTIFY_URL
            ? `${import.meta.env.VITE_NOTIFY_URL}/api/payment/notify`
            : `${cleanBackendUrl}payment/notify`,
          order_id: orderId,
          items: `BlueBird Vehicle Booking #${bookingSuccess.bookingNo}`,
          amount,
          currency: import.meta.env.VITE_CURRENCY_TYPE || "LKR",
          hash,
          first_name: firstName,
          last_name: lastName,
          email: customerForm.email || "guest@bluebird.com",
          phone: customerForm.phone || "0771234567",
          address: [customerForm.addressLine1, customerForm.addressLine2].filter(Boolean).join(", ") || "N/A",
          city: customerForm.city || "Colombo",
          country: customerForm.country || "Sri Lanka"
        });
      }, 500);
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || err.message || "Failed to initiate payment.");
      setPaymentLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    if (driverOption === "without" && customerForm.customerLicenseExpiry) {
      const expiry = new Date(customerForm.customerLicenseExpiry).getTime();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today.getTime()) {
        setBookingError("Your driver's license is expired. We cannot proceed with the booking.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const payload = {
        ...bookingForm,
        ...customerForm,
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        withDriver: driverOption === "with"
      };
      const token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
      const res = await axios.post(`${backendBaseUrl}/vehicles/${id}/book`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingSuccess(res.data.data);
      setPaymentError("");
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to create booking. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (paymentSuccessDetails) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Header />
        
        <div className="flex-1 mx-auto max-w-2xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-lg">
            
            {/* Header Confirmed Banner */}
            <div className="bg-slate-900 px-6 py-12 text-white sm:px-10 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 z-10" />
              <div className="relative z-20 space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-10 h-10 animate-bounce" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Payment Completed Successfully!</h1>
                <p className="max-w-md mx-auto text-xs text-slate-400">
                  Your vehicle reservation has been successfully confirmed. A receipt copy has been sent to your email.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {paymentSuccessDetails.apiError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
                  <p className="font-bold mb-1">⚠️ System Sync Notice</p>
                  <p>{paymentSuccessDetails.apiError}</p>
                </div>
              )}

              {/* Receipt Breakdowns */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">Payment Receipt</h3>
                
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div className="text-slate-500 font-medium">Booking Number:</div>
                  <div className="text-right font-bold text-slate-800">{paymentSuccessDetails.bookingNo}</div>

                  <div className="text-slate-500 font-medium">Transaction Reference:</div>
                  <div className="text-right font-mono font-semibold text-slate-700">{paymentSuccessDetails.paymentNo}</div>

                  <div className="text-slate-500 font-medium">Vehicle Model:</div>
                  <div className="text-right font-bold text-slate-800">{paymentSuccessDetails.vehicleName}</div>

                  <div className="text-slate-500 font-medium">Driver Option:</div>
                  <div className="text-right font-semibold text-slate-800">
                    {paymentSuccessDetails.driverOption === "with" ? "Professional Driver" : "Self-Drive Rental"}
                  </div>

                  <div className="text-slate-500 font-medium">Amount Paid:</div>
                  <div className="text-right font-black text-emerald-600">{formatMoney(paymentSuccessDetails.amountPaid)}</div>

                  <div className="text-slate-500 font-medium">Balance Due at Pickup:</div>
                  <div className="text-right font-black text-slate-900">{formatMoney(paymentSuccessDetails.balanceDue)}</div>
                </div>
              </div>

              {/* Next Steps Checklist */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Important Instructions</h4>
                <ul className="text-xs text-slate-550 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Your vehicle will be ready at the <strong>Hotel Lobby</strong> at the requested pickup time.</li>
                  {paymentSuccessDetails.driverOption === "without" ? (
                    <li>Please bring your original <strong>Driving License</strong> and identification card when collecting the vehicle.</li>
                  ) : (
                    <li>Driver details will be assigned and texted to your phone number shortly before pickup.</li>
                  )}
                  <li>For support, please call reception or Bluebird Fleet line.</li>
                </ul>
              </div>

              {/* Action Links */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <Link
                  to="/customer/dashboard"
                  className="w-full sm:w-1/2 inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-xs shadow-md shadow-blue-600/10 active:scale-[0.98] transition text-center"
                >
                  View My Rentals Dashboard
                </Link>
                <Link
                  to="/vehicles"
                  className="w-full sm:w-1/2 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 text-xs transition text-center"
                >
                  Return to Fleet
                </Link>
              </div>

            </div>

          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (bookingSuccess) {
    const successDeposit = Number(bookingSuccess.depositAmount || depositAmount || 0);
    const successBalance = Number(bookingSuccess.balanceAmount || balanceAmount || 0);

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Header />
        
        <div className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-sm">
            
            {/* Header Success Banner */}
            <div className="bg-slate-900 px-6 py-10 text-white sm:px-10 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900/40 z-10" />
              <div className="relative z-20 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black sm:text-3xl">Booking Reserved Successfully</h2>
                <p className="max-w-md mx-auto text-xs text-slate-400">
                  Your reservation reference is <strong className="text-emerald-400">{bookingSuccess.bookingNo}</strong>. Please secure your booking by completing the deposit transaction below.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {bookingError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                  {bookingError}
                </div>
              )}

              {/* Deposit Invoice Summary Card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Advance Deposit Due Now</span>
                <span className="text-4xl font-black text-slate-900 block">{formatMoney(successDeposit)}</span>
                <p className="text-[11px] leading-relaxed text-slate-500 max-w-md mx-auto">
                  A {availability?.depositPercentage || 50}% secure deposit is required to confirm this fleet booking. The remaining balance of <strong className="text-slate-800">{formatMoney(successBalance)}</strong> will be charged at pickup.
                </p>
              </div>

              {paymentError && (
                <div className="rounded-xl border border-rose-150 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {paymentError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handlePayDeposit}
                  disabled={paymentLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-xs shadow-md shadow-blue-600/10 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {paymentLoading ? "Opening PayHere Checkout Portal..." : "Pay Secure Deposit Now"}
                </button>
                
                <Link 
                  to="/vehicles" 
                  className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 text-xs transition"
                >
                  Return to Fleet
                </Link>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-slate-600 transition">Fleet</Link>
          <span>/</span>
          <Link to={`/vehicles/${id}`} className="hover:text-slate-600 transition truncate">{vehicle.brand} {vehicle.model}</Link>
          <span>/</span>
          <span className="text-slate-600">Checkout Verification</span>
        </div>

        {/* Back Link Button */}
        <button 
          onClick={handleGoBack} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Summary
        </button>

        <form onSubmit={handleBookSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {bookingError && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                {bookingError}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200/50 p-6 sm:p-8 shadow-xs space-y-8">
              
              {/* Personal Details */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest pb-1.5 border-b border-slate-100">I. Personal Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Full Name <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="Your Full Name"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Email Address <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="email"
                        placeholder="e.g. customer@example.com"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Phone Number <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="tel"
                        placeholder="e.g. +94 77 123 4567"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Verification */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest pb-1.5 border-b border-slate-100">II. Verification Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Identification Type <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10" />
                      <select
                        value={customerForm.idType}
                        onChange={(e) => setCustomerForm({ ...customerForm, idType: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 appearance-none cursor-pointer focus:bg-white"
                      >
                        <option value="NIC">National Identity Card (NIC)</option>
                        <option value="PASSPORT">Passport</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">▼</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      {customerForm.idType === "NIC" ? "NIC Number" : "Passport Number"} <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder={customerForm.idType === "NIC" ? "e.g. 199912345678" : "e.g. N1234567"}
                        value={customerForm.idNumber}
                        onChange={(e) => setCustomerForm({ ...customerForm, idNumber: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest pb-1.5 border-b border-slate-100">III. Billing Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Address Line 1 <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="Street Address, P.O. Box, or Company Name"
                        value={customerForm.addressLine1}
                        onChange={(e) => setCustomerForm({ ...customerForm, addressLine1: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Address Line 2 <span className="text-slate-400 text-[8px]">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Apartment, Suite, Unit, Building, or Floor"
                        value={customerForm.addressLine2}
                        onChange={(e) => setCustomerForm({ ...customerForm, addressLine2: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-stone-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      City <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="City"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Country <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="Country"
                        value={customerForm.country}
                        onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Driving License Details */}
              {driverOption === "without" && (
                <div className="space-y-4 pt-2">
                  <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest pb-1.5 border-b border-slate-100">IV. Driver's License details</h2>
                  <p className="text-[10px] font-semibold text-slate-400">Since you selected a self-drive vehicle, please provide valid driving license details.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        License Number <span className="text-emerald-700">*</span>
                      </label>
                      <div className="relative group">
                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                          required
                          type="text"
                          placeholder="e.g. B1234567"
                          value={customerForm.customerLicenseNo}
                          onChange={(e) => setCustomerForm({ ...customerForm, customerLicenseNo: e.target.value })}
                          disabled={bookingLoading}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 placeholder-slate-400 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        License Expiry <span className="text-emerald-700">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          required
                          type="date"
                          value={customerForm.customerLicenseExpiry}
                          onChange={(e) => setCustomerForm({ ...customerForm, customerLicenseExpiry: e.target.value })}
                          disabled={bookingLoading}
                          className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition text-xs text-slate-800 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 rounded-3xl border border-slate-200/50 bg-white p-6 shadow-xs space-y-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest pb-4 border-b border-slate-100 flex items-center justify-between">
                Order Summary <Car className="h-5 w-5 text-blue-600" />
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Vehicle Type</h3>
                  <p className="text-sm font-bold text-slate-800">{vehicle.brand} {vehicle.model}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"><CalendarDays className="h-3.5 w-3.5" /> Pickup</span>
                    <span className="text-xs font-bold text-slate-800 block">{new Date(pickupDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"><CalendarDays className="h-3.5 w-3.5" /> Return</span>
                    <span className="text-xs font-bold text-slate-800 block">{new Date(returnDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Total Cost ({availability?.days} Days)</span>
                    <span className="text-slate-800 font-bold">{formatMoney(availability?.totalPrice)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-blue-700 mb-1">Advance Deposit Due Now</span>
                  <span className="block text-2xl font-black text-blue-900">{formatMoney(depositAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-xs shadow-md shadow-blue-600/10 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? "Creating Reservation..." : "Confirm & Create Booking"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>

      <Footer />
    </div>
  );
}
