import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdAdd, MdEdit, MdDelete, MdCheckCircle, MdCancel, MdPendingActions } from "react-icons/md";
import AddEditLeaveRequestModal from "../modals/AddEditLeaveRequestModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";

export default function LeaveRequestsTab() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [filterStatus, setFilterStatus] = useState("All");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const url = filterStatus === "All" 
                ? `${import.meta.env.VITE_BACKEND_URL}/leave/requests`
                : `${import.meta.env.VITE_BACKEND_URL}/leave/requests?status=${filterStatus}`;
            
            const res = await axios.get(url);
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    const handleAdd = () => {
        setEditingRequest(null);
        setIsModalOpen(true);
    };

    const handleEdit = (request) => {
        setEditingRequest(request);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (request) => {
        setRequestToDelete(request);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/leave/requests/${requestToDelete.leaveId}`);
            if (res.data.success) {
                toast.success("Leave Request deleted successfully");
                fetchRequests();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete leave request");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
        }
    };

    const handleStatusChange = async (leaveId, newStatus) => {
        try {
            let adminId = null;

            // Try decoding the token
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded && decoded.staffId) {
                        adminId = decoded.staffId;
                    }
                } catch (e) {
                    console.error("Failed to decode token:", e);
                }
            }

            // Fallback: If token didn't contain staffId or was missing, look up by adminEmail
            if (!adminId) {
                const adminEmail = localStorage.getItem("adminEmail");
                if (adminEmail) {
                    const staffRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getAll`);
                    if (staffRes.data) {
                        const loggedInAdmin = staffRes.data.find(s => s.email === adminEmail);
                        if (loggedInAdmin) {
                            adminId = loggedInAdmin.staffId;
                        }
                    }
                }
            }

            if (!adminId) {
                throw new Error("Unable to determine logged-in administrator's Staff ID. Please login again.");
            }

            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/leave/requests/${leaveId}/status`, {
                status: newStatus,
                approvedBy: adminId
            });
            if (res.data.success) {
                toast.success(`Leave request ${newStatus.toLowerCase()} successfully`);
                fetchRequests();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || `Failed to ${newStatus.toLowerCase()} request`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Approved":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><MdCheckCircle /> Approved</span>;
            case "Rejected":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700"><MdCancel /> Rejected</span>;
            case "Cancelled":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><MdCancel /> Cancelled</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><MdPendingActions /> Pending</span>;
        }
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Filter Status:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                    >
                        <option value="All">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-500/30 w-full sm:w-auto justify-center"
                >
                    <MdAdd className="text-xl" />
                    <span>Add Leave Request</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm">
                                <th className="p-4 font-semibold">Staff Member</th>
                                <th className="p-4 font-semibold">Leave Type</th>
                                <th className="p-4 font-semibold">Duration</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.leaveId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{req.staffMember?.name || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{req.staffId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-700">{req.leaveType?.name || "Deleted Type"}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{req.reason}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="font-medium">
                                                {format(new Date(req.startDate), "MMM d, yyyy")} - {format(new Date(req.endDate), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-xs text-slate-500">{req.totalDays} day(s)</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(req.status)}
                                            {req.approvedBy && (
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    by {req.approver?.name || req.approvedBy}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 items-center">
                                                {req.status === "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(req.leaveId, "Approved")}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <MdCheckCircle className="text-lg" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(req.leaveId, "Rejected")}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <MdCancel className="text-lg" />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                
                                                <button
                                                    onClick={() => handleEdit(req)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <MdEdit className="text-lg" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(req)}
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

            <AddEditLeaveRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingRequest={editingRequest}
                refreshData={fetchRequests}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Leave Request"
                message="Are you sure you want to delete this leave request? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    );
}
