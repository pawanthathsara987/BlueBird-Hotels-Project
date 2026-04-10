import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function TourView() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch tours from API
        const fetchTours = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch('/api/tours');
                if (response.ok) {
                    const data = await response.json();
                    setTours(data);
                }
            } catch (error) {
                console.error('Failed to fetch tours:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading tours...</div>;
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
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <p className="text-white text-center px-4">{tour.name || 'Tour Image'}</p>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{tour.description}</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
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
