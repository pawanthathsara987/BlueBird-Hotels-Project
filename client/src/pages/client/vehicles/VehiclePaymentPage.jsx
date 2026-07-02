import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaArrowLeft, FaCheck } from "react-icons/fa";
import { Car, CalendarDays } from "lucide-react";
import Logo from "../../../assets/bluebird logo.png";
import { jwtDecode } from "jwt-decode";

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
      <div className="min-h-screen bg-stone-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">No Booking Details Found</h2>
        <p className="text-stone-600 mb-6">Please start your booking process again.</p>
        <Link to="/vehicles" className="rounded-xl bg-emerald-800 px-6 py-3 text-white font-semibold hover:bg-emerald-900">
          Return to Fleet
        </Link>
      </div>
    );
  }

  const { vehicle, pickupDate, returnDate, driverOption, availability, bookingForm } = state;
  const depositAmount = availability?.depositAmount || (availability?.totalPrice * 0.5);
  const balanceAmount = availability?.balanceAmount || (availability?.totalPrice - depositAmount);

  const handleGoBack = () => {
    navigate(`/vehicles/${id}/summary`, { state });
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
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to create booking. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (bookingSuccess) {
    const successDeposit = Number(bookingSuccess.depositAmount || depositAmount || 0);
    const successBalance = Number(bookingSuccess.balanceAmount || balanceAmount || 0);

    return (
      <div className="min-h-screen bg-stone-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            <FaCheck className="w-8 h-8" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-stone-900 tracking-tight">Booking Reserved</h2>
          <p className="mt-2 text-center text-stone-600 font-medium">
            Your booking reference is <strong className="text-stone-900">{bookingSuccess.bookingNo}</strong>.
          </p>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-stone-550">Advance deposit required</div>
            <div className="mt-3 text-4xl font-black text-stone-900">{formatMoney(successDeposit)}</div>
            <p className="mt-3 text-xs leading-6 text-stone-600 font-medium max-w-md mx-auto">
              Pay the {availability?.depositPercentage || 50}% advance deposit to secure the reservation. The remaining balance of {formatMoney(successBalance)} will be collected at pickup.
            </p>
          </div>

          <button className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-800 shadow-[0_4px_14px_0_rgba(4,120,87,0.39)]" onClick={() => alert("PayHere Gateway Integration Pending")}>
            Pay Deposit Now
          </button>
          <Link to="/vehicles" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-4 text-sm font-extrabold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 hover:text-stone-900">
            Return to Fleet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-14">
          <button
            onClick={handleGoBack}
            className="mb-3 flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-extrabold text-sm tracking-wide transition cursor-pointer"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            Back to Summary
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">Verify Guest Details</h1>
              <p className="mt-1 text-sm text-stone-500 font-semibold">
                Verify and confirm your checkout information before completing your payment
              </p>
            </div>
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-4 py-2 rounded-2xl self-start sm:self-center">
              <img src={Logo} alt="BlueBird logo" className="w-8 h-8 object-contain" />
              <div className="leading-tight">
                <p className="text-[10px] font-black text-stone-800 uppercase tracking-widest leading-none">BlueBird</p>
                <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest leading-none mt-1">Hotels & Resorts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-14">
        <form onSubmit={handleBookSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            {bookingError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-sm">
                {bookingError}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)] space-y-7">
              {/* Personal Details */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest pb-1.5 border-b border-stone-100">I. Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Full Name <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="Your Full Name"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Email Address <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="email"
                        placeholder="Your Email Address"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Phone Number <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="tel"
                        placeholder="Phone Number"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION II: Identity Verification */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest pb-1.5 border-b border-stone-100">II. Verification Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Identification Type <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <select
                        value={customerForm.idType}
                        onChange={(e) => setCustomerForm({ ...customerForm, idType: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 appearance-none cursor-pointer"
                      >
                        <option value="NIC">National Identity Card (NIC)</option>
                        <option value="PASSPORT">Passport</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      {customerForm.idType === "NIC" ? "NIC Number" : "Passport Number"} <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder={customerForm.idType === "NIC" ? "e.g. 199912345678" : "e.g. N1234567"}
                        value={customerForm.idNumber}
                        onChange={(e) => setCustomerForm({ ...customerForm, idNumber: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION III: Address & Location */}
              <div className="space-y-4">
                <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest pb-1.5 border-b border-stone-100">III. Address & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Address Line 1 <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="Street Address, P.O. Box, or Company Name"
                        value={customerForm.addressLine1}
                        onChange={(e) => setCustomerForm({ ...customerForm, addressLine1: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Address Line 2 <span className="text-stone-400 text-[8px]">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        type="text"
                        placeholder="Apartment, Suite, Unit, Building, or Floor"
                        value={customerForm.addressLine2}
                        onChange={(e) => setCustomerForm({ ...customerForm, addressLine2: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      City <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative group">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                      <input
                        required
                        type="text"
                        placeholder="City"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                        disabled={bookingLoading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                      Country <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Country"
                      value={customerForm.country}
                      onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                      disabled={bookingLoading}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Driving License Details (If applicable) */}
              {driverOption === "without" && (
                <div className="space-y-4 pt-2">
                  <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest pb-1.5 border-b border-stone-100">IV. Driver's License Details</h2>
                  <p className="text-[10px] font-semibold text-stone-500">Since you selected a self-drive vehicle, please provide valid driving license details.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                        License Number <span className="text-emerald-700">*</span>
                      </label>
                      <div className="relative group">
                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                        <input
                          required
                          type="text"
                          placeholder="e.g. B1234567"
                          value={customerForm.customerLicenseNo}
                          onChange={(e) => setCustomerForm({ ...customerForm, customerLicenseNo: e.target.value })}
                          disabled={bookingLoading}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">
                        License Expiry <span className="text-emerald-700">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          required
                          type="date"
                          value={customerForm.customerLicenseExpiry}
                          onChange={(e) => setCustomerForm({ ...customerForm, customerLicenseExpiry: e.target.value })}
                          disabled={bookingLoading}
                          className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_4px_20px_rgba(28,25,23,0.03)]">
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-6 pb-4 border-b border-stone-100 flex items-center justify-between">
                Order Summary <Car className="h-5 w-5 text-emerald-700" />
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 block">Vehicle Reserved</h3>
                  <p className="text-sm font-bold text-stone-900">{vehicle.make} {vehicle.model}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div>
                    <span className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarDays className="h-3 w-3"/> Pickup</span>
                    <span className="text-xs font-bold text-stone-900">{pickupDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarDays className="h-3 w-3"/> Return</span>
                    <span className="text-xs font-bold text-stone-900">{returnDate}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-2">
                    <span>Total Cost ({availability?.days} Days)</span>
                    <span>{formatMoney(availability?.totalPrice)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">Advance Deposit Due Now</span>
                  <span className="block text-2xl font-black text-emerald-900">{formatMoney(depositAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_4px_14px_0_rgba(4,120,87,0.39)] transition hover:bg-emerald-800 disabled:opacity-50 disabled:shadow-none"
                >
                  {bookingLoading ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
