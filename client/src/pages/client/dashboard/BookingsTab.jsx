import React from "react";
import { Calendar, MapPin, Check, BedDouble, Users, AlertCircle, Info } from "lucide-react";
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

  const getStatusColors = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "bg-emerald-50 border-emerald-100 text-emerald-800";
    if (s === "pending") return "bg-amber-50 border-amber-100 text-amber-800";
    if (s === "cancelled") return "bg-rose-50 border-rose-100 text-rose-800";
    if (s === "completed") return "bg-blue-50 border-blue-100 text-blue-800";
    return "bg-slate-50 border-slate-100 text-slate-700";
  };

  const getPaymentColors = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "bg-cyan-50 border-cyan-100 text-cyan-900";
    if (s === "unpaid") return "bg-orange-50 border-orange-100 text-orange-800";
    if (s === "cancelled") return "bg-rose-50 border-rose-100 text-rose-700";
    return "bg-slate-50 border-slate-100 text-slate-700";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filteredBookings = filterList(bookings, "hotelName");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">My Room Bookings</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">View and manage your hotel room reservations at BlueBird.</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          {filteredBookings.length} Booking{filteredBookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isEmptyState || filteredBookings.length === 0 ? (
        renderEmptyState(
          "No Bookings Yet",
          "You haven't made any room reservations yet. Book a luxury room at BlueBird Hotels & Resorts to get started.",
          <Calendar size={36} />,
          "Book a Room",
          () => window.location.href = "/rooms"
        )
      ) : (
        <div className="space-y-6 font-sans">
          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white/90 backdrop-blur-md border border-blue-50/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Card Top: Image + Quick Badge */}
              <div className="flex flex-col lg:flex-row">
                {/* Left Image Panel */}
                <div className="w-full lg:w-64 h-48 lg:h-auto relative group shrink-0">
                  <img
                    src={booking.image}
                    alt={booking.hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                  {/* Booking ID Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[9px] font-black text-blue-950 rounded-full tracking-widest shadow-sm">
                    {booking.id}
                  </div>
                  {/* Nights badge */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-blue-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                    {booking.nights} Night{booking.nights !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-blue-950 leading-tight">{booking.hotelName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin size={11} className="text-slate-400" />
                        {booking.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${getStatusColors(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${getPaymentColors(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Dates, Guests, Transfer Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 bg-slate-50/60 rounded-2xl p-4 border border-slate-100/80 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">CHECK-IN</span>
                      <span className="font-semibold text-blue-950">{formatDate(booking.checkIn)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">CHECK-OUT</span>
                      <span className="font-semibold text-blue-950">{formatDate(booking.checkOut)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">TOTAL GUESTS</span>
                      <span className="font-semibold text-blue-950 flex items-center gap-1">
                        <Users size={11} className="text-cyan-600" /> {booking.guestsSummary}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">AIRPORT TRANSFER</span>
                      <span className="font-semibold text-blue-950 text-[10px]">{booking.airportTransfer}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">ROOMS BOOKED</span>
                      <span className="font-semibold text-blue-950">{booking.rooms.length} Room{booking.rooms.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mb-1">DURATION</span>
                      <span className="font-semibold text-blue-950">{booking.nights} Night{booking.nights !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Rooms Detail — each booked room */}
                  {booking.rooms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">ROOM DETAILS</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.rooms.map((room, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-blue-50/50 border border-blue-100/60 rounded-xl px-3 py-2 text-xs">
                            <BedDouble size={13} className="text-blue-600 shrink-0" />
                            <div>
                              <span className="font-semibold text-blue-900">{room.type}</span>
                              {room.roomNumber && (
                                <span className="text-slate-400 ml-1 text-[10px]">({room.roomNumber})</span>
                              )}
                              <span className="text-slate-500 block text-[10px]">{room.guests}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note (if any) */}
                  {booking.note && (
                    <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-900">
                      <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <span><span className="font-bold">Note:</span> {booking.note}</span>
                    </div>
                  )}

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-2">
                    {booking.amenities.map((am, idx) => (
                      <span key={idx} className="bg-blue-50/40 border border-blue-100/50 px-2.5 py-1 rounded-lg text-[10px] text-blue-900 font-medium flex items-center gap-1.5">
                        <Check size={10} className="text-cyan-600" />
                        {am}
                      </span>
                    ))}
                  </div>

                  {/* Footer: Price + Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="text-xs w-full sm:w-auto">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block">TOTAL AMOUNT</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-serif font-bold text-blue-950">
                          {process.env.CURRENCY_TYPE || 'LKR'} {isNaN(booking.amount) ? "0.00" : booking.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-400 text-[10px]">{process.env.CURRENCY_TYPE || 'LKR'}</span>
                      </div>
                      {booking.tax > 0 && (
                        <span className="text-slate-400 text-[10px]">incl. {process.env.CURRENCY_TYPE || 'LKR'} {booking.tax.toFixed(2)} tax ({booking.taxPercentage}%)</span>
                      )}
                    </div>
                    <div className="flex gap-2.5 w-full sm:w-auto">
                      {booking.airportTransfer !== "Not Requested" && (
                        <button
                          onClick={() => {
                            toast.success("Limousine arrangements confirmed for your stay!");
                            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, airportTransfer: "VIP Mercedes S-Class Reserved" } : b));
                          }}
                          disabled={booking.status === "Cancelled"}
                          className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🚘 Upgrade Transfer
                        </button>
                      )}
                      <button
                        onClick={() => handleInitiateCancel(booking)}
                        disabled={booking.status === "Cancelled" || booking.status === "Completed" || booking.status === "Cancellation Pending"}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 font-semibold text-xs rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Cancel Booking
                      </button>
                    </div>
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
