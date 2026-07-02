import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdClose, MdSave } from "react-icons/md";

export default function AddEditLeaveTypeModal({ isOpen, onClose, editingType, refreshData }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isPaid: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingType) {
                setFormData({
                    name: editingType.name,
                    description: editingType.description || "",
                    isPaid: editingType.isPaid
                });
            } else {
                setFormData({
                    name: "",
                    description: "",
                    isPaid: true
                });
            }
        }
    }, [isOpen, editingType]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let res;
            if (editingType) {
                res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/leave/types/${editingType.leaveTypeId}`, formData);
            } else {
                res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/leave/types`, formData);
            }

            if (res.data.success) {
                toast.success(`Leave Type ${editingType ? 'updated' : 'added'} successfully`);
                refreshData();
                onClose();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all m-4 border border-slate-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                >
                    <MdClose className="text-xl" />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-6">
                    {editingType ? "Edit Leave Type" : "Add Leave Type"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="e.g. Annual Leave"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                            placeholder="Brief description of this leave type"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="isPaid"
                            checked={formData.isPaid}
                            onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPaid" className="text-sm font-medium text-slate-700 cursor-pointer">
                            This is a Paid Leave
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-blue-500/20"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <MdSave className="text-lg" />
                                    <span>{editingType ? 'Save Changes' : 'Add Type'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
