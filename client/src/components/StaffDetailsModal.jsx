import { useState, useEffect } from "react";
import axios from "axios";
import {
    FaTimes, FaUser, FaEnvelope, FaShieldAlt, FaPhone,
    FaIdCard, FaMapMarkerAlt, FaGlobe, FaDownload,
    FaQrcode, FaCalendarCheck, FaSpinner, FaCheckCircle,
    FaTimesCircle, FaClock, FaCalendarTimes
} from "react-icons/fa";

export default function StaffDetailsModal({ isOpen, member, onClose, status = "Active" }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !member) return;

        // Reset state when modal opens or member changes
        setActiveTab("profile");
        setAttendanceData(null);
        setError(null);
    }, [isOpen, member]);

    useEffect(() => {
        if (activeTab !== "attendance" || !member?.staffId) return;

        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/attendance/staff/${member.staffId}`
                );
                if (res.data.success) {
                    setAttendanceData(res.data);
                } else {
                    setError("Failed to fetch records");
                }
            } catch (err) {
                console.error("Error fetching staff attendance:", err);
                setError(err.response?.data?.message || "Failed to load attendance logs");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [activeTab, member?.staffId]);

    if (!isOpen || !member) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300 relative max-h-[90vh] flex flex-col font-sans">

                {/* Header Cover / Gradient */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-all duration-200 backdrop-blur-sm shadow-md cursor-pointer"
                        aria-label="Close"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Profile Photo / Avatar overlap */}
                <div className="flex flex-col items-center -mt-16 pb-4 flex-shrink-0">
                    <div className="relative">
                        {member.imageUrl ? (
                            <img
                                src={member.imageUrl}
                                alt={member.name}
                                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center border-4 border-white shadow-2xl text-slate-500 font-bold text-4xl">
                                {member.name ? member.name.charAt(0).toUpperCase() : <FaUser className="text-slate-400" />}
                            </div>
                        )}
                        <span className={`absolute -bottom-2 right-2 px-3 py-1 rounded-full text-xs font-semibold border-2 border-white shadow-md ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}>
                            {status}
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-800 tracking-tight">{member.name}</h2>
                    <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1.5 shadow-sm">
                        {member.roleName || member.Role?.roleName || "Staff"}
                    </span>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-100 px-8 mb-4 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === "profile"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab("attendance")}
                        className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === "attendance"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Attendance Logs
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 pt-2 overflow-y-auto flex-1">

                    {/* Tab 1: Profile View */}
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Information Details
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Staff ID */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                            <FaUser className="text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff ID</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{member.staffId}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200 sm:col-span-2">
                                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                            <FaEnvelope className="text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{member.email}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                            <FaPhone className="text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{member.phoneNumber}</p>
                                        </div>
                                    </div>

                                    {/* NIC Number */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                            <FaIdCard className="text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NIC Number</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{member.nicNumber || "-"}</p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200 sm:col-span-2">
                                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 mt-0.5">
                                            <FaMapMarkerAlt className="text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Address</p>
                                            <p className="text-sm font-semibold text-slate-700 leading-relaxed break-words whitespace-pre-line">{member.address || "No address provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            {member.qrCodeUrl && (
                                <div className="border-t border-slate-100 pt-4 flex flex-col items-center">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 self-start">
                                        Staff Attendance QR Code
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center w-full">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-3">
                                            <img
                                                src={member.qrCodeUrl.startsWith("http") ? member.qrCodeUrl : `${import.meta.env.VITE_BACKEND_URL}${member.qrCodeUrl}`}
                                                alt={`${member.name} QR Code`}
                                                className="w-40 h-40 object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const url = member.qrCodeUrl.startsWith("http") ? member.qrCodeUrl : `${import.meta.env.VITE_BACKEND_URL}${member.qrCodeUrl}`;
                                                    const response = await fetch(url);
                                                    const blob = await response.blob();
                                                    const blobUrl = URL.createObjectURL(blob);
                                                    const link = document.createElement("a");
                                                    link.href = blobUrl;
                                                    link.download = `${member.staffId || member.name}_QR.png`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    URL.revokeObjectURL(blobUrl);
                                                } catch (error) {
                                                    console.error("Failed to download QR code:", error);
                                                    window.open(member.qrCodeUrl.startsWith("http") ? member.qrCodeUrl : `${import.meta.env.VITE_BACKEND_URL}${member.qrCodeUrl}`, "_blank");
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                                        >
                                            <FaDownload className="text-xs" /> Download QR Code
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Attendance Logs View */}
                    {activeTab === "attendance" && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <FaSpinner className="text-3xl animate-spin text-blue-600 mb-3" />
                                    <p className="text-xs font-semibold text-slate-400">Loading attendance data...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-4 text-center">
                                    <FaTimesCircle className="text-3xl text-rose-500 mb-3" />
                                    <p className="text-xs font-semibold text-rose-600">{error}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Grid */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            Attendance Summary
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Days Active */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 col-span-2">
                                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                                    <FaCalendarCheck className="text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Days Tracked</p>
                                                    <p className="text-lg font-bold text-slate-800 mt-1">{attendanceData?.summary?.totalDays || 0}</p>
                                                </div>
                                            </div>

                                            {/* Present Count */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                                    <FaCheckCircle className="text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Present</p>
                                                    <p className="text-lg font-bold text-slate-800 mt-1">{attendanceData?.summary?.presentCount || 0}</p>
                                                </div>
                                            </div>

                                            {/* Late Count */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                                    <FaClock className="text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Late Days</p>
                                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                                        {attendanceData?.summary?.lateCount || 0}
                                                        {attendanceData?.summary?.lateCount > 0 && (
                                                            <span className="text-[9px] font-normal text-slate-400 block mt-0.5">
                                                                Avg: {attendanceData?.summary?.avgLateMinutes}m late
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Absent Count */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                                                    <FaTimesCircle className="text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Absent</p>
                                                    <p className="text-lg font-bold text-slate-800 mt-1">{attendanceData?.summary?.absentCount || 0}</p>
                                                </div>
                                            </div>

                                            {/* On Leave Count */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                                                    <FaCalendarTimes className="text-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">On Leave</p>
                                                    <p className="text-lg font-bold text-slate-800 mt-1">{attendanceData?.summary?.onLeaveCount || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Worked Hours Summary */}
                                    <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                                                <FaClock className="text-md" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600">Accumulated Working Time</p>
                                                <p className="text-lg font-extrabold text-indigo-900 mt-0.5">
                                                    {attendanceData?.summary?.totalWorkingHours || 0} hours
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History Logs */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            Attendance Logs
                                        </h3>

                                        <div className="overflow-x-auto border border-slate-100 rounded-2xl max-h-[30vh]">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 z-10">
                                                        <th className="p-3">Date</th>
                                                        <th className="p-3 text-center">Status</th>
                                                        <th className="p-3">Check-In</th>
                                                        <th className="p-3">Check-Out</th>
                                                        <th className="p-3 text-center">Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-600">
                                                    {attendanceData?.records?.length > 0 ? (
                                                        attendanceData.records.map((rec, index) => (
                                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="p-3 whitespace-nowrap">
                                                                    {rec.attendanceDate}
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide capitalize ${rec.status === "Present"
                                                                            ? "bg-emerald-50 text-emerald-700"
                                                                            : rec.status === "Late"
                                                                                ? "bg-amber-50 text-amber-700"
                                                                                : "bg-rose-50 text-rose-700"
                                                                        }`}>
                                                                        {rec.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 whitespace-nowrap">
                                                                    {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                                </td>
                                                                <td className="p-3 whitespace-nowrap">
                                                                    {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                                </td>
                                                                <td className="p-3 text-center font-bold text-slate-700">
                                                                    {rec.workingHours || "-"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="p-6 text-center text-slate-400 font-semibold">
                                                                No attendance logs recorded.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 px-8 py-4 flex justify-end border-t border-slate-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
