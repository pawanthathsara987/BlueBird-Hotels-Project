import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CalendarDays, ShieldAlert, ShieldCheck, Star } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const calculateDeposit = (totalPrice) => {
  const amount = Number(totalPrice);
  if (!Number.isFinite(amount)) return { depositAmount: null, balanceAmount: null };

  const depositAmount = Number((amount * 0.3).toFixed(2));
  const balanceAmount = Number((amount - depositAmount).toFixed(2));

  return { depositAmount, balanceAmount };
};

export default function VehicleBookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [vehicleLoading, setVehicleLoading] = useState(!location.state?.vehicle);
  const [vehicleError, setVehicleError] = useState("");
  const [pickupDate, setPickupDate] = useState(location.state?.pickupDate || "");
  const [returnDate, setReturnDate] = useState(location.state?.returnDate || "");
  const [driverOption, setDriverOption] = useState(location.state?.driverOption || "without");
  const [availability, setAvailability] = useState(location.state?.availability || null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropoffLocation: "",
    specialRequirements: "",
    customerLicenseNo: "",
    customerLicenseExpiry: ""
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

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setBookingError("Please choose an available date range before confirming your reservation.");
      return;
    }
    
    setBookingLoading(true);
    setBookingError("");
    
    try {
      const payload = {
        ...bookingForm,
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        withDriver: driverOption === "with"
      };
      
      const res = await axios.post(`${backendBaseUrl}/vehicles/${id}/book`, payload);
      setBookingSuccess(res.data.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (vehicleLoading) {
    return <div className="min-h-screen p-8">Loading booking page...</div>;
  }

  if (vehicleError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold text-slate-500">Vehicle booking</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Unable to load this vehicle</h1>
          <p className="mt-3 text-slate-600">{vehicleError}</p>
          <Link to="/vehicles" className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Return to fleet
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    const successDeposit = Number(bookingSuccess.depositAmount || pricing.depositAmount || 0);
    const successBalance = Number(bookingSuccess.balanceAmount || pricing.balanceAmount || 0);

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
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
              Pay the 30% advance deposit to secure the reservation. The remaining balance of {formatMoney(successBalance)} will be collected at pickup.
            </p>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-sky-600 px-4 py-4 font-semibold text-white transition hover:bg-sky-700 shadow-md shadow-sky-600/20" onClick={() => alert("PayHere Gateway Integration Pending") }>
            Pay Deposit Now
          </button>
          <Link to="/vehicles" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-4 font-semibold text-slate-700 transition hover:bg-slate-50">
            Return to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const summaryDeposit = pricing.depositAmount ?? 0;
  const summaryBalance = pricing.balanceAmount ?? 0;
  const availabilityWarning = !pickupDate || !returnDate
    ? "Select pickup and return dates to check live pricing."
    : availability?.available === false
      ? availability.reason || "This vehicle is unavailable for the selected dates."
      : "Pricing updates automatically when you change the dates or driver option.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to={`/vehicles/${id}`} className="mb-6 inline-flex items-center text-sm font-semibold text-sky-700 transition hover:text-sky-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to vehicle details
        </Link>

        <div className="overflow-hidden rounded-4xl border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
              <Star className="h-4 w-4" /> Premium vehicle checkout
            </div>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Complete Your Booking</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Select your pickup and return dates here, choose whether you want a driver, and review the live price breakdown before confirming.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <form onSubmit={handleBookSubmit} className="space-y-8">
                <section className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    <CalendarDays className="h-4 w-4" /> Booking dates
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Pickup Date *</label>
                      <input
                        required
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Return Date *</label>
                      <input
                        required
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase text-slate-500 mb-3">Driver option *</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${driverOption === "without" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Without driver</span>
                          <span className="block text-xs text-slate-500">Self-drive booking</span>
                        </span>
                        <input type="radio" name="driverOption" value="without" checked={driverOption === "without"} onChange={() => setDriverOption("without")} />
                      </label>
                      <label className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${driverOption === "with" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">With driver</span>
                          <span className="block text-xs text-slate-500">Driver fee added per day</span>
                        </span>
                        <input type="radio" name="driverOption" value="with" checked={driverOption === "with"} onChange={() => setDriverOption("with")} />
                      </label>
                    </div>
                  </div>
                </section>

                <section className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Name *</label>
                        <input required type="text" value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address *</label>
                        <input required type="email" value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Phone Number *</label>
                        <input required type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" />
                      </div>
                    </div>
                  </div>

                  {driverOption === "without" && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Driver's License (Self-Drive)</h3>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">License Number *</label>
                          <input required={driverOption === "without"} type="text" value={bookingForm.customerLicenseNo} onChange={(e) => setBookingForm({ ...bookingForm, customerLicenseNo: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" placeholder="e.g. B1234567" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">License Expiry *</label>
                          <input required={driverOption === "without"} type="date" value={bookingForm.customerLicenseExpiry} onChange={(e) => setBookingForm({ ...bookingForm, customerLicenseExpiry: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Trip Details</h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Pickup Location *</label>
                        <input required type="text" value={bookingForm.pickupLocation} onChange={(e) => setBookingForm({ ...bookingForm, pickupLocation: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" placeholder="e.g. Airport, Hotel Name" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Dropoff Location</label>
                        <input type="text" value={bookingForm.dropoffLocation} onChange={(e) => setBookingForm({ ...bookingForm, dropoffLocation: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" placeholder="Leave blank if same as pickup" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Special Requirements</label>
                        <textarea rows="3" value={bookingForm.specialRequirements} onChange={(e) => setBookingForm({ ...bookingForm, specialRequirements: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition bg-slate-50/50" placeholder="Child seat, extra luggage space..."></textarea>
                      </div>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                      {bookingError}
                    </div>
                  )}

                  {availability?.available === false && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                      <div className="font-semibold">This vehicle is unavailable for the selected dates.</div>
                      <div className="mt-1 text-xs text-amber-700">{availability.reason || 'Please choose different dates.'}</div>
                      {availability.conflictingBookingNo && (
                        <div className="mt-2 text-xs text-amber-700">Conflicting booking: <strong className="text-amber-900">{availability.conflictingBookingNo}</strong></div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      aria-disabled={!canSubmit}
                      title={!canSubmit ? (availability?.available === false ? (availability.reason || 'Vehicle unavailable') : 'Complete the form to enable booking') : ''}
                      className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingLoading ? "Processing your reservation..." : "Confirm Reservation"}
                    </button>
                    <p className="mt-4 text-center text-xs text-slate-500">
                      You will secure this reservation by paying the 30% advance deposit.
                    </p>
                  </div>
                </section>
              </form>
            </div>

            <aside className="space-y-6 bg-slate-50/70 p-6 sm:p-8">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <img
                  src={vehicle?.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
                  alt={`${vehicle?.brand || "Vehicle"} ${vehicle?.model || ""}`}
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Selected vehicle</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {vehicle?.brand || "Premium"} {vehicle?.model || "Vehicle"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{vehicle?.description || "Premium rental vehicle."}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {availability?.available ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldAlert className="h-4 w-4 text-amber-500" />}
                  Live booking status
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {!pickupDate || !returnDate
                      ? "Select your dates to start pricing."
                      : availabilityLoading
                        ? "Checking availability..."
                        : availability?.available
                          ? "Vehicle is available for the selected dates."
                          : availability?.reason || "This vehicle is unavailable for the selected dates."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{availabilityWarning}</p>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Days</span>
                    <span className="font-semibold text-slate-900">{availability?.days ?? "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Vehicle rate</span>
                    <span className="font-semibold text-slate-900">{availability?.pricePerDay ? formatMoney(availability.pricePerDay) : formatMoney(vehicle?.pricePerDay)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Driver fee</span>
                    <span className="font-semibold text-slate-900">{availability?.driverFee ? formatMoney(availability.driverFee) : driverOption === "with" ? "Calculating..." : formatMoney(0)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                    <span className="font-medium text-slate-200">Total price</span>
                    <span className="text-lg font-black">{availability?.totalPrice ? formatMoney(availability.totalPrice) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                    <span className="text-sky-900">30% deposit</span>
                    <span className="font-semibold text-sky-950">{summaryDeposit ? formatMoney(summaryDeposit) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                    <span className="text-emerald-900">Remaining balance</span>
                    <span className="font-semibold text-emerald-950">{summaryBalance ? formatMoney(summaryBalance) : "—"}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                  Deposit and balance values are recalculated from the live availability response every time you change the dates or driver option.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
