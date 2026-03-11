import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";

function PackageForm({ closeOpenModal, onPackageAdded, selectedPackage }) {
    const [pname, setPname] = useState("");
    const [pprice, setPprice] = useState("");
    const [pimage, setPimage] = useState(null);
    const [maxAdults, setMaxAdults] = useState(2);
    const [maxKids, setMaxKids] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const isEditMode = Boolean(selectedPackage?.id);

    // Preload fields when editing
    useEffect(() => {
        if (isEditMode) {
            setPname(selectedPackage.pname || "");
            setPprice(selectedPackage.pprice || "");
            setMaxAdults(selectedPackage.maxAdults ?? 2);
            setMaxKids(selectedPackage.maxKids ?? 0);
            setPimage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            setPname("");
            setPprice("");
            setPimage(null);
            setMaxAdults(2);
            setMaxKids(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isEditMode, selectedPackage]);

    const savePackage = async () => {
        let packageSaved = false;
        try {
            if (!pname || !pprice || (!isEditMode && !pimage)) {
                toast.error("Please fill all fields");
                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            formData.append("pname", pname.trim());
            formData.append("pprice", pprice);
            formData.append("maxAdults", maxAdults);
            formData.append("maxKids", maxKids);
            if (pimage) formData.append("pimage", pimage);

            const endpoint = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/admin/package/${selectedPackage.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/admin/package`;

            const response = isEditMode
                ? await axios.put(endpoint, formData)
                : await axios.post(endpoint, formData);

            packageSaved = true;
            toast.success(response?.data?.message || (isEditMode ? "Package updated successfully" : "Package added successfully"));

            setPname("");
            setPprice("");
            setPimage(null);
            setMaxAdults(2);
            setMaxKids(0);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update package" : "Failed to add package"));
        } finally {
            setIsLoading(false);
            if (packageSaved) {
                onPackageAdded?.();
                closeOpenModal?.();
            }
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-transparent bg-opacity-40 z-40"
                onClick={closeOpenModal}
            />
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto border">
                    <button
                        onClick={closeOpenModal}
                        disabled={isLoading}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold disabled:opacity-50"
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-bold text-center mb-6">{isEditMode ? "Update Package" : "Add New Package"}</h2>

                    {/* Package Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Package Name</label>
                        <input
                            type="text"
                            value={pname}
                            onChange={(e) => setPname(e.target.value)}
                            placeholder="Enter package name"
                            disabled={isLoading}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={pprice}
                                onChange={(e) => setPprice(e.target.value)}
                                placeholder="Enter price"
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Image File */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Package Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setPimage(e.target.files[0])}
                            disabled={isLoading}
                            className="hidden"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Uploading..." : "Choose File"}
                            </button>
                            <span className="text-sm text-gray-600">
                                {pimage ? pimage.name : isEditMode ? "Keep current image" : "No file chosen"}
                            </span>
                        </div>
                    </div>

                    {/* Max Adults/Kids */}
                    <div className="flex gap-4 mb-5">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Max Adults</label>
                            <input
                                type="number"
                                value={maxAdults}
                                min={0}
                                onChange={(e) => setMaxAdults(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Max Kids</label>
                            <input
                                type="number"
                                value={maxKids}
                                min={0}
                                onChange={(e) => setMaxKids(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={closeOpenModal}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={savePackage}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {isEditMode ? "Updating..." : "Adding..."}
                                </>
                            ) : (
                                isEditMode ? "Update Package" : "Add Package"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PackageForm;