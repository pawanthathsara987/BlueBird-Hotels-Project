import React from "react";
import { Calendar, MapPin, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BookingsTab({
  bookings,
  setBookings,
  isEmptyState,
  handleInitiateCancel,
  filterList
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

  const filteredBookings = filterList(bookings, "hotelName");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Hotel Stays</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">Manage details and requests for your upcoming suites and beachfront villas.</p>
        </div>
      </div>

      {isEmptyState || filteredBookings.length === 0 ? (
        renderEmptyState(
          "No Stays Booked Yet",
          "Ready to explore the globe? Book your premium beachfront retreat, historical luxury ryokan, or winter sky loft directly with exclusive premium privileges.",
          <Calendar size={36} />,
          "Explore Retreats",
          () => toast.success("Opening booking flow...")
        )
      ) : (
        <div className="space-y-6 font-sans">
          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row gap-6"
            >
              {/* Hotel Image Panel */}
              <div className="w-full lg:w-72 h-48 lg:h-auto rounded-2xl overflow-hidden shrink-0 relative group">
                <img
                  src={booking.image}
                  alt={booking.hotelName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/90 backdrop-blur-xs text-[9px] font-bold text-blue-950 rounded-full tracking-wider">
                  {booking.id}
                </div>
              </div>

              {/* Hotel Details Panel */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-blue-950">{booking.hotelName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-slate-400" />
                      {booking.location}
                    </p>
                  </div>
                  {/* Custom luxury badges */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${booking.status.includes("Cancellation") ? "bg-rose-50 border-rose-100 text-rose-800" : "bg-blue-50 border-blue-100 text-blue-900"}`}>
                      {booking.status}
                    </span>
                    <span className="px-3 py-1 bg-cyan-50 border border-cyan-100 text-cyan-900 rounded-full text-[9px] font-bold tracking-wider uppercase">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Room Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">DATES &amp; DURATION</span>
                    <span className="font-semibold text-blue-950 block">
                      {new Date(booking.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(booking.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-slate-500 text-[10px] font-medium">{booking.nights} Luxury Nights</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">SUITES &amp; GUESTS</span>
                    <span className="font-semibold text-blue-950 block">{booking.rooms.length} Suites Reserved</span>
                    <span className="text-slate-500 text-[10px] font-medium">{booking.guestsSummary}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">AIRPORT TRANSFERS</span>
                    <span className="font-semibold text-blue-950 block">{booking.airportTransfer}</span>
                    <span className="text-slate-500 text-[10px] font-medium">VIP Luxury Limousine service</span>
                  </div>
                </div>

                {/* Included Signature Club Privileges */}
                <div className="flex flex-wrap gap-2">
                  {booking.amenities.map((am, idx) => (
                    <span key={idx} className="bg-blue-50/40 border border-blue-100/50 px-2.5 py-1 rounded-lg text-[10px] text-blue-900 font-medium flex items-center gap-1.5">
                      <Check size={10} className="text-cyan-600" />
                      {am}
                    </span>
                  ))}
                </div>

                {/* Quick action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                  <div className="text-xs">
                    <span className="text-[9px] text-slate-400 font-bold block">TOTAL COST</span>
                    <span className="text-base font-serif font-semibold text-blue-950">${booking.amount.toLocaleString()} USD</span>
                  </div>
                  <div className="flex gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        toast.success("Limousine arrangements finalized with airline check!");
                        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, airportTransfer: "VIP Mercedes S-Class - Reserved" } : b));
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Upgrade Car
                    </button>
                    <button
                      onClick={() => handleInitiateCancel(booking)}
                      disabled={booking.status === "Cancellation Pending"}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 font-semibold text-xs rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                      Cancel Suite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
