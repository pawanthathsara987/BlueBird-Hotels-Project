import { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CalendarDays, ShieldAlert, ShieldCheck, Star, Sparkles, MapPin, Info, Clock } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

import Header from "../../../components/header";
import Footer from "../../../components/footer";

const calculateDeposit = (totalPrice) => {
  const amount = Number(totalPrice);
  if (!Number.isFinite(amount)) return { depositAmount: null, balanceAmount: null };

  const depositAmount = Number((amount * 0.5).toFixed(2));
  const balanceAmount = Number((amount - depositAmount).toFixed(2));

  return { depositAmount, balanceAmount };
};

const getMinDatetimeStr = () => {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

export default function VehicleBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [vehicleLoading, setVehicleLoading] = useState(!location.state?.vehicle);
  const [vehicleError, setVehicleError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
    if (!token) {
      navigate("/customerLogin", { state: { from: `/vehicles/${id}/book` } });
    }
  }, [navigate, id]);
  const [pickupDate, setPickupDate] = useState(location.state?.pickupDate || "");
  const [returnDate, setReturnDate] = useState(location.state?.returnDate || "");
  const [driverOption, setDriverOption] = useState(location.state?.driverOption || "without");
  const [availability, setAvailability] = useState(location.state?.availability || null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    pickupLocation: "Hotel Lobby",
    dropoffLocation: "Hotel Lobby",
    specialRequirements: location.state?.bookingForm?.specialRequirements || ""
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    if (vehicle) {
      return;
    }

    let cancelled = false;

    const loadVehicle = async () => {
      try {
        setVehicleLoading(true);
        setVehicleError("");
        const res = await axios.get(`${backendBaseUrl}/vehicles/${id}`);
        if (!cancelled) {
          setVehicle(res.data?.data || res.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setVehicleError(err.response?.data?.message || err.message || "Failed to load vehicle.");
          setVehicle(null);
        }
      } finally {
        if (!cancelled) {
          setVehicleLoading(false);
        }
      }
    };

    loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [id, vehicle]);

  useEffect(() => {
    if (!pickupDate || !returnDate) {
      setAvailability(null);
      setAvailabilityLoading(false);
      return;
    }

    const pickupTime = new Date(pickupDate).getTime();
    const returnTime = new Date(returnDate).getTime();

    if (!Number.isFinite(pickupTime) || !Number.isFinite(returnTime)) {
      setAvailability({ available: false, reason: "Please choose valid pickup and return dates." });
      setAvailabilityLoading(false);
      return;
    }

    if (returnTime <= pickupTime) {
      setAvailability({ available: false, reason: "Return date must be after pickup date.", days: 0, totalPrice: null, driverFee: null, pricePerDay: null });
      setAvailabilityLoading(false);
      return;
    }

    const bookingDays = Math.max(1, Math.ceil((returnTime - pickupTime) / (1000 * 60 * 60 * 24)));
    if (bookingDays > 30) {
      setAvailability({ available: false, reason: "Booking duration cannot exceed 30 days.", days: 0, totalPrice: null, driverFee: null, pricePerDay: null });
      setAvailabilityLoading(false);
      return;
    }

    // Check if pickup is at least 1 week in advance
    if (pickupDate < getMinDatetimeStr()) {
      setAvailability({ available: false, reason: "Bookings must be made at least 1 week in advance.", days: 0, totalPrice: null, driverFee: null, pricePerDay: null });
      setAvailabilityLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setAvailabilityLoading(true);
        const res = await axios.get(`${backendBaseUrl}/vehicles/${id}/availability`, {
          params: {
            pickup: pickupDate,
            return: returnDate,
            withDriver: driverOption === "with",
          },
        });

        if (!cancelled) {
          setAvailability(res.data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setAvailability({
            available: false,
            reason: err.response?.data?.message || err.message || "Unable to check availability.",
            days: 0,
            totalPrice: null,
            driverFee: null,
            pricePerDay: null,
          });
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [id, pickupDate, returnDate, driverOption]);

  // Prefer server-provided deposit/balance when available, otherwise calculate locally
  const serverDeposit = availability?.depositAmount ? Number(availability.depositAmount) : null;
  const serverBalance = availability?.balanceAmount ? Number(availability.balanceAmount) : null;
  const pricing = {
    depositAmount: serverDeposit ?? calculateDeposit(availability?.totalPrice).depositAmount,
    balanceAmount: serverBalance ?? calculateDeposit(availability?.totalPrice).balanceAmount,
  };

  const canSubmit = Boolean(
    vehicle &&
    pickupDate &&
    returnDate &&
    availability?.available &&
    !availabilityLoading &&
    !bookingLoading
  );

  const handlePickupChange = (e) => {
    const newPickup = e.target.value;
    setPickupDate(newPickup);
    if (newPickup) {
      const d = new Date(newPickup);
      if (!Number.isNaN(d.getTime())) {
        d.setDate(d.getDate() + 1);
        const offset = d.getTimezoneOffset() * 60000;
        const newReturn = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        setReturnDate(newReturn);
      }
    }
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setBookingError("Please choose an available date range before proceeding.");
      return;
    }

    setBookingError("");

    navigate(`/vehicles/${id}/summary`, {
      state: {
        vehicle,
        pickupDate,
        returnDate,
        driverOption,
        availability,
        bookingForm
      }
    });
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 p-8">Loading booking page...</div>
        <Footer />
      </div>
    );
  }

  if (vehicleError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold text-slate-500">Vehicle booking</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Unable to load this vehicle</h1>
          <p className="mt-3 text-slate-600">{vehicleError}</p>
          <Link to="/vehicles" className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Return to fleet
          </Link>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (bookingSuccess) {
    const successDeposit = Number(bookingSuccess.depositAmount || pricing.depositAmount || 0);
    const successBalance = Number(bookingSuccess.balanceAmount || pricing.balanceAmount || 0);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />
        <div className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-4xl border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-950">Booking reserved</h2>
          <p className="mt-2 text-center text-slate-600">
            Your booking reference is <strong className="text-slate-950">{bookingSuccess.bookingNo}</strong>.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Advance deposit required</div>
            <div className="mt-3 text-4xl font-black text-slate-950">{formatMoney(successDeposit)}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pay the {availability?.depositPercentage || 50}% advance deposit to secure the reservation. The remaining balance of {formatMoney(successBalance)} {availability?.securityDepositAmount ? `plus a refundable security deposit of ${formatMoney(availability.securityDepositAmount)}` : ''} will be collected at pickup.
            </p>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-sky-600 px-4 py-4 font-semibold text-white transition hover:bg-sky-700 shadow-md shadow-sky-600/20" onClick={() => alert("PayHere Gateway Integration Pending")}>
            Pay Deposit Now
          </button>
          <Link to="/vehicles" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-4 font-semibold text-slate-700 transition hover:bg-slate-50">
            Return to Fleet
          </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const summaryDeposit = pricing.depositAmount ?? 0;
  const summaryBalance = pricing.balanceAmount ?? 0;
  const securityDeposit = availability?.securityDepositAmount ? Number(availability.securityDepositAmount) : 0;
  const totalDueAtPickup = summaryBalance + securityDeposit;

  const availabilityWarning = !pickupDate || !returnDate
    ? "Select pickup and return dates to check live pricing."
    : availability?.available === false
      ? availability.reason || "This vehicle is unavailable for the selected dates."
      : "Pricing updates automatically when you change the dates or driver option.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation back tracker */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-slate-600 transition">Fleet</Link>
          <span>/</span>
          <Link to={`/vehicles/${id}`} className="hover:text-slate-600 transition truncate">{vehicle?.brand} {vehicle?.model}</Link>
          <span>/</span>
          <span className="text-slate-600">Checkout</span>
        </div>

        {/* Back Link Button */}
        <Link 
          to={`/vehicles/${id}`} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicle Details
        </Link>

        {/* Main Card Container wrapper */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-sm">
          
          {/* Header gradient banner */}
          <div className="bg-slate-900 px-6 py-10 text-white sm:px-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900/40 z-10" />
            <div className="relative z-20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                <Sparkles className="h-4 w-4" /> Secure Reservations
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Complete Your Booking</h1>
              <p className="max-w-2xl text-xs text-slate-400 leading-relaxed">
                Confirm your pickup times and driver preferences. Review pricing summary in the live check box on the right before checking out.
              </p>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-12">
            
            {/* Left Column: Form details */}
            <div className="lg:col-span-7 border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r space-y-8">
              <form onSubmit={handleBookSubmit} className="space-y-8">
                
                {/* Section 1: Dates & Driver Option */}
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CalendarDays className="w-5 h-5 text-blue-500" /> 1. Booking Dates & Driver Options
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Date & Time *</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          required
                          type="datetime-local"
                          min={getMinDatetimeStr()}
                          value={pickupDate}
                          onChange={handlePickupChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white pl-10 pr-4 py-3 text-xs outline-none transition focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Return Date & Time *</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          required
                          type="datetime-local"
                          min={pickupDate || getMinDatetimeStr()}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white pl-10 pr-4 py-3 text-xs outline-none transition focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {availability?.available === false && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Vehicle is booked or unavailable</p>
                        <p className="font-medium text-amber-700/90 mt-0.5">{availability.reason || 'Please choose different dates.'}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver Service Options *</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${driverOption === "without" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">Self-Driven Hire</span>
                          <span className="block text-[10px] text-slate-500">I will drive myself</span>
                        </div>
                        <input type="radio" name="driverOption" value="without" checked={driverOption === "without"} onChange={() => setDriverOption("without")} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                      </label>
                      <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${driverOption === "with" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">Professional Driver</span>
                          <span className="block text-[10px] text-slate-500">Driver fees added per day</span>
                        </div>
                        <input type="radio" name="driverOption" value="with" checked={driverOption === "with"} onChange={() => setDriverOption("with")} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Trip Details & Locations */}
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="w-5 h-5 text-teal-500" /> 2. Trip Details & Locations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Location (Fixed)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          readOnly 
                          type="text" 
                          value={bookingForm.pickupLocation} 
                          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-xs bg-slate-100 text-slate-500 font-semibold cursor-not-allowed outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Dropoff Location (Fixed)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          readOnly 
                          type="text" 
                          value={bookingForm.dropoffLocation} 
                          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-xs bg-slate-100 text-slate-500 font-semibold cursor-not-allowed outline-none" 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Special Requests / Requirements</label>
                      <textarea 
                        rows="3" 
                        value={bookingForm.specialRequirements} 
                        onChange={(e) => setBookingForm({ ...bookingForm, specialRequirements: e.target.value })} 
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-blue-400 focus:bg-white bg-slate-50 transition" 
                        placeholder="Child seat, extra luggage rack, specific arrival information..."
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions block */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-400" /> Rental Terms & Conditions
                  </h4>
                  <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed mt-2">
                    {availability?.termsAndConditions || "No rental policy terms set by the manager."}
                  </div>
                </div>

                {bookingError && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                    {bookingError}
                  </div>
                )}

                {/* Submit Container */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:shadow-none"
                  >
                    Proceed to Reservation Summary
                  </button>
                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    By checking out, you agree to our standard vehicle renting policies. Live availability responses update rates automatically.
                  </p>
                </div>

              </form>
            </div>

            {/* Right Column: Reservation Invoice Summary sidebar */}
            <aside className="lg:col-span-5 bg-slate-50/70 p-6 sm:p-8 space-y-6">
              
              {/* Selected Vehicle Thumbnail Card */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
                <img
                  src={vehicle?.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
                  alt={`${vehicle?.brand} ${vehicle?.model}`}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Selected Option</span>
                  <h4 className="text-lg font-bold text-slate-800">{vehicle?.brand} {vehicle?.model}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{vehicle?.description || "Premium rental fleet vehicle."}</p>
                </div>
              </div>

              {/* Pricing breakdown card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
                
                {/* Availability status badge */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                  {availability?.available ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-500 animate-pulse" />
                      <span className="text-emerald-700">Live Status: Available</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">Check Parameters</span>
                    </>
                  )}
                </div>

                {/* Calculation Rows */}
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Rental Duration</span>
                    <span className="text-slate-800 font-bold">{availability?.days ?? "-"} Days</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Base Daily Rate</span>
                    <span className="text-slate-800 font-bold">
                      {availability?.pricePerDay ? formatMoney(availability.pricePerDay) : formatMoney(vehicle?.pricePerDay)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">Driver Service Fee</span>
                    <span className="text-slate-800 font-bold">
                      {availability?.driverFee ? formatMoney(availability.driverFee) : driverOption === "with" ? "Calculating..." : formatMoney(0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 bg-slate-900 text-white px-3.5 rounded-xl mt-3">
                    <span className="font-semibold text-slate-200">Total Rental Cost</span>
                    <span className="text-base font-black">{availability?.totalPrice ? formatMoney(availability.totalPrice) : "—"}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 bg-blue-50 text-blue-900 px-3.5 rounded-xl mt-2">
                    <span className="font-bold text-blue-700">{availability?.depositPercentage || 50}% Advance Deposit</span>
                    <span className="font-black">{summaryDeposit ? formatMoney(summaryDeposit) : "—"}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 bg-slate-50 text-slate-800 px-3.5 border border-slate-100 rounded-xl mt-2">
                    <span className="font-bold text-slate-600">Remaining Rental Balance</span>
                    <span className="font-black text-slate-800">{summaryBalance ? formatMoney(summaryBalance) : "—"}</span>
                  </div>

                  {availability?.securityDepositAmount && (
                    <div className="flex justify-between items-center py-2.5 bg-slate-50 text-slate-800 px-3.5 border border-slate-100 rounded-xl mt-2">
                      <div>
                        <span className="font-bold text-slate-600 block">Refundable Security Deposit</span>
                        <span className="text-[9px] text-slate-400 block -mt-1 font-medium">Refunded on safe return</span>
                      </div>
                      <span className="font-black text-slate-800">{formatMoney(availability.securityDepositAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2.5 bg-emerald-50 text-emerald-900 px-3.5 rounded-xl mt-2">
                    <div>
                      <span className="font-bold text-emerald-700 block">Total Due at Pickup</span>
                      <span className="text-[9px] text-emerald-600 block -mt-1 font-medium">Rental Balance + Security Deposit</span>
                    </div>
                    <span className="font-black">{totalDueAtPickup ? formatMoney(totalDueAtPickup) : "—"}</span>
                  </div>
                </div>

                {/* Recalculate hint */}
                <div className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-400 mt-2 leading-relaxed">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span>Invoice parameters are verified in real time when you toggle driver preferences or change pickup dates.</span>
                </div>

              </div>

            </aside>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
