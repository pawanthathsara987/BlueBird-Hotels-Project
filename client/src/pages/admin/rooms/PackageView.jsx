import axios from 'axios';
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const PackageView = () => {
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getPackages();
    }, []);

    // Get all packages
    const getPackages = async () => {
        try {
            setIsLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/packages`
            );

            // Check if response has data
            if (!response.data || !response.data.data) {
                setPackages([]);
                return;
            }

            // Check if packages array is empty
            if (response.data.count === 0) {
                setPackages([]);
                return;
            }

            // Set packages successfully
            setPackages(response.data.data);

        } catch (error) {
            console.error("Error fetching packages:", error);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                "Failed to fetch packages";
            toast.error(errorMessage);
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Open delete popup
    const openDeletePopup = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeletePopup(true);
    };

    // Close delete popup
    const closeDeletePopup = () => {
        if (isDeleting) return;
        setShowDeletePopup(false);
        setPackageToDelete(null);
    };

    // Confirm and delete package
    const confirmDelete = async () => {
        if (!packageToDelete) return;

        try {
            setIsDeleting(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/admin/package/${packageToDelete.id}`
            );

            toast.success(response.data.message || "Package deleted successfully");
            setShowDeletePopup(false);
            setPackageToDelete(null);
            getPackages();

        } catch (error) {
            console.error("Error deleting package:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete package";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
    

    return (
        <div className="mt-10 mx-5 rounded-lg">
            <div className='w-fit ml-auto flex'>
                <Link
                    to="/admin/rooms/packages/image/add"
                    className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                        text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md hover:bg-blue-500 
                        cursor-pointer transition-colors"
                >
                    <Plus />
                    <label className="cursor-pointer">Add Image</label>
                </Link>
                <Link
                    to="/admin/rooms/packages/add"
                    className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                        text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md hover:bg-blue-500 
                        cursor-pointer transition-colors"
                >
                    <Plus />
                    <label className="cursor-pointer">Add Package</label>
                </Link>
            </div>
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2">Package Name</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Adults</th>
                        <th className="px-4 py-2">Kids</th>
                        <th className="px-4 py-2">Description</th>
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
                    ) : packages.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                <p className="text-lg">No packages available. Click "Add Package" to create one.</p>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {packages.map(pkg => (
                                <tr key={pkg.id} className="text-center hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        {pkg.pimage && <img src={pkg.pimage} alt={pkg.pname} className="w-10 h-10 rounded object-cover" />}
                                        {pkg.pname}
                                    </td>
                                    <td className="px-4 py-2 font-semibold text-green-600">${pkg.pprice}</td>
                                    <td className="px-4 py-2">{pkg.maxAdults}</td>
                                    <td className="px-4 py-2">{pkg.maxKids}</td>
                                    <td className="px-4 py-2">{pkg.description}</td>
                                    <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                        {/* ✅ Edit button */}
                                        <button
                                            onClick={() =>
                                                navigate("/admin/rooms/packages/edit", {
                                                    state: { selectedPackage: pkg },
                                                })
                                            }
                                            className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform cursor-pointer"
                                            title="Edit package"
                                        >
                                            <RiEditLine size={18} />
                                        </button>
                                        {/* ✅ Delete button */}
                                        <button
                                            onClick={() => openDeletePopup(pkg)}
                                            className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform cursor-pointer"
                                            title="Delete package"
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
                                Are you sure you want to delete <span className="text-red-600">"{packageToDelete?.pname}"</span>?
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

export default PackageView;