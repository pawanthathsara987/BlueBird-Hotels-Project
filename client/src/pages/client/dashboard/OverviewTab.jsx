import React from "react";
import {
  Compass,
  Calendar,
  Car,
  CheckCircle2,
  MapPin,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OverviewTab({
  profile,
  bookings,
  tours,
  vehicles,
  isEmptyState,
  setActiveTab
}) {
  // Local Empty State Renderer
  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
      <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">
        {iconComponent}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-blue-950">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-cyan-700 hover:from-blue-800 hover:to-cyan-600 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Greetings / Elite Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-950 rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-lg shadow-blue-950/20">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
          <Compass size={350} className="text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 font-bold uppercase block">
            WELCOME BACK
          </span>
          <h1 className="font-serif font-semibold text-2xl md:text-3xl leading-tight">
            Your Next Journey Awaits, {profile.name}
          </h1>
          <p className="text-blue-200/80 text-xs md:text-sm leading-relaxed font-light">
            Welcome back to your luxury sanctuary dashboard. Our ground coordinators and 24/7 concierge butlers have fully secured your arrangements for Mauritius in October.
          </p>
        </div>
      </div>

      {/* Premium Analytics / Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Stays */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">UPCOMING STAYS</span>
            <span className="text-base font-bold text-blue-950 block">
              {isEmptyState ? "None Locked" : `${bookings.length} Booked`}
            </span>
            <span className="text-[10px] text-slate-500 font-medium font-sans">
              {isEmptyState ? "Search retreats" : "Next trip: Oct 14"}
            </span>
          </div>
        </div>

        {/* Active Vehicle Rentals */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Car size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">RENTAL CARS</span>
            <span className="text-base font-bold text-blue-950 block">
              {isEmptyState ? "None" : `${vehicles.length} Active`}
            </span>
            <span className="text-[10px] text-slate-500 font-medium font-sans">
              {isEmptyState ? "Browse sports models" : "Porsche Convertible"}
            </span>
          </div>
        </div>

        {/* Pending Tour Inquiries */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Compass size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">PENDING TOURS</span>
            <span className="text-base font-bold text-blue-950 block">
              {isEmptyState ? "None" : `${tours.filter(t => t.status === "Pending Review").length} Inquiries`}
            </span>
            <span className="text-[10px] text-amber-600 font-medium font-sans">
              {isEmptyState ? "Explore excursions" : "Helicopter tasting"}
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">LOCKED TRAVELS</span>
            <span className="text-base font-bold text-blue-950 block">
              {isEmptyState ? 0 : bookings.length + tours.length + vehicles.length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium font-sans">All luxury services</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Stay Progress Card */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          {isEmptyState || bookings.length === 0 ? (
            renderEmptyState(
              "Discover Luxury Retreats",
              "You have no upcoming stays. Our premium collection of beachfront villas, mountain ski chalets, and historic boutique ryokans are ready for your reservation.",
              <Compass size={36} />,
              "Search Retreats",
              () => toast.success("Redirecting to Search...")
            )
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">UPCOMING SOJOURN</span>
                  <h3 className="font-serif font-semibold text-lg text-blue-950 leading-tight">
                    {bookings[0].hotelName}
                  </h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    {bookings[0].location}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-900 font-bold text-[10px] rounded-full uppercase tracking-wider border border-blue-100">
                  {bookings[0].status}
                </span>
              </div>

              <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-sans">
                <div className="relative rounded-2xl overflow-hidden h-48 group">
                  <img
                    src={bookings[0].image}
                    alt={bookings[0].hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-[10px] uppercase font-bold tracking-wide text-amber-400">OCTOBER 14 - OCTOBER 20</p>
                    <p className="text-sm font-semibold text-white">6 Nights Stay</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>TRIP PROGRESS</span>
                      <span className="font-semibold text-blue-950">144 days until check-in</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-900 h-full w-[25%] rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100/60">
                      <span className="text-[9px] text-slate-400 block font-semibold">ROOMS SELECTED</span>
                      <span className="font-bold text-blue-950 text-sm">{bookings[0].rooms.length} Suites</span>
                    </div>
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100/60">
                      <span className="text-[9px] text-slate-400 block font-semibold">AIRPORT TRANSFER</span>
                      <span className="font-bold text-blue-950 text-sm">VIP Private Car</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-950 to-blue-800 text-white font-semibold text-xs rounded-xl hover:from-blue-900 hover:to-blue-700 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <span>Manage Reservations</span>
                  <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => {
                    toast.success("Upgrade request submitted. Our team will contact you shortly.", {
                      style: { borderRadius: '8px', background: '#1e3a8a', color: '#fff' }
                    });
                  }}
                  className="px-4 py-2.5 bg-white border border-blue-900/30 text-blue-950 font-semibold text-xs rounded-xl hover:bg-blue-50/30 transition-all text-center"
                >
                  Request Upgrade / Spa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
