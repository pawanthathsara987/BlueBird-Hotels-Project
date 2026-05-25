import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

const AddEditItemModal = ({ isOpen, onClose, onSubmit, modalMode, initialData, isSaving = false }) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState(true);

    // Sync state when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (modalMode === "edit" && initialData) {
                setName(initialData.item_name || "");
                setPrice(initialData.price !== undefined ? initialData.price.toString() : "");
                setStatus(initialData.status !== undefined ? initialData.status : true);
            } else {
                setName("");
                setPrice("");
                setStatus(true);
            }
        }
    }, [isOpen, modalMode, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Item name is required");
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            toast.error("Please enter a valid non-negative price");
            return;
        }

        onSubmit({
            item_name: name,
            price: parsedPrice,
            status: status
        });
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            />
            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-100 animate-scaleUp">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <h4 className="text-lg font-bold text-slate-800">
                            {modalMode === "add" ? "Add Extra Charge Item" : "Edit Item Details"}
                        </h4>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Item Name Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Item Name / Description
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Airport Pickup Surcharge, Extra Bed, Lunch Buffet"
                                required
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium placeholder-slate-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Price Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Price (USD)
                            </label>
                            <div className="relative flex items-center bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-300">
                                <DollarSign size={16} className="text-slate-400 shrink-0 mr-1.5" />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-transparent outline-none text-sm text-slate-700 font-semibold placeholder-slate-400"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Switch */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <span className="block text-sm font-bold text-slate-700">Active Status</span>
                                <span className="text-[10px] text-slate-400">Inactive items won't be applied to bookings.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStatus(!status)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                                    status ? "bg-blue-600" : "bg-slate-300"
                                }`}
                            >
                                <span 
                                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${
                                        status ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Details"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

AddEditItemModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    modalMode: PropTypes.oneOf(["add", "edit"]).isRequired,
    initialData: PropTypes.object,
    isSaving: PropTypes.bool,
};

export default AddEditItemModal;
