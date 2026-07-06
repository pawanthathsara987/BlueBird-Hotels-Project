import { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaUser, FaHistory, FaCheckCircle, FaExchangeAlt } from "react-icons/fa";
import { getAttendanceById, updateAttendance } from "../../../utils/attendanceService";
import Loader from "../../../components/Loader";
import toast from "react-hot-toast";

export default function EditAttendanceModal({ isOpen, onClose, attendanceId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [record, setRecord] = useState(null);

    // Form inputs
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [reason, setReason] = useState("");

    // Fetch full record details including edit logs
    useEffect(() => {
        if (isOpen && attendanceId) {
            loadAttendanceDetails();
        }
    }, [isOpen, attendanceId]);

    const loadAttendanceDetails = async () => {
        try {
            setLoading(true);
            const response = await getAttendanceById(attendanceId);
            if (response.data?.success) {
                const data = response.data.data;
                setRecord(data);
                setCheckInTime(formatDateTimeLocal(data.checkInTime));
                setCheckOutTime(formatDateTimeLocal(data.checkOutTime));
                setReason(""); // Reset reason on record load
            }
        } catch (error) {
            console.error("Error loading attendance details:", error);
            toast.error("Failed to load attendance record details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    // Helper to format ISO to YYYY-MM-DDTHH:MM for datetime-local input
    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDisplayDateTime = (dateString) => {
        if (!dateString) return "Not Recorded";
        const date = new Date(dateString);
        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast.error("Reason for edit is required.");
            return;
        }

        if (!checkInTime && !checkOutTime) {
            toast.error("Check-In and Check-Out times cannot both be empty.");
            return;
        }

        if (checkInTime && checkOutTime) {
            const inTime = new Date(checkInTime);
            const outTime = new Date(checkOutTime);
            if (outTime <= inTime) {
                toast.error("Check-out time must be after check-in time.");
                return;
            }
        }

        try {
            setSaving(true);
            const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("adminName") || "Admin";
            
            const payload = {
                checkInTime: checkInTime ? new Date(checkInTime).toISOString() : null,
                checkOutTime: checkOutTime ? new Date(checkOutTime).toISOString() : null,
                reason: reason.trim(),
                editedBy: adminEmail
            };

            const response = await updateAttendance(attendanceId, payload);
            if (response.data?.success) {
                toast.success("Attendance updated and recalculated successfully.");
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error saving attendance correction:", error);
            toast.error(error.response?.data?.message || "Failed to update attendance");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FaHistory className="text-blue-600 text-lg" /> Correct Attendance Log
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center items-center">
                        <Loader />
                    </div>
                ) : (
                    record && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Staff Member Info Summary Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        <FaUser className="text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Staff Member</p>
                                        <p className="font-semibold text-slate-800">{record.StaffMember?.name || "Unknown Staff"}</p>
                                        <p className="text-xs text-slate-500">ID: {record.staffId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        <FaCalendarAlt className="text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attendance Date</p>
                                        <p className="font-semibold text-slate-800">{record.attendanceDate}</p>
                                        <p className="text-xs text-slate-500">Log ID: {record.attendanceId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Correction Form */}
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Check-In Time</label>
                                        <input
                                            type="datetime-local"
                                            value={checkInTime}
                                            onChange={(e) => setCheckInTime(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Check-Out Time</label>
                                        <input
                                            type="datetime-local"
                                            value={checkOutTime}
                                            onChange={(e) => setCheckOutTime(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Reason for Correction <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder="Explain why this manual edit is being made (e.g. employee forgot to scan)..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 text-sm transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                    >
                                        {saving ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>

                            {/* Audit Timeline Section */}
                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                                    <FaHistory className="text-slate-400 text-xs" /> Edit Audit History ({record.editLogs?.length || 0})
                                </h3>

                                {record.editLogs?.length > 0 ? (
                                    <div className="relative border-l border-slate-100 ml-3 pl-6 space-y-5 py-2">
                                        {record.editLogs.map((log) => (
                                            <div key={log.editLogId} className="relative text-xs text-slate-600">
                                                {/* Bullet dot */}
                                                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                                    <p className="font-bold text-slate-700">Edited by {log.editedBy}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold">{formatDisplayDateTime(log.editedAt)}</p>
                                                </div>
                                                
                                                <p className="text-slate-500 italic mt-0.5 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2">
                                                    &ldquo;{log.reason}&rdquo;
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                                        <span>Check-in:</span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="text-slate-400 line-through">{formatDisplayDateTime(log.oldCheckIn).split(',')[1] || formatDisplayDateTime(log.oldCheckIn)}</span>
                                                            <FaExchangeAlt className="text-[9px] text-slate-300" />
                                                            <span className="text-blue-600 font-bold">{formatDisplayDateTime(log.newCheckIn).split(',')[1] || formatDisplayDateTime(log.newCheckIn)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                                        <span>Check-out:</span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="text-slate-400 line-through">{formatDisplayDateTime(log.oldCheckOut).split(',')[1] || formatDisplayDateTime(log.oldCheckOut)}</span>
                                                            <FaExchangeAlt className="text-[9px] text-slate-300" />
                                                            <span className="text-indigo-600 font-bold">{formatDisplayDateTime(log.newCheckOut).split(',')[1] || formatDisplayDateTime(log.newCheckOut)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl flex items-center justify-center gap-1.5">
                                        <FaCheckCircle className="text-slate-300" /> No edits recorded. This attendance record matches original scanned inputs.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
