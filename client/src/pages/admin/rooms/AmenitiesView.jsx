import axios from "axios";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const AmenitiesView = () => {
    const navigate = useNavigate();

    useEffect(() => {
        getAmenities();
        getRoomTypes();
    }, []);

    const [isLoading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [roomTypeFilter, setRoomTypeFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [amenityToDelete, setAmenityToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getRoomTypes = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-types`);
            setRoomTypes(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching room types:", error);
        }
    };

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

    const filteredAmenities = useMemo(() => {
        return amenities.filter((amenity) => {
            const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesRoomType = true;
            if (roomTypeFilter !== "all" && roomTypeFilter !== "") {
                const assignedRoomTypes = amenity.RoomTypes || amenity.roomTypes || [];
                matchesRoomType = assignedRoomTypes.some((rt) => String(rt.id) === String(roomTypeFilter));
            }
            return matchesSearch && matchesRoomType;
        });
    }, [amenities, searchTerm, roomTypeFilter]);

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
        <div className="p-4 md:p-6 space-y-6">

            {/* Header / Actions section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div>
                    <h3 className="text-base font-bold text-slate-700">Available Guest Amenities</h3>
                    <p className="text-xs text-slate-400">Total of {amenities.length} active room amenities</p>
                </div>
                <Link
                    to="/admin/rooms/amenities/add"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Add Amenity</span>
                </Link>
            </div>

            {/* Search and Room Type Filter Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-3 flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-300">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="search"
                        placeholder="Search amenities by name..."
                        className="outline-none w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-full md:w-64">
                        <SlidersHorizontal size={16} className="text-slate-400" />
                        <select
                            value={roomTypeFilter}
                            onChange={(e) => setRoomTypeFilter(e.target.value)}
                            className="outline-none bg-transparent text-sm font-bold text-slate-600 pr-4 cursor-pointer w-full"
                        >
                            <option value="all">All Room Types</option>
                            {roomTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Amenities Table or Empty State */}
            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="flex justify-center items-center">
                        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                </div>
            ) : filteredAmenities.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                    <p className="text-slate-400 font-medium text-base">
                        {amenities.length === 0 
                            ? 'No Amenities available. Click "Add Amenity" to create one.' 
                            : 'No amenities match the search criteria or room type filter.'
                        }
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amenity Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAmenities.map((amenity) => (
                                <tr key={amenity.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                        #{amenity.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="font-semibold text-slate-800">{amenity.name}</span>
                                            {amenity.RoomTypes && amenity.RoomTypes.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {amenity.RoomTypes.map((rt) => (
                                                        <span key={rt.id} className="text-[10px] font-bold text-blue-500 bg-blue-50/50 px-2.5 py-0.5 rounded border border-blue-100/30 animate-fadeIn">
                                                            {rt.type}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">No assigned room types</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3.5">
                                            <button
                                                onClick={() =>
                                                    navigate("/admin/rooms/amenities/edit", {
                                                        state: { selectedAmenity: amenity },
                                                    })
                                                }
                                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                                                title="Edit amenity"
                                            >
                                                <RiEditLine size={18} />
                                            </button>
                                            <button
                                                onClick={() => openDeletePopup(amenity)}
                                                disabled={isDeleting}
                                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete amenity"
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
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
                        onClick={closeDeletePopup}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scaleUp">
                            <p className="text-lg font-bold text-slate-800 mb-6">
                                Are you sure you want to delete{" "}
                                <span className="text-rose-600">"{amenityToDelete?.name}"</span>?
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
                                    onClick={deleteAmenity}
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

export default AmenitiesView;