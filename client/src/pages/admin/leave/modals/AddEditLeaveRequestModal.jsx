import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdClose, MdSave } from "react-icons/md";
import { format, differenceInCalendarDays, isBefore } from "date-fns";

export default function AddEditLeaveRequestModal({ isOpen, onClose, editingRequest, refreshData }) {
    const [formData, setFormData] = useState({
        staffId: "",
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
        status: "Pending"
    });
    
    const [staffList, setStaffList] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Search and Autocomplete states
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch dependencies
    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen]);

    const fetchDependencies = async () => {
        setLoadingData(true);
        try {
            const [staffRes, typesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getAll`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/leave/types`)
            ]);
            
            if (staffRes.data) {
                setStaffList(staffRes.data || []);
            }
            if (typesRes.data.success) {
                setLeaveTypes(typesRes.data.data);
            }
        } catch (error) {
            console.error("Failed to load dependencies:", error);
            toast.error("Failed to load staff or leave types. Please try again.");
        } finally {
            setLoadingData(false);
        }
    };

    // Populate form data when editing
    useEffect(() => {
        if (isOpen) {
            if (editingRequest) {
                setFormData({
                    staffId: editingRequest.staffId,
                    leaveTypeId: editingRequest.leaveTypeId,
                    startDate: format(new Date(editingRequest.startDate), "yyyy-MM-dd"),
                    endDate: format(new Date(editingRequest.endDate), "yyyy-MM-dd"),
                    reason: editingRequest.reason || "",
                    status: editingRequest.status
                });
                if (editingRequest.staffMember) {
                    setSelectedStaff({
                        staffId: editingRequest.staffId,
                        name: editingRequest.staffMember.name
                    });
                }
            } else {
                setFormData({
                    staffId: "",
                    leaveTypeId: "",
                    startDate: "",
                    endDate: "",
                    reason: "",
                    status: "Pending"
                });
                setSelectedStaff(null);
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
    }, [isOpen, editingRequest]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (isBefore(end, start)) {
            return toast.error("End date cannot be before start date");
        }

        const totalDays = differenceInCalendarDays(end, start) + 1;

        const payload = {
            ...formData,
            totalDays
        };

        setIsSubmitting(true);
        try {
            let res;
            if (editingRequest) {
                res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/leave/requests/${editingRequest.leaveId}`, payload);
            } else {
                res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/leave/requests`, payload);
            }

            if (res.data.success) {
                toast.success(`Leave request ${editingRequest ? 'updated' : 'added'} successfully`);
                refreshData();
                onClose();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (query.trim().length >= 1) {
            const filtered = staffList.filter(
                (staff) =>
                    (staff.name && staff.name.toLowerCase().includes(query.toLowerCase())) ||
                    (staff.staffId && staff.staffId.toLowerCase().includes(query.toLowerCase()))
            );
            setSuggestions(filtered.slice(0, 10)); // Limit to top 10 suggestions
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectStaff = (staff) => {
        setSelectedStaff({
            staffId: staff.staffId,
            name: staff.name
        });
        setFormData({ ...formData, staffId: staff.staffId });
        setShowSuggestions(false);
        setSearchQuery("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all m-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                >
                    <MdClose className="text-xl" />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-6">
                    {editingRequest ? "Edit Leave Request" : "Add Leave Request"}
                </h2>

                {loadingData ? (
                    <div className="py-10 text-center">Loading form data...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Staff Member *
                            </label>
                            {selectedStaff ? (
                                <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-sm text-slate-800">{selectedStaff.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">ID: {selectedStaff.staffId}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedStaff(null);
                                            setFormData({ ...formData, staffId: "" });
                                            setSearchQuery("");
                                        }}
                                        className="text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Type staff name or ID to search..."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                                        required={!formData.staffId}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {suggestions.map((staff) => (
                                                <button
                                                    key={staff.staffId}
                                                    type="button"
                                                    onClick={() => handleSelectStaff(staff)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                                                >
                                                    <div className="font-semibold text-sm text-slate-800">{staff.name}</div>
                                                    <div className="text-xs text-slate-500">{staff.staffId}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showSuggestions && searchQuery.trim().length >= 1 && suggestions.length === 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500">
                                            No staff members found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Leave Type *
                            </label>
                            <select
                                required
                                value={formData.leaveTypeId}
                                onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            >
                                <option value="" disabled>Select a leave type</option>
                                {leaveTypes.map(type => (
                                    <option key={type.leaveTypeId} value={type.leaveTypeId}>
                                        {type.name} {type.isPaid ? '(Paid)' : '(Unpaid)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Reason
                            </label>
                            <textarea
                                rows="3"
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                                placeholder="Why is this leave being requested?"
                            ></textarea>
                        </div>

                        {editingRequest && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}

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
                                        <span>{editingRequest ? 'Save Changes' : 'Create Request'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
