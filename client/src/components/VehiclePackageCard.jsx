import { Link } from "react-router-dom";
import { Users, Fuel, Gauge, MapPin, ArrowRight } from "lucide-react";

export default function VehiclePackageCard({ vehicle }) {
    const currencyType = process.env.CURRENCY_TYPE || "LKR";

    const formatMoney = (value) => {
        const amount = Number(value);
        if (!Number.isFinite(amount)) return `${currencyType} 0.00`;
        return `${currencyType} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };

    return (
        <Link to={`/vehicles/${vehicle.id}`} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-[520px] max-w-[380px] md:max-w-[400px] w-full mx-auto">
            {/* Image Container with Zoom effect */}
            <div className="relative h-60 w-full overflow-hidden shrink-0 bg-slate-100">
                {vehicle.image ? (
                    <img
                        src={vehicle.image}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
                        No Image Available
                    </div>
                )}
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Transmission Badge */}
                {vehicle.transmission && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-slate-700 capitalize">
                        <Gauge size={14} className="text-blue-600" />
                        <span>{vehicle.transmission}</span>
                    </div>
                )}

                {/* Fuel Type Badge */}
                {vehicle.fuelType && (
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-white capitalize">
                        <Fuel size={14} className="text-sky-400" />
                        <span>{vehicle.fuelType}</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    {/* Model Details Row */}
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        <span>{vehicle.year || "Premium"} Fleet</span>
                    </div>

                    {/* Brand + Model */}
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                        {vehicle.brand} {vehicle.model}
                    </h3>
                    
                    {/* Capacity and Features Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {vehicle.capacity && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users size={10} />
                                {vehicle.capacity} Seats
                            </span>
                        )}
                        {Array.isArray(vehicle.features) && vehicle.features.slice(0, 1).map((feature, idx) => (
                            <span key={idx} className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <MapPin size={10} />
                                {feature}
                            </span>
                        ))}
                    </div>

                    {/* Description */}
                    {vehicle.description && (
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                            {vehicle.description}
                        </p>
                    )}
                </div>

                {/* Bottom Row: Price & Arrow Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Daily Rate
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-blue-600">
                                {formatMoney(vehicle.pricePerDay)}
                            </span>
                            <span className="text-[10px] text-slate-400">/ day</span>
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-center w-11 h-11 bg-slate-50 group-hover:bg-blue-600 text-slate-500 group-hover:text-white rounded-full transition-all duration-300 shadow-sm"
                    >
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
