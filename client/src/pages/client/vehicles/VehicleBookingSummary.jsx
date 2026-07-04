import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Car, MapPin, User, FileText, CheckCircle2 } from "lucide-react";

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export default function VehicleBookingSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">No Booking Details Found</h2>
        <p className="text-slate-600 mb-6">Please start your booking process again.</p>
        <Link to="/vehicles" className="rounded-xl bg-slate-950 px-6 py-3 text-white font-semibold hover:bg-slate-800">
          Return to Fleet
        </Link>
      </div>
    );
  }

  const { vehicle, pickupDate, returnDate, driverOption, availability, bookingForm } = state;

  const handleEdit = () => {
    navigate(`/vehicles/${vehicle.id}/book`, { state });
  };

  const handleProceed = () => {
    navigate(`/vehicles/${vehicle.id}/payment`, { state });
  };

  const depositAmount = availability?.depositAmount || (availability?.totalPrice * 0.5);
  const balanceAmount = availability?.balanceAmount || (availability?.totalPrice - depositAmount);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={handleEdit} className="mb-6 inline-flex items-center text-sm font-semibold text-sky-700 transition hover:text-sky-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit Booking Details
        </button>

        <div className="overflow-hidden rounded-4xl border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8 flex justify-between items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                <CheckCircle2 className="h-4 w-4" /> Booking Summary
              </div>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">Review Your Details</h1>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Please verify your reservation details below before proceeding to payment.
              </p>
            </div>
            <div className="hidden sm:block text-right">
                <span className="text-xs uppercase text-slate-400 font-bold block mb-1">Total Due Now</span>
                <span className="text-3xl font-black text-emerald-400">{formatMoney(depositAmount)}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Vehicle Info */}
            <div className="grid md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Vehicle Details
                </h3>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">{vehicle.brand || "Premium"} {vehicle.model}</p>
                  <p className="text-sm text-slate-500">{vehicle.vehicleType?.name || "Premium Fleet"} • {vehicle.year}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Reservation Dates
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
                    <span className="text-sm font-semibold text-slate-900">{pickupDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Return</span>
                    <span className="text-sm font-semibold text-slate-900">{returnDate}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200/60 mt-1">
                    <span className="text-sm font-semibold text-slate-700">{availability?.days} Days Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location & Preferences
                </h3>
                <div className="space-y-4 text-sm text-slate-700">
                  <div>
                    <span className="block text-xs font-bold text-slate-400">Pickup Location</span>
                    <span className="font-semibold">{bookingForm.pickupLocation}</span>
                  </div>
                  {bookingForm.dropoffLocation && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400">Dropoff Location</span>
                      <span className="font-semibold">{bookingForm.dropoffLocation}</span>
                    </div>
                  )}
                  {bookingForm.specialRequirements && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400">Special Requirements</span>
                      <span className="italic">{bookingForm.specialRequirements}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Driver Option
                </h3>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p className="font-bold text-sky-900">{driverOption === "with" ? "Chauffeur Driven" : "Self-Drive"}</p>
                  <p className="text-xs text-sky-700 mt-1">
                    {driverOption === "with" 
                      ? `Driver fee of ${formatMoney(availability?.driverFee)} is included in the total.` 
                      : "You will be required to provide your driving license details."}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Pricing Breakdown
              </h3>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-3 text-sm text-slate-600 border-b border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Rental ({availability?.days} days @ {formatMoney(availability?.pricePerDay)}/day)</span>
                    <span className="font-medium text-slate-900">{formatMoney(availability?.pricePerDay * availability?.days)}</span>
                  </div>
                  {driverOption === "with" && (
                    <div className="flex justify-between">
                      <span>Driver Fee</span>
                      <span className="font-medium text-slate-900">{formatMoney(availability?.driverFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2">
                    <span>Total Amount</span>
                    <span>{formatMoney(availability?.totalPrice)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Due Now ({availability?.depositPercentage || 50}% Deposit)</span>
                    <span className="block text-2xl font-black text-slate-900">{formatMoney(depositAmount)}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4 border border-slate-200 border-dashed">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pay at Pickup</span>
                    <span className="block text-xl font-bold text-slate-700">{formatMoney(balanceAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleEdit}
                className="w-full sm:w-1/3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Modify Details
              </button>
              <button
                onClick={handleProceed}
                className="flex w-full sm:w-2/3 items-center justify-center rounded-2xl bg-sky-600 px-4 py-4 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(2,132,199,0.39)] transition hover:bg-sky-700 hover:shadow-[0_6px_20px_rgba(2,132,199,0.23)]"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
