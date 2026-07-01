import { useState } from "react";
import { Link } from "react-router-dom";
import QRScanner from "./QRScanner";
import { scanAttendance } from "../../../utils/attendanceService";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaTimes, FaArrowLeft } from "react-icons/fa";

export default function AttendanceScanner() {
    const [scanResult, setScanResult] = useState(null);

    const handleScan = async (decodedText) => {
        const scanId = Date.now();
        let qrData = null;
        try {
            qrData = JSON.parse(decodedText);
        } catch (e) {
            setScanResult({
                id: scanId,
                type: "error",
                title: "Invalid QR Code",
                message: "The scanned QR code is invalid or unreadable."
            });
            return;
        }

        try {
            const response = await scanAttendance(qrData);

            if (response.data && response.data.success === false) {
                setScanResult({
                    id: scanId,
                    type: "error",
                    title: "Scan Failed",
                    staffName: response.data.staffName || response.data.staff?.name || "Staff Member",
                    staffId: response.data.staff?.staffId || response.data.attendance?.staffId || qrData.staffId || "Unknown",
                    message: response.data.message || "Failed to process attendance."
                });
                return;
            }

            let result = {
                id: scanId,
                type: "success",
                title: "Scan Successful",
                staffName: response.data.staffName || response.data.staff?.name || "Staff Member",
                staffId: response.data.staff?.staffId || response.data.attendance?.staffId || qrData.staffId || "Unknown",
                action: response.data.action,
                message: response.data.message || `${response.data.staffName} processed successfully.`
            };

            if (response.data.action === "CHECK_IN") {
                result.title = "Check-In Success";
                result.message = "Logged check-in time successfully.";
            } else if (response.data.action === "CHECK_OUT") {
                result.title = "Check-Out Success";
                result.message = "Logged check-out time successfully.";
            }

            setScanResult(result);
        } catch (error) {
            const errMsg = error.response?.data?.message || "Scan failed";
            const errorData = error.response?.data || {};
            setScanResult({
                id: scanId,
                type: "error",
                title: "Scan Failed",
                staffName: errorData.staffName || errorData.staff?.name || "Staff Member",
                staffId: errorData.staff?.staffId || errorData.attendance?.staffId || qrData?.staffId || "Unknown",
                message: errMsg
            });
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 px-4 py-8">
            <div className="mb-6">
                <Link
                    to="/admin/attendance-records"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Attendance Logs
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
                <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight text-center">
                    Attendance Scanner
                </h1>
                <p className="text-xs text-slate-400 mb-6 text-center leading-normal">
                    Align the staff member's QR code within the highlighted scanner frame to register attendance.
                </p>

                <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 min-h-[280px] flex items-center justify-center">
                    {!scanResult ? (
                        <QRScanner onScanSuccess={handleScan} />
                    ) : (
                        <div className="text-slate-400 text-sm font-semibold animate-pulse">
                            Scanner paused...
                        </div>
                    )}
                </div>
            </div>

            {/* Attractive Scan Result Pop-up Modal */}
            {scanResult && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300 relative p-6 flex flex-col items-center">
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setScanResult(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-all duration-200 cursor-pointer"
                            aria-label="Close"
                        >
                            <FaTimes className="text-sm" />
                        </button>

                        {/* Icon Banner */}
                        <div className="mt-4 mb-5">
                            {scanResult.type === "success" ? (
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-inner border border-emerald-100 animate-bounce">
                                    <FaCheckCircle />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl shadow-inner border border-rose-100 animate-pulse">
                                    <FaTimesCircle />
                                </div>
                            )}
                        </div>

                        {/* Heading / Title */}
                        <h2 className={`text-2xl font-bold tracking-tight text-center ${
                            scanResult.type === "success" ? "text-slate-800" : "text-rose-600"
                        }`}>
                            {scanResult.title}
                        </h2>

                        {/* Content Details */}
                        <div className="w-full mt-6 space-y-4">
                            {/* Always show Staff Member details if available */}
                            {scanResult.staffId && scanResult.staffId !== "Unknown" && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-full">
                                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                        <FaUser className="text-sm" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Member</p>
                                        <p className="text-sm font-bold text-slate-800">{scanResult.staffName}</p>
                                        <p className="text-xs text-slate-500 font-semibold mt-0.5">ID: {scanResult.staffId}</p>
                                    </div>
                                </div>
                            )}

                            {scanResult.type === "success" ? (
                                <div className="space-y-3">
                                    {/* Action Badge */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-full">
                                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                            <FaClock className="text-sm" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity</p>
                                            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                                                scanResult.action === "CHECK_IN" 
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                            }`}>
                                                {scanResult.action === "CHECK_IN" ? "Check-In" : "Check-Out"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Error Message Card */
                                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                        {scanResult.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Status Message (if success) */}
                        {scanResult.type === "success" && scanResult.message && (
                            <p className="text-xs text-slate-500 mt-4 text-center px-4 leading-normal">
                                {scanResult.message}
                            </p>
                        )}

                        {/* Bottom Button */}
                        <button
                            onClick={() => setScanResult(null)}
                            className={`mt-6 w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md active:scale-98 cursor-pointer ${
                                scanResult.type === "success" 
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                                    : "bg-slate-800 hover:bg-slate-900"
                            }`}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}