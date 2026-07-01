import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddEditLeaveTypeModal from "../modals/AddEditLeaveTypeModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";

export default function LeaveTypesTab() {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/leave/types`);
            if (res.data.success) {
                setLeaveTypes(res.data.data);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch leave types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const handleAdd = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (type) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!typeToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/leave/types/${typeToDelete.leaveTypeId}`);
            if (res.data.success) {
                toast.success("Leave Type deleted successfully");
                fetchLeaveTypes();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete leave type");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setTypeToDelete(null);
        }
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-end">
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-500/30"
                >
                    <MdAdd className="text-xl" />
                    <span>Add Leave Type</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold hidden md:table-cell">Description</th>
                                <th className="p-4 font-semibold text-center">Type</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No leave types configured.
                                    </td>
                                </tr>
                            ) : (
                                leaveTypes.map((type) => (
                                    <tr key={type.leaveTypeId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{type.name}</div>
                                        </td>
                                        <td className="p-4 text-slate-500 hidden md:table-cell text-sm">
                                            {type.description || "-"}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                type.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {type.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(type)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <MdEdit className="text-lg" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(type)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <MdDelete className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <AddEditLeaveTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingType={editingType}
                refreshData={fetchLeaveTypes}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Leave Type"
                message={`Are you sure you want to delete "${typeToDelete?.name}"?`}
                isLoading={isDeleting}
            />
        </div>
    );
}
