import React from "react";
import { Car, MapPin, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RentalsTab({
  vehicles,
  isEmptyState,
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
          className="px-6 py-2.5 bg-linear-to-r from-blue-900 to-cyan-700 hover:from-blue-800 hover:to-cyan-600 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  const filteredVehicles = filterList(vehicles, "model");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Fleet Rentals</h2>
          <p className="text-slate-500 text-xs mt-0.5">High-end sports convertibles and premium SUVs parked at VIP airport bays.</p>
        </div>
      </div>

      {isEmptyState || filteredVehicles.length === 0 ? (
        renderEmptyState(
          "No Luxury Vehicles Booked",
          "Arrive in style. Browse our premium global fleet of sports cars and executive limousines with airport runway delivery options.",
          <Car size={36} />,
          "Browse Fleet",
          () => toast.success("Fleet catalog loaded...")
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVehicles.map(v => (
            <div
              key={v.id}
              className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Vehicle Image */}
              <div className="h-48 relative overflow-hidden group">
                <img
                  src={v.image}
                  alt={v.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/95 text-[9px] font-bold text-blue-950 rounded-full tracking-wider uppercase">
                  {v.type}
                </div>
                <div className="absolute bottom-3.5 left-3.5 text-white">
                  <p className="text-[10px] text-amber-400 font-bold uppercase">RESERVATION: {v.id}</p>
                  <h3 className="font-serif font-semibold text-base">{v.model}</h3>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">PICKUP LOCATION</span>
                    <span className="font-semibold text-blue-950 flex items-center gap-1.5">
                      <MapPin size={10} className="text-slate-400" />
                      {v.pickupLocation}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{new Date(v.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">DROPOFF LOCATION</span>
                    <span className="font-semibold text-blue-950 flex items-center gap-1.5">
                      <MapPin size={10} className="text-slate-400" />
                      {v.dropoffLocation}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{new Date(v.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status & Options */}
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-100 font-bold rounded-full text-[9px] tracking-wider uppercase">
                    {v.status}
                  </span>
                  {v.unlimitedMileage && (
                    <span className="text-[10px] text-cyan-600 font-bold flex items-center gap-1">
                      <Check size={12} />
                      Unlimited Mileage
                    </span>
                  )}
                </div>

                {/* Rental Rates / Buttons */}
                <div className="flex justify-between items-center gap-4 pt-3 border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">RENTAL CHARGE</span>
                    <span className="text-base font-serif font-semibold text-blue-950">${v.price.toLocaleString()} USD</span>
                  </div>
                  <button
                    onClick={() => {
                      toast.success("Custom airport shuttle pre-delivery requested!");
                    }}
                    className="px-4 py-2 bg-linear-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Request Private Chauffeur
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
