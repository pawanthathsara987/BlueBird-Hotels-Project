import { Link } from "react-router-dom";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";

export default function TourPackageCard({ tour }) {
    const currencyType = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

    const finalPrice = tour.discount
        ? tour.price - (tour.price * tour.discount) / 100
        : tour.price;

    return (
        <Link to={`/booking/tour-details?tourId=${tour.id}`} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-[540px] max-w-[380px] md:max-w-[400px] w-full mx-auto">
            {/* Image Container with Zoom effect */}
            <div className="relative h-60 w-full overflow-hidden shrink-0 bg-slate-100">
                {tour.image ? (
                    <img
                        src={tour.image}
                        alt={tour.packageName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
                        No Image Available
                    </div>
                )}
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Duration Badge */}
                {tour.duration && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-slate-700">
                        <Clock size={14} className="text-blue-600" />
                        <span>
                            {tour.duration} {tour.durationType || "days"}
                        </span>
                    </div>
                )}

                {/* Discount Badge */}
                {tour.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                        {tour.discount}% OFF
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    {/* Location and Info Row */}
                    {tour.location && (
                        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                            <MapPin size={13} />
                            <span className="line-clamp-1">{tour.location}</span>
                        </div>
                    )}

                    {/* Package Name */}
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                        {tour.packageName}
                    </h3>
                    
                    {/* Group Size and Inclusions */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {tour.groupSize && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users size={10} />
                                Max {tour.groupSize} guests
                            </span>
                        )}
                        {tour.TourItems && tour.TourItems.slice(0, 1).map((item) => (
                            <span key={item.id} className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {item.name}
                            </span>
                        ))}
                    </div>

                    {/* Overview description */}
                    {tour.overview && (
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                            {tour.overview}
                        </p>
                    )}
                </div>

                {/* Bottom Row: Price & Details Link */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Starting From
                        </span>
                        
                        {tour.discount > 0 ? (
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 line-through">
                                    {currencyType} {Number(tour.price).toLocaleString()}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-extrabold text-blue-600">
                                        {currencyType} {Number(finalPrice).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400">/ package</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-blue-600">
                                    {currencyType} {Number(tour.price).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400">/ package</span>
                            </div>
                        )}
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
