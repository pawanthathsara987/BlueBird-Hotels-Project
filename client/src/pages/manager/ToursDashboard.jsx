import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, BarChart3, Inbox, Calendar, Star } from "lucide-react";
import axios from "axios";

export default function ToursDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data: payload } = await axios.get(`${backendBaseUrl}/manager/tour-analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!payload || !payload.success) {
                    throw new Error((payload && payload.message) || "Failed to load analytics");
                }
                setAnalytics(payload.data || null);
                setError("");
            } catch (error) {
                console.error("Failed to fetch tour analytics:", error);
                setError(error.message || "Failed to fetch tour analytics");
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
                <p className="text-gray-500 font-medium">Loading tour analytics...</p>
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
        totalTours = 0,
        totalInquiries = 0,
        inquiryStatusBreakdown = [],
        totalBookings = 0,
        totalRevenue = 0,
        popularTours = []
    } = analytics || {};

    const formatCurrency = (val) => `${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="w-full max-w-7xl mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Tours Analytics</h1>
                <p className="text-slate-500">Real-time stats of inquiries, conversions and package popularity.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Tours */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Listed Packages</p>
                        <p className="text-3xl font-bold text-slate-800">{totalTours}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Inquiries */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Total Inquiries</p>
                        <p className="text-3xl font-bold text-slate-800">{totalInquiries}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Inbox className="w-6 h-6" />
                    </div>
                </div>

                {/* Confirmed Bookings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Confirmed Bookings</p>
                        <p className="text-3xl font-bold text-slate-800">{totalBookings}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Booking Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inquiry Status Breakdown */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-slate-500" />
                        Inquiry Statuses
                    </h3>
                    <div className="space-y-4">
                        {inquiryStatusBreakdown.length === 0 ? (
                            <p className="text-slate-500 text-sm">No inquiry status data available.</p>
                        ) : (
                            inquiryStatusBreakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="font-semibold text-slate-600 capitalize">{item.status}</span>
                                    <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                                        {item.count}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Popular Tour Packages */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Top Tour Packages By Inquiries
                    </h3>
                    <div className="space-y-4">
                        {popularTours.length === 0 ? (
                            <p className="text-slate-500 text-sm">No package popularity data available.</p>
                        ) : (
                            popularTours.map((tour, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                                            #{idx + 1}
                                        </span>
                                        <span className="font-bold text-slate-800 text-sm sm:text-base">{tour.packageName}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500">
                                        {tour.inquiryCount} inquiry(ies)
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
