import { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trash, Plus, Star } from "lucide-react";

function RoomTypeForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoomType = location.state?.selectedPackage || null;

    const [typeName, setTypeName] = useState("");
    const [images, setImages] = useState([]); // Array of existing public URLs from Supabase
    const [newFiles, setNewFiles] = useState([]); // Array of { file, preview, name }
    const [coverUrl, setCoverUrl] = useState(""); // URL of the existing cover image
    const [coverNewFileName, setCoverNewFileName] = useState(""); // name of the new cover file
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
                setCoverUrl(data.image_url || "");
                setImages(data.images || []);
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
            setImages([]);
            setCoverUrl("");
            setCoverNewFileName("");
            setNewFiles([]);
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

    // Handle multiple file selections
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            return true;
        });

        const newItems = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setNewFiles(prev => {
            const updated = [...prev, ...newItems];
            // Default first uploaded image as cover if there is no cover set
            if (!coverUrl && !coverNewFileName && updated.length > 0) {
                setCoverNewFileName(updated[0].name);
            }
            return updated;
        });
    };

    // Remove file from pending selection list
    const removePendingFile = (name) => {
        setNewFiles(prev => {
            const filtered = prev.filter(f => f.name !== name);
            if (coverNewFileName === name) {
                if (filtered.length > 0) {
                    setCoverNewFileName(filtered[0].name);
                } else if (images.length > 0) {
                    setCoverUrl(images[0]);
                    setCoverNewFileName("");
                } else {
                    setCoverNewFileName("");
                    setCoverUrl("");
                }
            }
            return filtered;
        });
    };

    // Delete existing gallery image
    const handleDeleteExistingImage = async (url) => {
        if (!window.confirm("Are you sure you want to delete this image from the gallery?")) return;
        try {
            setIsLoading(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/admin/room-type/${selectedRoomType.id}/image`,
                { data: { imageUrl: url } }
            );
            toast.success("Image deleted successfully");
            const data = response.data?.data;
            if (data) {
                setImages(data.images || []);
                setCoverUrl(data.image_url || "");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error(error.response?.data?.message || "Failed to delete image");
        } finally {
            setIsLoading(false);
        }
    };

    // Set an existing gallery image as the cover image
    const makeCoverExisting = (url) => {
        setCoverUrl(url);
        setCoverNewFileName("");
        toast.success("Designated as cover image");
    };

    // Set a newly selected file as the cover image
    const makeCoverPending = (name) => {
        setCoverNewFileName(name);
        setCoverUrl("");
        toast.success("Designated as cover image");
    };

    // Submit save/update
    const saveRoomType = async () => {
        let saved = false;
        try {
            if (!typeName || !typeName.trim()) {
                toast.error("Please enter a room type name");
                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            formData.append("type", typeName.trim());
            formData.append("occupancy_type_id", occupancyTypeId);

            // Append multiple files
            newFiles.forEach(item => {
                formData.append("images", item.file);
            });

            // Append cover image selectors
            if (coverUrl) {
                formData.append("cover_url", coverUrl);
            }
            if (coverNewFileName) {
                formData.append("coverImageName", coverNewFileName);
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
            setImages([]);
            setNewFiles([]);
            setCoverUrl("");
            setCoverNewFileName("");
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
                                <p className="text-xs text-slate-450 mt-1">Manage room type images. Designate one image as the main cover image by clicking "Set Cover".</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Render existing images */}
                                {images.map((url, index) => {
                                    const isCover = url === coverUrl;
                                    return (
                                        <div key={`existing-${index}`} className={`relative group aspect-video sm:aspect-square rounded-2xl overflow-hidden border bg-slate-50 shadow-sm transition-all duration-355 ${isCover ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <img src={url} alt="Room" className="w-full h-full object-cover" />
                                            
                                            {/* Action overlays */}
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExistingImage(url)}
                                                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-transform hover:scale-105 shadow cursor-pointer"
                                                        title="Delete Image"
                                                    >
                                                        <Trash size={15} />
                                                    </button>
                                                </div>
                                                
                                                <div>
                                                    {!isCover && (
                                                        <button
                                                            type="button"
                                                            onClick={() => makeCoverExisting(url)}
                                                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition uppercase tracking-wider cursor-pointer"
                                                        >
                                                            Set Cover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isCover && (
                                                <div className="absolute bottom-2 left-2 bg-blue-650 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-md">
                                                    <Star size={10} className="fill-white" />
                                                    <span>Cover</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Render newly selected images pending upload */}
                                {newFiles.map((item, index) => {
                                    const isCover = item.name === coverNewFileName;
                                    return (
                                        <div key={`pending-${index}`} className={`relative group aspect-video sm:aspect-square rounded-2xl overflow-hidden border bg-slate-50 shadow-sm transition-all duration-355 ${isCover ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <img src={item.preview} alt="Pending upload" className="w-full h-full object-cover opacity-80" />
                                            
                                            {/* Pending badge */}
                                            <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                                                Pending
                                            </div>

                                            {/* Action overlays */}
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removePendingFile(item.name)}
                                                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-transform hover:scale-105 shadow cursor-pointer"
                                                        title="Remove File"
                                                    >
                                                        <Trash size={15} />
                                                    </button>
                                                </div>
                                                
                                                <div>
                                                    {!isCover && (
                                                        <button
                                                            type="button"
                                                            onClick={() => makeCoverPending(item.name)}
                                                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition uppercase tracking-wider cursor-pointer"
                                                        >
                                                            Set Cover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isCover && (
                                                <div className="absolute bottom-2 left-2 bg-blue-650 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-md">
                                                    <Star size={10} className="fill-white" />
                                                    <span>Cover</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

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
                                    <Plus size={22} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[11px] font-bold text-slate-655 mt-2 block group-hover:text-blue-600 transition-colors">
                                        Upload Images
                                    </span>
                                    <span className="text-[9px] text-slate-400 mt-1 block">
                                        Select multiple files
                                    </span>
                                </label>
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