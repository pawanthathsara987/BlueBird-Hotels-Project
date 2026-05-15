import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, MapPin, BarChart3 } from "lucide-react";

export default function ToursDashboard() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch(`${backendBaseUrl}/manager/tours`);
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || "Failed to load tours");
                }

                setTours(payload.data || []);
                setError("");
            } catch (error) {
                console.error("Failed to fetch tours:", error);
                setError(error.message || "Failed to fetch tours");
                setTours([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, [backendBaseUrl]);

    if (loading) {
        return <div className="text-center py-20"><p className="text-lg text-gray-600">Loading dashboard...</p></div>;
    }

    if (error) {
        return <div className="text-center py-20"><p className="text-lg text-red-600">{error}</p></div>;
    }

    // Calculate statistics
    const totalTours = tours.length;
    const totalRevenue = tours.reduce((sum, tour) => sum + (Number(tour.price) || 0), 0);
    const averagePrice = totalTours > 0 ? totalRevenue / totalTours : 0;
    const maxPrice = totalTours > 0 ? Math.max(...tours.map(t => Number(t.price) || 0)) : 0;
    const minPrice = totalTours > 0 ? Math.min(...tours.map(t => Number(t.price) || 0)) : 0;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Tours Dashboard</h1>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Tours */}
                <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">Total Tours</p>
                            <p className="text-4xl font-bold text-blue-600">{totalTours}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-blue-300 opacity-50" />
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-green-50 rounded-lg shadow-md p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <DollarSign className="w-12 h-12 text-green-300 opacity-50" />
                    </div>
                </div>

                {/* Average Price */}
                <div className="bg-purple-50 rounded-lg shadow-md p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">Avg Price</p>
                            <p className="text-3xl font-bold text-purple-600">${averagePrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <MapPin className="w-12 h-12 text-purple-300 opacity-50" />
                    </div>
                </div>

                {/* Price Range */}
                <div className="bg-orange-50 rounded-lg shadow-md p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">Price Range</p>
                            <p className="text-sm text-orange-700 font-bold">Min: ${minPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            <p className="text-sm text-orange-700 font-bold">Max: ${maxPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <BarChart3 className="w-12 h-12 text-orange-300 opacity-50" />
                    </div>
                </div>
            </div>

        </div>
    );
}
