import React from "react";
import {
  Compass,
  Calendar,
  Car,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Clock,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

// Helper components
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n || 0));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

function StatusBadge({ status }) {
  const map = {
    Succeeded: { cls: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: <CheckCircle2 size={10} /> },
    Pending:   { cls: "bg-amber-50 border-amber-200 text-amber-800",       icon: <Clock size={10} /> },
    Failed:    { cls: "bg-rose-50 border-rose-200 text-rose-700",           icon: <AlertCircle size={10} /> },
    Refunded:  { cls: "bg-purple-50 border-purple-200 text-purple-800",     icon: <RefreshCcw size={10} /> },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

export default function OverviewTab({
  profile = {},
  bookings = [],
  tours = [],
  vehicles = [],
  payments = [],
  isEmptyState = false,
  setActiveTab
}) {
  // Local Empty State Renderer
  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-3xl text-center space-y-5 shadow-inner">
      <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-full text-cyan-600 animate-pulse">
        {iconComponent}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-serif font-medium text-blue-950">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-900 hover:from-blue-900 hover:to-cyan-800 text-white font-medium text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md shadow-blue-955/10 hover:shadow-blue-955/20 active:scale-95 cursor-pointer"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  // Dynamic Time-of-Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Compute summary stats safely
  const upcomingStays = bookings.filter(
    b => b?.status?.toLowerCase() !== "cancelled" && b?.status?.toLowerCase() !== "completed"
  );
  
  // Target the first upcoming stay, or fallback to the most recent booking if none are active
  const nextStay = upcomingStays[0] || bookings[0];
  
  const nextCheckIn = nextStay?.checkIn
    ? new Date(nextStay.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;
    
  const daysUntilCheckIn = nextStay?.checkIn
    ? Math.max(0, Math.ceil((new Date(nextStay.checkIn) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // Visual Progress representation toward the next trip milestone (capped smoothly)
  const tripProgress = daysUntilCheckIn !== null 
    ? Math.min(100, Math.max(0, 100 - (daysUntilCheckIn * 2.5))) 
    : 0;

  const pendingToursCount = tours.filter(t => t?.status === "Pending Review" || t?.status === "Awaiting Payment").length;
  const totalServicesCount = bookings.length + tours.length + vehicles.length;

  // Retrieve upcoming tour and active rental
  const nextTour = tours.find(t => t.rawStatus === "accepted" || t.rawStatus === "progress" || t.rawStatus === "pending");
  const nextVehicle = vehicles.find(v => ["confirmed", "driver_assigned", "balance_paid", "ongoing"].includes(v.rawStatus));
  const recentPayments = payments.slice(0, 3); // Get top 3 transactions

  return (
    <div className="space-y-8 animate-in fade-in duration-500 ease-out font-sans">
      
      {/* Greetings / Elite Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 rounded-3xl p-6 md:p-10 text-white overflow-hidden shadow-xl shadow-blue-955/10 border border-white/5">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transform translate-x-16">
          <Compass size={400} className="text-white stroke-[1]" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-[0.3em] text-cyan-400 font-bold uppercase block">
              {profile?.tier || "ELITE MEMBER"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h1 className="font-serif font-normal text-2xl md:text-4xl leading-tight tracking-wide">
            {getGreeting()}, {profile?.name || "Guest"}
          </h1>
          <p className="text-slate-300/90 text-xs md:text-sm leading-relaxed font-light">
            {nextStay && upcomingStays.length > 0
              ? `Your upcoming stay at ${nextStay.hotelName} is ${daysUntilCheckIn === 0 ? 'today!' : `${daysUntilCheckIn} day${daysUntilCheckIn !== 1 ? 's' : ''} away.`} Our 24/7 dedicated concierge team has curated everything for your arrival.`
              : "Welcome to your luxury sanctuary dashboard. Explore boutique retreats, experiential private tours, and premium transport to design your next holiday."}
          </p>
        </div>
      </div>

      {/* Premium Analytics / Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Upcoming Stays */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 bg-cyan-50/70 rounded-xl text-cyan-700">
            <Calendar size={20} className="stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">UPCOMING STAYS</span>
            <span className="text-lg font-semibold text-slate-900 block mt-0.5 font-sans">
              {upcomingStays.length > 0 ? `${upcomingStays.length} Reserved` : "None Booked"}
            </span>
            <span className="text-[11px] text-slate-500 font-light block mt-0.5">
              {nextCheckIn ? `Next Arriving: ${nextCheckIn}` : "Explore retreats"}
            </span>
          </div>
        </div>

        {/* Active Vehicle Rentals */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50/70 rounded-xl text-indigo-700">
            <Car size={20} className="stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">RENTAL VEHICLES</span>
            <span className="text-lg font-semibold text-slate-900 block mt-0.5 font-sans">
              {vehicles.length > 0 ? `${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}` : "None"}
            </span>
            <span className="text-[11px] text-slate-500 font-light block mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap max-w-[130px]">
              {vehicles.length > 0 ? vehicles[0]?.model : "Reserve transport"}
            </span>
          </div>
        </div>

        {/* Pending Tour Inquiries */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50/70 rounded-xl text-amber-700">
            <Compass size={20} className="stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">EXPERIENCES</span>
            <span className="text-lg font-semibold text-slate-900 block mt-0.5 font-sans">
              {pendingToursCount > 0 ? `${pendingToursCount} Pending` : "Arranged"}
            </span>
            <span className="text-[11px] text-amber-700/90 font-medium block mt-0.5">
              {tours.length > 0 ? `${tours.length} Curated Itineraries` : "Discover activities"}
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50/70 rounded-xl text-emerald-700">
            <CheckCircle2 size={20} className="stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">TOTAL RESERVATIONS</span>
            <span className="text-lg font-semibold text-slate-900 block mt-0.5 font-sans">
              {totalServicesCount}
            </span>
            <span className="text-[11px] text-slate-500 font-light block mt-0.5">Active portfolio additions</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Reservations and Services Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isEmptyState || bookings.length === 0 ? (
            renderEmptyState(
              "Discover Tailored Luxury Retreats",
              "You have no upcoming itineraries planned. Our collection of ultra-luxury beachfront estates, mountain chalets, and historic boutique villas are curated and awaiting your reservation details.",
              <Compass size={36} className="stroke-[1.5]" />,
              "Explore Destinations",
              () => toast.success("Opening premium destination finder...")
            )
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-sm transition-all duration-300">
              
              {/* Stay Info Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold tracking-widest text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded">
                      CURRENT HOTEL RESERVATION
                    </span>
                  </div>
                  <h3 className="font-serif font-normal text-xl md:text-2xl text-slate-900 pt-1">
                    {nextStay?.hotelName}
                  </h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    {nextStay?.location}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-blue-50/60 text-blue-950 font-semibold text-[10px] rounded-full uppercase tracking-wider border border-blue-100/50 self-start sm:self-center">
                  {nextStay?.status || "Confirmed"}
                </span>
              </div>

              {/* Visual Overview Matrix */}
              <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Hotel Imagery Panel */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden h-56 shadow-md group">
                  {nextStay?.image ? (
                    <img
                      src={nextStay.image}
                      alt={nextStay.hotelName || "Resort"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      No Image Found
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                      {nextStay?.checkIn
                        ? new Date(nextStay.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : ""} – {nextStay?.checkOut
                        ? new Date(nextStay.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </p>
                    <p className="text-base font-serif font-light text-white mt-0.5">
                      {nextStay?.nights || 0} Night Stay
                    </p>
                  </div>
                </div>

                {/* Progress Tracker & Details Matrix */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs tracking-wide">
                      <span className="text-slate-400 font-medium uppercase text-[10px]">Countdown Status</span>
                      <span className="font-semibold text-slate-900">
                        {daysUntilCheckIn !== null
                          ? (daysUntilCheckIn === 0 ? "Arriving Today" : `${daysUntilCheckIn} days remaining`)
                          : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-900 to-cyan-700 h-full rounded-full transition-all duration-1000 ease-out shadow-xs" 
                        style={{ width: `${tripProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Micro Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 block font-bold tracking-wider uppercase">ACCOMMODATIONS</span>
                      <span className="font-semibold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-cyan-600" />
                        {nextStay?.rooms?.length || 0} Luxury Suite{nextStay?.rooms?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 block font-bold tracking-wider uppercase">AIRPORT SERVICE</span>
                      <span className="font-semibold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        {nextStay?.airportTransfer === "Not Requested" ? "Private Chauffeur Available" : "Chauffeur Confirmed"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Interactive Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="flex-1 py-3 bg-gradient-to-r from-slate-900 to-blue-950 text-white font-medium text-xs uppercase tracking-wider rounded-xl hover:from-slate-800 hover:to-blue-900 transition-all text-center flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <span>Manage Hotel Reservation</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Combined Services Panel: Active Vehicle & Tour (Detailed Widget Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tour Widget */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                    UPCOMING EXCURSION
                  </span>
                  {nextTour && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-100">
                      {nextTour.status}
                    </span>
                  )}
                </div>
                {nextTour ? (
                  <div className="space-y-3">
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-100">
                      <img src={nextTour.image} alt={nextTour.destination} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-blue-950 truncate">{nextTour.destination}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {nextTour.location}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 font-medium">
                        Scheduled: {new Date(nextTour.requestedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-500">Group: {nextTour.groupSize}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Compass size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-xs">No excursions scheduled.</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("tours")}
                className="w-full py-2.5 mt-4 border border-slate-200 hover:border-blue-950 text-slate-700 hover:text-blue-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{nextTour ? "View Excursions" : "Browse Experiences"}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Vehicle Rental Widget */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold tracking-widest text-cyan-600 uppercase bg-cyan-50 px-2 py-0.5 rounded">
                    CHAUFFEUR & FLEET
                  </span>
                  {nextVehicle && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-100">
                      {nextVehicle.status}
                    </span>
                  )}
                </div>
                {nextVehicle ? (
                  <div className="space-y-3">
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                      <img src={nextVehicle.image} alt={nextVehicle.model} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-blue-950 truncate">{nextVehicle.model}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Car size={10} /> {nextVehicle.type} • {(nextVehicle.hireType || "").replace("_", " ")}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 font-medium">
                        Pickup: {new Date(nextVehicle.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate" title={nextVehicle.pickupLocation}>From: {nextVehicle.pickupLocation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Car size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-xs">No luxury rentals arranged.</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("rentals")}
                className="w-full py-2.5 mt-4 border border-slate-200 hover:border-blue-900 text-slate-700 hover:text-blue-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{nextVehicle ? "View Fleet Booking" : "Explore Luxury Cars"}</span>
                <ChevronRight size={13} />
              </button>
            </div>
            
          </div>
        </div>

        {/* Right Column: Billing Summary Ledger & Quick Actions (1 Col) */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="font-serif font-semibold text-blue-950 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Luxury Concierge Actions
            </h3>
            <div className="pt-4 space-y-3 text-xs">
              <button
                onClick={() => setActiveTab("bookings")}
                className="w-full p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 rounded-2xl text-left font-semibold text-blue-950 flex justify-between items-center transition cursor-pointer"
              >
                <span>Book a Suite or Room</span>
                <ArrowRight size={12} className="text-slate-400" />
              </button>
              <button
                onClick={() => setActiveTab("tours")}
                className="w-full p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 rounded-2xl text-left font-semibold text-blue-950 flex justify-between items-center transition cursor-pointer"
              >
                <span>Curate Excursion Package</span>
                <ArrowRight size={12} className="text-slate-400" />
              </button>
              <button
                onClick={() => setActiveTab("rentals")}
                className="w-full p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 rounded-2xl text-left font-semibold text-blue-950 flex justify-between items-center transition cursor-pointer"
              >
                <span>Rent a Luxury Vehicle</span>
                <ArrowRight size={12} className="text-slate-400" />
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className="w-full p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 rounded-2xl text-left font-semibold text-blue-950 flex justify-between items-center transition cursor-pointer"
              >
                <span>Review Billing Statement</span>
                <ArrowRight size={12} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Billing & Recent Payments History */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-semibold text-blue-955 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-700" />
                Recent Transactions
              </h3>
              {recentPayments.length > 0 ? (
                <div className="pt-4 space-y-4">
                  {recentPayments.map(pay => (
                    <div key={pay.id} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{pay.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.refNo || pay.id}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(pay.date)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-semibold font-serif block ${pay.isRefund ? "text-purple-700" : pay.status === "Failed" ? "text-rose-600" : "text-blue-950"}`}>
                          {pay.isRefund ? "- " : ""}{pay.currency || import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {fmt(pay.amount)}
                        </span>
                        <div className="mt-1">
                          <StatusBadge status={pay.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CreditCard size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs">No billing statement history.</p>
                </div>
              )}
            </div>
            {recentPayments.length > 0 && (
              <button
                onClick={() => setActiveTab("payments")}
                className="w-full py-2.5 mt-5 border border-slate-200 hover:border-blue-900 text-slate-700 hover:text-blue-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Full Billing Ledger</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}