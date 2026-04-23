import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, Check, Plus, Trash2, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function TourItemView({ selectionMode = false }) {
    const navigate = useNavigate();
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
    const [tourAssignments, setTourAssignments] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedItems = localStorage.getItem("selectedTourItems");
        if (!savedItems) return;

        try {
            const parsed = JSON.parse(savedItems);
            if (Array.isArray(parsed)) {
                setSelectedItems(parsed);
            }
        } catch (error) {
            console.error("Invalid selectedTourItems data:", error);
        }
    }, []);

    useEffect(() => {
        const fetchTourAssignments = async () => {
            try {
                const [itemsResponse, toursResponse] = await Promise.all([
                    axios.get(`${backendBaseUrl}/manager/tour-items`),
                    axios.get(`${backendBaseUrl}/manager/tours`)
                ]);
                
                const items = itemsResponse.data?.data || [];
                const tours = toursResponse.data?.data || [];
                
                // Build tour assignments
                const assignments = items.map(item => ({
                    ...item,
                    assignedTours: tours.filter(tour => 
                        tour.TourItems && tour.TourItems.some(t => t.id === item.id)
                    )
                }));
                
                setTourAssignments(assignments);
            } catch (error) {
                console.error("Failed to load tour assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTourAssignments();
    }, [backendBaseUrl]);

    const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

    const toggleSelection = (name) => {
        setSelectedItems((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this tour item?")) {
            return;
        }

        try {
            await axios.delete(`${backendBaseUrl}/manager/tour-items/${itemId}`);
            
            // Remove deleted item from list
            setTourAssignments(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Failed to delete tour item:", error);
            alert("Failed to delete tour item");
        }
    };

    const saveSelectedItems = () => {
        localStorage.setItem("selectedTourItems", JSON.stringify(selectedItems));
        navigate("/manager/tours/add");
    };

    const handleEdit = (itemId) => {
        navigate(`/manager/tours/item/edit/${itemId}`);
    };

    return (
        <div className="w-[90%] md:w-[85%] mx-auto mt-8 px-6 py-4 flex flex-col gap-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
                <h2 className="text-2xl font-bold">
                    {selectionMode ? "Select Tour Items" : "Tour Assignments"}
                </h2>

                {selectionMode ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/manager/tours/add")}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={saveSelectedItems}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            <Check size={18} />
                            Use Selected ({selectedCount})
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/manager/tours/item/add"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Tour Item
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="p-4 text-sm text-slate-500">Loading tour assignments...</div>
            ) : tourAssignments.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-slate-300 text-slate-500">
                    No tour items found. Add a new tour item first.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {tourAssignments.map((assignment) => {
                        const isSelected = selectedItems.includes(assignment.name);
                        const tourCount = assignment.assignedTours?.length || 0;

                        // If no tours assigned, show single row
                        if (tourCount === 0) {
                            return (
                                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{assignment.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">No tours assigned</p>
                                        </div>

                                        {selectionMode ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleSelection(assignment.name)}
                                                className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                                                    isSelected
                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                {isSelected ? "✓ Selected" : "Select"}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(assignment.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(assignment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // If tours assigned, show each tour item-tour pair
                        return assignment.assignedTours.map((tour) => (
                            <div key={`${assignment.id}-${tour.id}`} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Tour Item */}
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Tour Item</p>
                                                <p className="font-semibold text-gray-800">{assignment.name}</p>
                                            </div>
                                            {/* Tour */}
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Tour Package</p>
                                                <p className="font-semibold text-gray-800">{tour.packageName}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Price:</span> LKR {tour.price}
                                                    {tour.discount && ` | Discount: ${tour.discount}%`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                        {!selectionMode && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(assignment.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(assignment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        ));
                    })}
                </div>
            )}
        </div>
    );
}