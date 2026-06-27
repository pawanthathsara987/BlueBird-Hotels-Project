import React from "react";
import { Activity, ArrowUpRight, Sparkles, Clock } from "lucide-react";

export default function DashboardQuickActions({ stats, loading }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between h-64 shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 mb-4 border border-white/5 shadow-inner">
                        <Activity size={18} />
                    </div>
                    <h4 className="text-lg font-black tracking-tight leading-snug">Quick Room Management</h4>
                    <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                        Need to update offline room configurations, add new listings or modify properties?
                    </p>
                </div>

                <a 
                    href="/admin/rooms/roomManagement" 
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition shadow duration-200 hover:scale-[1.02] cursor-pointer"
                >
                    <span>Manage Rooms Panel</span>
                    <ArrowUpRight size={14} />
                </a>
            </div>

            {/* Occupancy Progress Tracker Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-64 flex flex-col justify-between hover:shadow-md transition duration-300">
                <div>
                    <h4 className="text-sm font-black text-slate-800">Occupancy Distribution</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Ratio of booked rooms to available properties</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Booked Rooms</span>
                            <span className="text-emerald-500 font-extrabold">{loading ? "..." : `${stats.booked} Rooms (${stats.occupancyRate}%)`}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/40 p-0.5 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${loading ? 0 : stats.occupancyRate}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-bold">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-slate-400">AVAILABLE</p>
                            <p className="text-slate-700 text-sm font-extrabold mt-0.5">{loading ? "..." : stats.available}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-slate-400">OFFLINE</p>
                            <p className="text-slate-700 text-sm font-extrabold mt-0.5">{loading ? "..." : stats.canceled}</p>
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Sparkles size={11} className="text-blue-500" />
                    Target occupancy rate is 85% for this season
                </div>
            </div>

            {/* Operations Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-64 flex flex-col justify-between hover:shadow-md transition duration-300">
                <div>
                    <h4 className="text-sm font-black text-slate-800">Quick Checklist</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">System operations diagnostics check</p>
                </div>

                <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Rooms Controller</span>
                        </div>
                        <span className="text-emerald-500 font-extrabold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">Online</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Room Pricing Rules</span>
                        </div>
                        <span className="text-emerald-500 font-extrabold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Property Amenities</span>
                        </div>
                        <span className="text-emerald-500 font-extrabold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">Configured</span>
                    </div>
                </div>

                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <Clock size={11} className="text-slate-400" />
                    Last auto diagnosis: Just now
                </div>
            </div>

        </div>
    );
}
