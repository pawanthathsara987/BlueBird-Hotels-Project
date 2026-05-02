import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TourForm from "./TourForm";
import toast from "react-hot-toast";

export default function TourEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tourData, setTourData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

    useEffect(() => {
        const fetchTour = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${backendBaseUrl}/manager/tours/${id}`);
                const result = await response.json();
                
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch tour");
                }
                
                setTourData(result.data);
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTour();
        }
    }, [id, backendBaseUrl]);

    const handleSave = async (payload) => {
        try {
            const formData = new FormData();
            formData.append("packageName", payload.packageName);
            formData.append("overview", payload.overview);
            formData.append("duration", payload.duration || "");
            formData.append("price", String(payload.price));
            formData.append("discount", String(payload.discount || 0));
            formData.append("termsConditions", payload.termsConditions);
            formData.append("location", payload.location);
            formData.append("itinerary", JSON.stringify(payload.itinerary));
            formData.append("includedItems", JSON.stringify(payload.includedItems));
            if (payload.groupSize) {
                formData.append("groupSize", String(payload.groupSize));
            }
            formData.append("status", payload.status || "active");
            if (payload.imageFile) {
                formData.append("image", payload.imageFile);
            }

            const response = await fetch(`${backendBaseUrl}/manager/tours/${id}`, {
                method: "PUT",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to update tour");
            }

            toast.success("Tour updated successfully!");
            navigate("/manager/tours/tourManagement");
        } catch (error) {
            toast.error(error.message || "Failed to update tour");
        }
    };

    const handleCancel = () => {
        navigate("/manager/tours/tourManagement");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading tour details...</p>
                </div>
            </div>
        );
    }

    if (error || !tourData) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Tour not found"}</p>
                    <button
                        onClick={() => navigate("/manager/tours/tourManagement")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Back to Tours
                    </button>
                </div>
            </div>
        );
    }

    // Transform backend data to match TourForm's expected format
    const formattedData = {
        ...tourData,
        includedItems: Array.isArray(tourData.TourItems) 
            ? tourData.TourItems.map(item => item.name || item.id)
            : [],
    };

    return (
        <TourForm
            onSave={handleSave}
            onCancel={handleCancel}
            isEdit={true}
            initialData={formattedData}
        />
    );
}