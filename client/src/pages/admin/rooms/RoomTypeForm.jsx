import { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trash, Plus, Star, X, ArrowLeft, ArrowRight, Upload } from "lucide-react";

function RoomTypeForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoomType = location.state?.selectedPackage || null;

    const [typeName, setTypeName] = useState("");
    const [roomImages, setRoomImages] = useState([]); // Array of { type: "existing"|"new", url, file }
    const [isLoading, setIsLoading] = useState(false);
    const [occupancyTypeId, setOccupancyTypeId] = useState("");
    const [occupancyTypes, setOccupancyTypes] = useState([]);
    const isEditMode = Boolean(selectedRoomType?.id);

    const goBackToPackages = () => {
        navigate("/admin/rooms/roomManagement?tab=packages");
    };

    // Fetch single room type details when in Edit Mode
    const fetchRoomTypeDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-type/${selectedRoomType.id}`);
            const data = response.data?.data;
            if (data) {
                setTypeName(data.type || "");
                setOccupancyTypeId(String(data.occupancy_type_id ?? data.occupancyType?.id ?? ""));
                
                // Keep unique image URLs, placing the cover image at index 0
                const allUrls = [...new Set([data.image_url, ...(data.images || [])])].filter(Boolean);
                const existingImages = allUrls.map((url) => ({
                    type: "existing",
                    url,
                }));
                setRoomImages(existingImages);
            }
        } catch (error) {
            console.error("Error fetching room type details:", error);
            toast.error("Failed to load room type details");
        } finally {
            setIsLoading(false);
        }
    };

    // Preload fields and fetch details
    useEffect(() => {
        if (isEditMode) {
            fetchRoomTypeDetails();
        } else {
            setTypeName("");
            setRoomImages([]);
            setOccupancyTypeId("");
        }
    }, [isEditMode, selectedRoomType]);

    // Fetch occupancy types on mount
    useEffect(() => {
        async function fetchOccupancyTypes() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/occupancy-types`);
                setOccupancyTypes(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching occupancy types:", error);
                toast.error("Failed to load occupancy types");
            }
        }
        fetchOccupancyTypes();
    }, []);

    // Handle multiple file selections with size validation
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Check file size (5MB limit)
        const MAX_SIZE = 5 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
        if (oversizedFiles.length > 0) {
            toast.error(`File too large: "${oversizedFiles[0].name}" exceeds the 5MB limit.`);
            return;
        }

        const newImages = files.map((file) => ({
            type: "new",
            url: URL.createObjectURL(file),
            file,
        }));

        setRoomImages((prev) => [...prev, ...newImages]);

        // Reset input
        e.target.value = "";
    };

    // Handle image removal locally (deferred server deletion)
    const handleRemoveImage = (index) => {
        setRoomImages((prev) => {
            const target = prev[index];
            if (target.type === "new" && target.url) {
                URL.revokeObjectURL(target.url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    // Move image in array (reorder)
    const handleMoveImage = (index, direction) => {
        if (direction === "left" && index === 0) return;
        if (direction === "right" && index === roomImages.length - 1) return;

        const newIndex = direction === "left" ? index - 1 : index + 1;
        setRoomImages((prev) => {
            const updated = [...prev];
            const temp = updated[index];
            updated[index] = updated[newIndex];
            updated[newIndex] = temp;
            return updated;
        });
    };

    // Submit save/update
    const saveRoomType = async () => {
        let saved = false;
        try {
            if (!typeName || !typeName.trim()) {
                toast.error("Please enter a room type name");
                return;
            }

            if (!occupancyTypeId) {
                toast.error("Please select an occupancy type");
                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            formData.append("type", typeName.trim());
            formData.append("occupancy_type_id", occupancyTypeId);

            if (isEditMode) {
                const keptExistingImages = roomImages
                    .filter((img) => img.type === "existing")
                    .map((img) => img.url);

                formData.append("existingImages", JSON.stringify(keptExistingImages));

                roomImages
                    .filter((img) => img.type === "new")
                    .forEach((img) => {
                        formData.append("images", img.file);
                    });

                // Determine cover image (first image in the array)
                if (roomImages.length > 0) {
                    const firstImg = roomImages[0];
                    if (firstImg.type === "existing") {
                        formData.append("cover_url", firstImg.url);
                    } else {
                        formData.append("coverImageName", firstImg.file.name);
                    }
                }
            } else {
                roomImages.forEach((img) => {
                    if (img.file) {
                        formData.append("images", img.file);
                    }
                });

                if (roomImages.length > 0) {
                    const firstImg = roomImages[0];
                    if (firstImg.file) {
                        formData.append("coverImageName", firstImg.file.name);
                    }
                }
            }

            const endpoint = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/admin/room-type/${selectedRoomType.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/admin/room-type`;

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            const response = isEditMode
                ? await axios.put(endpoint, formData, config)
                : await axios.post(endpoint, formData, config);

            saved = true;
            toast.success(response?.data?.message || (isEditMode ? "Room type updated" : "Room type added"));

            // Reset states
            setTypeName("");
            setRoomImages([]);
            setOccupancyTypeId("");

        } catch (error) {
            toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update room type" : "Failed to add room type"));
        } finally {
            setIsLoading(false);
            if (saved) goBackToPackages();
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    to="/admin/rooms/roomManagement?tab=packages"
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors inline-block"
                >
                    ← Back to Room Management
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-400/20">
                            Category Settings
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-3">
                            {isEditMode ? "Update Room Type" : "New Room Type"}
                        </h2>
                        <p className="text-slate-300 text-xs mt-1">
                            {isEditMode
                                ? "Modify the properties and details of this category"
                                : "Define a new category and configuration for hotel rooms"}
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Room Type Name</label>
                                <input
                                    type="text"
                                    value={typeName}
                                    onChange={(e) => setTypeName(e.target.value)}
                                    placeholder="Enter room type name (e.g. Deluxe, Standard, Suite)"
                                    disabled={isLoading}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 placeholder-slate-400 font-medium transition disabled:opacity-50"
                                />
                                <p className="text-[11px] text-slate-400">Please provide a unique, descriptive name for the room category.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Occupancy Type</label>
                                <select
                                    value={occupancyTypeId}
                                    onChange={(e) => setOccupancyTypeId(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600 font-semibold transition disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="">Select Occupancy Type</option>
                                    {occupancyTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type} {type.capacity ? `(${type.capacity} guests)` : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400">Select the occupancy configuration associated with this room type.</p>
                            </div>
                        </div>
                        {/* Room Gallery Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Room Gallery & Images</label>
                                <p className="text-xs text-slate-400 mt-1">Manage room type images. Use the left/right arrows to reorder. The first image will be the primary cover image.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Add New Images box */}
                                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 rounded-2xl aspect-video sm:aspect-square text-center cursor-pointer transition group p-4">
                                    <input
                                        type="file"
                                        onChange={handleFilesChange}
                                        accept="image/*"
                                        multiple
                                        disabled={isLoading}
                                        className="hidden"
                                    />
                                    <Upload size={22} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[11px] font-bold text-slate-600 mt-2 block group-hover:text-blue-600 transition-colors">
                                        Upload Images
                                    </span>
                                    <span className="text-[9px] text-slate-400 mt-1 block">
                                        Select multiple files
                                    </span>
                                </label>

                                {/* Render images previews */}
                                {roomImages.map((image, index) => {
                                    const isCover = index === 0;
                                    return (
                                        <div key={`${image.type}-${index}`} className={`relative group aspect-video sm:aspect-square rounded-2xl overflow-hidden border bg-slate-50 shadow-sm transition-all duration-300 ${isCover ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <img src={image.url} alt="Room preview" className="w-full h-full object-cover" />
                                            
                                            {/* Pending/New badge */}
                                            {image.type === "new" && (
                                                <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                                                    Pending
                                                </div>
                                            )}

                                            {/* Action overlays */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-transform hover:scale-105 shadow cursor-pointer"
                                                        title="Remove Image"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                
                                                {/* Reordering and index position */}
                                                <div className="flex items-center justify-between w-full mt-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveImage(index, "left")}
                                                        disabled={index === 0}
                                                        className="p-1 bg-slate-800 text-slate-300 rounded-md hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition cursor-pointer"
                                                    >
                                                        <ArrowLeft className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-[10px] font-bold bg-slate-905 text-slate-200 px-2 py-0.5 rounded">
                                                        {index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveImage(index, "right")}
                                                        disabled={index === roomImages.length - 1}
                                                        className="p-1 bg-slate-800 text-slate-300 rounded-md hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition cursor-pointer"
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {isCover && (
                                                <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-md">
                                                    <Star size={10} className="fill-white" />
                                                    <span>Cover</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link
                                to="/admin/rooms/roomManagement?tab=packages"
                                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm rounded-xl transition duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={saveRoomType}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        {isEditMode ? "Updating..." : "Adding..."}
                                    </>
                                ) : (
                                    isEditMode ? "Update Room Type" : "Add Room Type"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomTypeForm;