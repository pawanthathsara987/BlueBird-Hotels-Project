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
        <div className="p-4 md:p-6 space-y-6">

            {/* Header / Actions section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div>
                    <h3 className="text-base font-bold text-slate-700">Configured Room Categories</h3>
                    <p className="text-xs text-slate-400">Total of {roomTypes.length} active room types</p>
                </div>
                <Link
                    to="/admin/rooms/packages/add"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Add Room Type</span>
                </Link>
            </div>

            {/* Table or Empty State */}
            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="flex justify-center items-center">
                        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                </div>
            ) : roomTypes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                    <p className="text-slate-400 font-medium text-base">No Room Types available. Click "Add Room Type" to create one.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {roomTypes.map(rt => (
                                <tr key={rt.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                        #{rt.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        <div className="flex items-center gap-3">
                                            {rt.image_url ? (
                                                <img
                                                    src={rt.image_url}
                                                    alt={rt.type}
                                                    className="w-12 h-10 object-cover rounded-xl border border-slate-100 shadow-sm transition duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-12 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className="font-semibold text-slate-800">{rt.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3.5">
                                            <button
                                                onClick={() =>
                                                    navigate("/admin/rooms/packages/edit", {
                                                        state: { selectedPackage: rt },
                                                    })
                                                }
                                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                title="Edit room type"
                                            >
                                                <RiEditLine size={18} />
                                            </button>
                                            <button
                                                onClick={() => openDeletePopup(rt)}
                                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                title="Delete room type"
                                            >
                                                <RiDeleteBinLine size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Popup */}
            {showDeletePopup && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
                        onClick={closeDeletePopup}
                    />
                    {/* Popup */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scaleUp">
                            <p className="text-lg font-bold text-slate-800 mb-6">
                                Are you sure you want to delete <span className="text-rose-600">"{typeToDelete?.type}"</span>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeletePopup}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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