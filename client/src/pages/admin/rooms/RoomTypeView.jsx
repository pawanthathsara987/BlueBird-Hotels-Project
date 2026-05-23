import axios from 'axios';
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const RoomTypeView = () => {
    const navigate = useNavigate();

    const [roomTypes, setRoomTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getRoomTypes();
    }, []);

    // Get all room types
    const getRoomTypes = async () => {
        try {
            setIsLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-types`
            );

            if (!response.data || !response.data.data) {
                setRoomTypes([]);
                return;
            }

            setRoomTypes(response.data.data);

        } catch (error) {
            console.error("Error fetching room types:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch room types";
            toast.error(errorMessage);
            setRoomTypes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Open delete popup
    const openDeletePopup = (type) => {
        setTypeToDelete(type);
        setShowDeletePopup(true);
    };

    // Close delete popup
    const closeDeletePopup = () => {
        if (isDeleting) return;
        setShowDeletePopup(false);
        setTypeToDelete(null);
    };

    // Confirm and delete room type
    const confirmDelete = async () => {
        if (!typeToDelete) return;

        try {
            setIsDeleting(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-type/${typeToDelete.id}`
            );

            toast.success(response.data.message || "Room type deleted successfully");
            setShowDeletePopup(false);
            setTypeToDelete(null);
            getRoomTypes();

        } catch (error) {
            console.error("Error deleting room type:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete room type";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
    

    return (
        <div className="mt-10 mx-5 rounded-lg">
            <div className='w-fit ml-auto flex'>
                <Link
                    to="/admin/rooms/packages/add"
                    className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                        text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md hover:bg-blue-500 
                        cursor-pointer transition-colors"
                >
                    <Plus />
                    <label className="cursor-pointer">Add Room Type</label>
                </Link>
            </div>
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={3} className="py-12 text-center">
                                <div className="flex justify-center items-center">
                                    <span className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                                </div>
                            </td>
                        </tr>
                    ) : roomTypes.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="py-12 text-center text-gray-500">
                                <p className="text-lg">No room types available. Click "Add Room Type" to create one.</p>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {roomTypes.map(rt => (
                                <tr key={rt.id} className="text-center hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2">{rt.id}</td>
                                    <td className="px-4 py-2">{rt.type}</td>
                                    <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                        <button
                                            onClick={() =>
                                                navigate("/admin/rooms/packages/edit", {
                                                    state: { selectedPackage: rt },
                                                })
                                            }
                                            className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform cursor-pointer"
                                            title="Edit room type"
                                        >
                                            <RiEditLine size={18} />
                                        </button>
                                        <button
                                            onClick={() => openDeletePopup(rt)}
                                            className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform cursor-pointer"
                                            title="Delete room type"
                                        >
                                            <RiDeleteBinLine size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </table>

            {/* ✅ SIMPLE DELETE CONFIRMATION POPUP */}
            {showDeletePopup && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
                        onClick={closeDeletePopup}
                    />
                    {/* Popup */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
                            {/* Message */}
                            <p className="text-lg font-semibold text-gray-800 mb-6">
                                Are you sure you want to delete <span className="text-red-600">"{typeToDelete?.type}"</span>?
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeletePopup}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold 
                                        hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold 
                                        hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default RoomTypeView;