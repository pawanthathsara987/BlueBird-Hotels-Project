import React from "react";
import { Bed, TrendingUp, Building2, AlertTriangle } from "lucide-react";

export default function DashboardStats({ loading, stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Total Rooms Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition duration-300 relative overflow-hidden group">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                    <Bed size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rooms</p>
                    <h3 className="text-2xl font-black text-slate-800">{loading ? "..." : stats.total}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Configured in system</p>
                </div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-ping opacity-75" />
            </div>

            {/* Occupancy Rate Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition duration-300 relative overflow-hidden group">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                    <TrendingUp size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occupancy Rate</p>
                    <h3 className="text-2xl font-black text-slate-800">{loading ? "..." : `${stats.occupancyRate}%`}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{stats.booked} Active Bookings</p>
                </div>
            </div>

            {/* Available Rooms Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition duration-300 relative overflow-hidden group">
                <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                    <Building2 size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Rooms</p>
                    <h3 className="text-2xl font-black text-slate-800">{loading ? "..." : stats.available}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold">Ready for check-in</p>
                </div>
            </div>

            {/* Maintenance Rooms Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition duration-300 relative overflow-hidden group">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                    <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Maintenance</p>
                    <h3 className="text-2xl font-black text-slate-800">{loading ? "..." : stats.canceled}</h3>
                    <p className="text-[10px] text-rose-500 font-bold">Offline / Out of order</p>
                </div>
            </div>

        </div>
    );
}
