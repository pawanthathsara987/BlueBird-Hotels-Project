import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export default function DashboardHeader({ refreshing, onRefresh }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <Sparkles size={12} className="animate-spin-slow" />
                        Live Statistics
                    </span>
                    {refreshing && (
                        <span className="text-[10px] text-slate-400 animate-pulse flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" /> Updating...
                        </span>
                    )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Hotel Overview
                </h1>
                <p className="text-xs md:text-sm text-slate-400 font-medium">
                    Real-time visualization of room status, occupancy rates and property status.
                </p>
            </div>

            <button
                onClick={() => onRefresh(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition duration-200 shadow-sm hover:scale-[1.02] cursor-pointer"
            >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Refresh
            </button>
        </div>
    );
}
