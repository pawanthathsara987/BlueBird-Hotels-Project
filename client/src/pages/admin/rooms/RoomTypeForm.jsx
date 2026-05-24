import { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

function RoomTypeForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRoomType = location.state?.selectedPackage || null;

    const [typeName, setTypeName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(selectedRoomType?.id);

    const goBackToPackages = () => {
        navigate("/admin/rooms/roomManagement?tab=packages");
    };

    // Preload fields when editing
    useEffect(() => {
        if (isEditMode) {
            setTypeName(selectedRoomType.type || "");
            setImagePreview(selectedRoomType.image_url || "");
        } else {
            setTypeName("");
            setImagePreview("");
        }
    }, [isEditMode, selectedRoomType]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const saveRoomType = async () => {
        let saved = false;
        try {
            if (!typeName || !typeName.trim()) {
                toast.error("Please enter a room type");
                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            formData.append("type", typeName.trim());
            if (imageFile) {
                formData.append("image", imageFile);
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

            setTypeName("");
            setImageFile(null);
            setImagePreview("");

        } catch (error) {
            toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update room type" : "Failed to add room type"));
        } finally {
            setIsLoading(false);
            if (saved) goBackToPackages();
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-2xl mx-auto space-y-6">
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

                    <div className="p-8 space-y-6">
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
                            <label className="block text-sm font-bold text-slate-700">Room Type Image</label>
                            
                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                {/* Image Preview */}
                                <div className="relative w-full sm:w-44 h-32 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center group shadow-inner">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Room type preview"
                                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview("");
                                                    }}
                                                    className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform hover:scale-110 shadow cursor-pointer animate-scaleUp"
                                                    title="Remove Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-slate-400 block mt-2 uppercase tracking-wide">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Area */}
                                <div className="flex-1 w-full">
                                    <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 rounded-2xl p-6 text-center cursor-pointer transition group min-h-[128px]">
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            disabled={isLoading}
                                            className="hidden"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-xs font-bold text-slate-600 mt-2 block group-hover:text-blue-600 transition-colors">
                                            {imageFile ? "Change Image" : "Upload Room Image"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            PNG, JPG or JPEG (Max 5MB)
                                        </span>
                                    </label>
                                </div>
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