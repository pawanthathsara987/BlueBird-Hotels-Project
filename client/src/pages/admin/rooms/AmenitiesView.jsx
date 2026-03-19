import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const AmenitiesView = () => {
    const navigate = useNavigate();

    useEffect(() => {
        getAmenities();
    }, []);

    const [isLoading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [amenityToDelete, setAmenityToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const getAmenities = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/amenities`);
            
            if (!response.data || !response.data.data) {
                setAmenities([]);
                return;
            }

            if (response.data.count === 0) {
                setAmenities([]);
                return;
            }


            setAmenities(response.data.data);

        } catch (error) {
            console.error("Error fetching amenities:", error);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                "Failed to fetch amenities";
            toast.error(errorMessage);
            setAmenities([]);
        } finally {
            setLoading(false);
        }
    }

    const openDeletePopup = (amenity) => {
        setAmenityToDelete(amenity);
        setShowDeletePopup(true);
    };

    const closeDeletePopup = () => {
        if (isDeleting) return;
        setShowDeletePopup(false);
        setAmenityToDelete(null);
    };

    const deleteAmenity = async () => {
        if (!amenityToDelete?.id) return;

        try {
            setIsDeleting(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/admin/amenitie/${amenityToDelete.id}`
            );

            toast.success(response?.data?.message || "Amenity deleted successfully");
            setShowDeletePopup(false);
            setAmenityToDelete(null);
            getAmenities();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete amenity";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-10 mx-5 rounded-lg">

            {/* Add Button */}
            <Link
                to="/admin/rooms/amenities/add"
                className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                    text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md cursor-pointer hover:bg-blue-500"
            >
                <Plus />
                <label className="cursor-pointer">Add Amenity</label>
            </Link>

            {/* Amenities Table */}
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Icon</th>
                        <th className="px-4 py-2">Assigned Rooms</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center">
                                <div className="flex justify-center items-center">
                                    <span className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                                </div>
                            </td>
                        </tr>
                    ) : amenities.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                <p className="text-lg">No Amenities available. Click "Add Amenities" to create one.</p>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {amenities.map((amenity) => (
                                <tr key={amenity.id} className="text-center border-t">
                                    <td className="px-4 py-2 font-medium">{amenity.name}</td>
                                    <td className="px-4 py-2 font-medium">{amenity.icon}</td>
                                    <td className="px-4 py-2">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            {amenity.assignedRooms || 0} Rooms
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                        <button
                                            onClick={() =>
                                                navigate("/admin/rooms/amenities/edit", {
                                                    state: { selectedAmenity: amenity },
                                                })
                                            }
                                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                            title="Edit amenity"
                                        >
                                            <RiEditLine />
                                        </button>
                                        <button
                                            onClick={() => openDeletePopup(amenity)}
                                            disabled={isDeleting}
                                            className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete amenity"
                                        >
                                            <RiDeleteBinLine />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </table>

            {showDeletePopup && (
                <>
                    <div
                        className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
                        onClick={closeDeletePopup}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                            <p className="text-lg font-semibold text-gray-800 mb-6">
                                Are you sure you want to delete{" "}
                                <span className="text-red-600">"{amenityToDelete?.name}"</span>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeletePopup}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteAmenity}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AmenitiesView;