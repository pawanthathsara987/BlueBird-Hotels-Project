import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Car, TrendingUp, DollarSign, Calendar, Users, BarChart3, Wrench, ShieldAlert } from "lucide-react";
import axios from "axios";

export default function VehiclesDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data: payload } = await axios.get(`${backendBaseUrl}/manager/vehicle-reports`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!payload || !payload.success) {
                    throw new Error((payload && payload.message) || "Failed to load vehicle analytics");
                }
                setAnalytics(payload.data || null);
                setError("");
            } catch (error) {
                console.error("Failed to fetch vehicle analytics:", error);
                setError(error.message || "Failed to fetch vehicle analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [backendBaseUrl]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading vehicle analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg mx-auto border border-red-100">
                    <p className="font-bold text-lg mb-2">Error Loading Analytics</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const {
        vehicleSummary = [],
        bookingStats = {}
    } = analytics || {};

    const {
        totalCount = 0,
        statusCounts = {},
        typeCounts = {},
        totalRevenue = 0
    } = bookingStats;

    const totalVehiclesCount = vehicleSummary.length;

    const formatCurrency = (val) => `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="w-full max-w-7xl mx-auto py-6">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Vehicles Analytics</h1>
                    <p className="text-slate-500">Real-time usage metrics, booking breakdown, and fleet utilization.</p>
                </div>
                <Link
                    to="/manager/vehicles"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm shadow-blue-500/10 text-sm"
                >
                    Manage Fleet
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Vehicles */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Total Fleet Size</p>
                        <p className="text-3xl font-bold text-slate-800">{totalVehiclesCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Car className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Total Bookings</p>
                        <p className="text-3xl font-bold text-slate-800">{totalCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                {/* Hire Types with Driver ratio */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">With Driver Bookings</p>
                        <p className="text-3xl font-bold text-slate-800">{typeCounts.with_driver || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Fleet Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Middle Section: Booking Statuses & Fleet List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Status breakdown */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-slate-500" />
                        Booking Statuses
                    </h3>
                    <div className="space-y-4">
                        {Object.keys(statusCounts).length === 0 ? (
                            <p className="text-slate-500 text-sm">No status data available.</p>
                        ) : (
                            Object.entries(statusCounts).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="font-semibold text-slate-600 capitalize">{status.replace('_', ' ')}</span>
                                    <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                                        {count}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Fleet Utilization & Revenue list */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Vehicle Utilization & Revenue
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                                    <th className="py-2.5">Vehicle</th>
                                    <th className="py-2.5 text-center">Bookings</th>
                                    <th className="py-2.5 text-center">Days Used</th>
                                    <th className="py-2.5 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleSummary.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-slate-400">
                                            No vehicle usage data available.
                                        </td>
                                    </tr>
                                ) : (
                                    vehicleSummary.map((v) => (
                                        <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                                            <td className="py-3 font-bold text-slate-800">
                                                {v.brand} {v.model}
                                                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{v.plateNumber}</span>
                                            </td>
                                            <td className="py-3 text-center font-semibold text-slate-700">{v.totalBookings}</td>
                                            <td className="py-3 text-center font-semibold text-slate-700">{v.totalDays}</td>
                                            <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(v.totalRevenue)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
