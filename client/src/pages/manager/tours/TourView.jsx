import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function TourView() {
    const navigate = useNavigate();
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
        return <div className="text-center p-8">Loading tours...</div>;
    }

    if (error) {
        return (
            <div className="w-[90%] md:w-[85%] mx-auto mt-8">
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
                    <p className="font-semibold mb-1">Unable to load tours</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[90%] md:w-[85%] mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Available Tours</h2>
                <Link to="/manager/tours/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Add Tour
                </Link>
            </div>

            {tours.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">No tours available yet.</p>
                    <Link to="/manager/tours/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
                        <Plus size={20} />
                        Create First Tour
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour) => (
                        <div key={tour.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {tour.image ? (
                                <img src={tour.image} alt={tour.packageName} className="h-48 w-full object-cover" />
                            ) : (
                                <div className="h-48 bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <p className="text-white text-center px-4">{tour.packageName || "Tour Image"}</p>
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{tour.packageName || "Untitled Tour"}</h3>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{tour.overview || "No overview available."}</p>
                                <p className="text-gray-500 text-xs mb-1">Location: {tour.location || "N/A"}</p>
                                <p className="text-blue-700 text-sm font-semibold mb-3">
                                    LKR {Number(tour.price || 0).toFixed(2)}
                                </p>

                                {Array.isArray(tour.TourItems) && tour.TourItems.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {tour.TourItems.slice(0, 3).map((item) => (
                                            <span key={item.id} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button 
                                    onClick={() => navigate(`/manager/tours/edit/${tour.id}`)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                                        <Edit2 size={18} />
                                        Edit
                                    </button>
                                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
