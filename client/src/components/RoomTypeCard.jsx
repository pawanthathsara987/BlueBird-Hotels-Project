import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";

export default function RoomTypeCard({ id, name, image, price, occupancyType }) {
    const currencyType = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

    return (
        <Link to={`/room-type/${id}`} className="group h-[450px] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col block">
            {/* Image Container with Zoom effect */}
            <div className="relative h-60 w-full overflow-hidden shrink-0">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
                        No Image Available
                    </div>
                )}
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Occupancy Badge over image */}
                {occupancyType && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-slate-700">
                        <Users size={14} className="text-blue-600" />
                        <span>{occupancyType.type} Occupancy</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {name}
                    </h3>
                    
                    {/* Occupancy detail text */}
                    {occupancyType && (
                        <p className="text-sm text-slate-500 mb-4">
                            Accommodates up to {occupancyType.capacity} {occupancyType.capacity > 1 ? "guests" : "guest"}
                        </p>
                    )}
                </div>

                {/* Bottom Row: Price & Details Link */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Starting From
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-blue-600">
                                {price !== null && price !== undefined ? (
                                    `${currencyType} ${Number(price).toLocaleString()}`
                                ) : (
                                    `${currencyType} 10,000` // Fallback placeholder if no prices configured
                                )}
                            </span>
                            <span className="text-xs text-slate-400">/ night</span>
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
