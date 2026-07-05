import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Car, MapPin, User, FileText, CheckCircle2, Sparkles, ChevronLeft } from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

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

  const handleEdit = () => {
    navigate(`/vehicles/${vehicle.id}/book`, { state });
  };

  const handleProceed = () => {
    navigate(`/vehicles/${vehicle.id}/payment`, { state });
  };

  const depositAmount = availability?.depositAmount || (availability?.totalPrice * 0.5);
  const balanceAmount = availability?.balanceAmount || (availability?.totalPrice - depositAmount);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      
      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-slate-600 transition">Fleet</Link>
          <span>/</span>
          <Link to={`/vehicles/${vehicle.id}`} className="hover:text-slate-600 transition truncate">{vehicle.brand} {vehicle.model}</Link>
          <span>/</span>
          <span className="text-slate-600">Review Summary</span>
        </div>

        {/* Edit Button link */}
        <button 
          onClick={handleEdit} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Edit Booking Details
        </button>

        {/* Content Card Wrapper */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-sm">
          
          {/* Header block */}
          <div className="bg-slate-900 px-6 py-10 text-white sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900/40 z-10" />
            
            <div className="relative z-20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                <CheckCircle2 className="h-4 w-4" /> Step 3: Review Details
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Review Your Details</h1>
              <p className="max-w-xl text-xs text-slate-400 leading-relaxed">
                Please verify your vehicle selection, booking times, and custom location drop-off parameters before proceeding to the payment gateway.
              </p>
            </div>

            <div className="relative z-20 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center sm:text-right">
              <span className="text-[10px] uppercase text-slate-350 font-bold block mb-1">Due Now Deposit</span>
              <span className="text-2xl font-black text-emerald-400">{formatMoney(depositAmount)}</span>
            </div>
          </div>

          {/* Form items review block */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Vehicle & Reservation Dates */}
            <div className="grid md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-500" /> Selected Vehicle
                </h3>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {vehicle.vehicleType?.name || "Premium Fleet Option"} · Capacity: {vehicle.capacity} seats · Year {vehicle.year}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" /> Reservation Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pickup</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(pickupDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-slate-200 pl-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Return</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(returnDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 mt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-blue-600">{availability?.days} Days Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details & Driver preferences */}
            <div className="grid md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-500" /> Trip Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Pickup Location</span>
                    <span className="font-bold text-slate-855 mt-0.5 block">{bookingForm.pickupLocation}</span>
                  </div>
                  {bookingForm.dropoffLocation && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Dropoff Location</span>
                      <span className="font-bold text-slate-855 mt-0.5 block">{bookingForm.dropoffLocation}</span>
                    </div>
                  )}
                  {bookingForm.specialRequirements && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Special Requirements</span>
                      <span className="italic text-slate-550 mt-0.5 block">{bookingForm.specialRequirements}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" /> Chauffeur Assignment
                </h3>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
                  <p className="font-bold text-blue-800 text-sm">
                    {driverOption === "with" ? "Professional Chauffeur Driver" : "Self-Drive Option"}
                  </p>
                  <p className="text-[11px] text-blue-600/90 leading-relaxed">
                    {driverOption === "with" 
                      ? `Flat daily driver service charge of ${formatMoney(availability?.driverFee)} is calculated inside the total.` 
                      : "You have selected a self-driven rental. You must present your valid driver's license during vehicle pickup."}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Summary table details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Verified Invoice Calculations
              </h3>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <div className="space-y-2.5 text-xs border-b border-slate-200 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-550">Rental Base Fee ({availability?.days} Days @ {formatMoney(availability?.pricePerDay)} / Day)</span>
                    <span className="font-bold text-slate-900">{formatMoney(availability?.pricePerDay * availability?.days)}</span>
                  </div>
                  {driverOption === "with" && (
                    <div className="flex justify-between">
                      <span className="text-slate-550">Chauffeur Service Fee</span>
                      <span className="font-bold text-slate-900">{formatMoney(availability?.driverFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-2">
                    <span>Total Amount due</span>
                    <span>{formatMoney(availability?.totalPrice)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-100">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Due Now ({availability?.depositPercentage || 50}% Advance Deposit)</span>
                    <span className="block text-2xl font-black text-slate-900">{formatMoney(depositAmount)}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-100/50 p-4 border border-slate-200 border-dashed">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-550 mb-1">Due at Pickup (Remaining Balance)</span>
                    <span className="block text-xl font-bold text-slate-800">{formatMoney(balanceAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleEdit}
                className="w-full sm:w-1/3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 text-xs transition cursor-pointer"
              >
                Modify Reservation Details
              </button>
              <button
                onClick={handleProceed}
                className="w-full sm:w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-xs shadow-md shadow-blue-600/10 active:scale-[0.98] transition cursor-pointer"
              >
                Proceed to Payment Gateway
              </button>
            </div>
            
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
