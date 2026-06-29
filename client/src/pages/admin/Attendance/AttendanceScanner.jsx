import { useState } from "react";
import { Link } from "react-router-dom";
import QRScanner from "./QRScanner";
import { scanAttendance } from "../../../utils/attendanceService";

export default function AttendanceScanner() {
    const [message, setMessage] = useState("");

    const handleScan = async (decodedText) => {
        try {
            const qrData = JSON.parse(decodedText);
            const response = await scanAttendance(qrData);
            if (response.data.action === "CHECK_IN") {
                setMessage(
                    `✅ ${response.data.staffName} checked in successfully`
                );
            } else if (response.data.action === "CHECK_OUT") {
                setMessage(
                    `✅ ${response.data.staffName} checked out successfully`
                );
            } else {
                setMessage(response.data.message || "Scan completed");
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Scan failed"
            );
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 px-4">
            <div className="mb-6">
                <Link
                    to="/admin/attendance-records"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    &larr; Back to Attendance Logs
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">
                Attendance Scanner
            </h1>

            <QRScanner onScanSuccess={handleScan} />

            <div className="mt-6 text-lg">
                {message}
            </div>

        </div>
    );
}