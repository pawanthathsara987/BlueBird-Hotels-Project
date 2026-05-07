import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function TourView({ searchQuery = "" }) {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
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

    const handleDeleteTour = async (tourId) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this tour?");
        if (!shouldDelete) return;

        try {
            setDeletingId(tourId);
            const response = await fetch(`${backendBaseUrl}/manager/tours/${tourId}`, {
                method: "DELETE",
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "Failed to delete tour");
            }

            setTours((prevTours) => prevTours.filter((tour) => tour.id !== tourId));
            setError("");
        } catch (deleteError) {
            console.error("Failed to delete tour:", deleteError);
            setError(deleteError.message || "Failed to delete tour");
        } finally {
            setDeletingId(null);
        }
    };

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredTours = normalizedSearch
        ? tours.filter((tour) =>
              (tour.packageName || "").toLowerCase().includes(normalizedSearch) ||
              (tour.location || "").toLowerCase().includes(normalizedSearch) ||
              (tour.overview || "").toLowerCase().includes(normalizedSearch)
          )
        : tours;
    

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
        <div className="w-[90%] md:w-[85%] mx-auto mt-8 pb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Available Tours</h2>
                <Link to="/manager/tours/add" className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                    <Plus size={20} />
                    Add Tour
                </Link>
            </div>

            {filteredTours.length === 0 ? (
                <div className="bg-linear-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl shadow-lg p-8 text-center border border-blue-100">
                    {tours.length === 0 ? (
                        <>
                            <p className="text-gray-500 mb-4">No tours available yet.</p>
                            <Link to="/manager/tours/add" className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                                <Plus size={20} />
                                Create First Tour
                            </Link>
                        </>
                    ) : (
                        <p className="text-gray-500">No tours match your search.</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTours.map((tour) => (
                        <div key={tour.id} className="relative bg-white rounded-3xl shadow-[0_10px_28px_rgba(2,6,23,0.08)] border border-slate-100 overflow-hidden hover:shadow-[0_18px_40px_rgba(2,6,23,0.14)] hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-emerald-500" />
                            {tour.image ? (
                                <div className="relative h-52 overflow-hidden">
                                    <img src={tour.image} alt={tour.packageName} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/45 via-slate-900/0 to-slate-900/0" />
                                </div>
                            ) : (
                                <div className="h-52 bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                                    <p className="text-white text-center px-4 font-semibold">{tour.packageName || "Tour Image"}</p>
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-1">{tour.packageName || "Untitled Tour"}</h3>
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2 min-h-10">{tour.overview || "No overview available."}</p>

                                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                                    <MapPin size={14} className="text-cyan-700" />
                                    <span className="line-clamp-1">{tour.location || "N/A"}</span>
                                </div>

                                <p className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 text-sm font-bold mb-4">
${Number(tour.price || 0).toFixed(2)}
                                </p>

                                {Array.isArray(tour.TourItems) && tour.TourItems.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {tour.TourItems.slice(0, 3).map((item) => (
                                            <span key={item.id} className="px-2.5 py-1 text-xs rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100 font-medium">
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-1">
                                    <button 
                                    onClick={() => navigate(`/manager/tours/edit/${tour.id}`)}
                                    className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-sm border border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1">
                                        <Edit2 size={18} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTour(tour.id)}
                                        disabled={deletingId === tour.id}
                                        className="flex-1 h-10 bg-white hover:bg-rose-100 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-rose-700 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-sm border border-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1"
                                    >
                                        <Trash2 size={18} />
                                        {deletingId === tour.id ? "Deleting..." : "Delete"}
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
