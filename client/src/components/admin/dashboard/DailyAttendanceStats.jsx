import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDailyAttendanceStats } from "../../../utils/attendanceService";
import { Users, CheckCircle, Clock, AlertCircle, Calendar, ArrowRight, QrCode } from "lucide-react";

export default function DailyAttendanceStats() {
    const [data, setData] = useState({
        totalStaff: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        checkedInCount: 0,
        attendanceRate: 0,
        recentLogs: []
    });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await getDailyAttendanceStats();
            if (response.data?.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load daily attendance stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="h-6 w-48 bg-slate-200 rounded"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-blue-500 w-5 h-5" /> Daily Staff Attendance
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time attendance logs for today: {data.date}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to="/attendance"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 text-xs transition duration-200"
                    >
                        <QrCode size={14} className="text-slate-500" /> Scanner App
                    </Link>
                    <Link
                        to="/admin/attendance-records"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition duration-200 shadow-sm hover:shadow active:scale-98"
                    >
                        View Logs <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Active Staff */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-50 transition duration-300">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</p>
                        <h4 className="text-xl font-black text-slate-800 mt-0.5">{data.totalStaff}</h4>
                    </div>
                </div>

                {/* Present On Time */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-50 transition duration-300">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present</p>
                        <h4 className="text-xl font-black text-slate-800 mt-0.5">{data.presentCount}</h4>
                    </div>
                </div>

                {/* Late Check Ins */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-50 transition duration-300">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Late</p>
                        <h4 className="text-xl font-black text-slate-800 mt-0.5">{data.lateCount}</h4>
                    </div>
                </div>

                {/* Absent Staff */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-50 transition duration-300">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absent</p>
                        <h4 className="text-xl font-black text-slate-800 mt-0.5">{data.absentCount}</h4>
                    </div>
                </div>
            </div>

            {/* Attendance Progress bar & Recent Activity Split */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Attendance Rate */}
                <div className="bg-slate-50/30 border border-slate-100/70 p-5 rounded-2xl flex flex-col justify-center items-center text-center space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</p>
                    <div className="relative flex items-center justify-center">
                        {/* Custom Radial Progress Circle */}
                        <svg className="w-28 h-28 transform -rotate-90">
                            <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                            <circle cx="56" cy="56" r="48" stroke="#3b82f6" strokeWidth="8" fill="transparent" 
                                    strokeDasharray={301.6}
                                    strokeDashoffset={301.6 - (301.6 * data.attendanceRate) / 100}
                                    className="transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-2xl font-black text-slate-800">{data.attendanceRate}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">{data.checkedInCount} of {data.totalStaff} staff checked in today</p>
                </div>

                {/* Recent Activities */}
                <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Checks</p>
                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[140px] pr-1 space-y-2">
                        {data.recentLogs.length > 0 ? (
                            data.recentLogs.map((log, index) => (
                                <div key={index} className="flex items-center justify-between py-2 text-xs">
                                    <div>
                                        <p className="font-semibold text-slate-700">{log.StaffMember?.name || "Unknown Staff"}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{log.staffId} &bull; {log.attendanceMethod}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <div>
                                            <p className="font-bold text-slate-600">{formatTime(log.checkInTime)}</p>
                                            {log.checkOutTime && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">Out: {formatTime(log.checkOutTime)}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[9px] ${
                                            log.status === "Present"
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                                : log.status === "Late"
                                                ? "bg-amber-50 border-amber-100 text-amber-700"
                                                : "bg-rose-50 border-rose-100 text-rose-700"
                                        }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs font-semibold text-slate-400 py-6 text-center">
                                No check-ins recorded today yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
