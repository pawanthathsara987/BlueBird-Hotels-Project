import React, { useState } from "react";
import { FaTimes, FaFilePdf, FaCalendarDay, FaCalendarWeek, FaUserAlt, FaCog } from "react-icons/fa";

export default function ExportReportModal({ isOpen, onClose, staffList, isPreparingReport, onGenerate }) {
    const [reportType, setReportType] = useState("daily");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // "YYYY-MM"
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [staffSearchQuery, setStaffSearchQuery] = useState("");
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
    const [individualStartDate, setIndividualStartDate] = useState("");
    const [individualEndDate, setIndividualEndDate] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate({
            reportType,
            selectedDate,
            selectedMonth,
            selectedStaffId,
            individualStartDate,
            individualEndDate,
            staffSearchQuery
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100/50 overflow-hidden transform transition-all duration-300">
                {/* Modal Header */}
                <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FaFilePdf className="text-rose-400" /> Export Attendance Report
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Select report scope to generate printable PDF</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Report Type Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Report Scope</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setReportType("daily")}
                                className={`py-3 px-3 rounded-2xl font-semibold text-xs border transition flex flex-col items-center gap-2 cursor-pointer border-solid ${
                                    reportType === "daily"
                                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                }`}
                            >
                                <FaCalendarDay className="text-base" />
                                <span>Daily Report</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReportType("monthly")}
                                className={`py-3 px-3 rounded-2xl font-semibold text-xs border transition flex flex-col items-center gap-2 cursor-pointer border-solid ${
                                    reportType === "monthly"
                                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                }`}
                            >
                                <FaCalendarWeek className="text-base" />
                                <span>Monthly Report</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReportType("individual")}
                                className={`py-3 px-3 rounded-2xl font-semibold text-xs border transition flex flex-col items-center gap-2 cursor-pointer border-solid ${
                                    reportType === "individual"
                                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                }`}
                            >
                                <FaUserAlt className="text-base" />
                                <span>Individual Staff</span>
                            </button>
                        </div>
                    </div>

                    {/* Render Fields Conditionally */}
                    {reportType === "daily" && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition cursor-pointer border-solid"
                                required
                            />
                        </div>
                    )}

                    {reportType === "monthly" && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Month</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition cursor-pointer border-solid"
                                required
                            />
                        </div>
                    )}

                    {reportType === "individual" && (
                        <div className="space-y-4">
                            <div className="relative space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Search Staff Member</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type staff name or ID..."
                                        value={staffSearchQuery}
                                        onChange={(e) => {
                                            setStaffSearchQuery(e.target.value);
                                            setIsStaffDropdownOpen(true);
                                            if (e.target.value === "") {
                                                setSelectedStaffId("");
                                            }
                                        }}
                                        onFocus={() => setIsStaffDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsStaffDropdownOpen(false), 200)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition border-solid pr-10"
                                        required
                                    />
                                    {selectedStaffId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedStaffId("");
                                                setStaffSearchQuery("");
                                                setIsStaffDropdownOpen(false);
                                            }}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                                        >
                                            <FaTimes className="text-sm" />
                                        </button>
                                    )}
                                </div>

                                {/* Autocomplete Results List */}
                                {isStaffDropdownOpen && staffSearchQuery.trim() !== "" && (
                                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                        {staffList.filter(s => 
                                            s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                            s.staffId.toLowerCase().includes(staffSearchQuery.toLowerCase())
                                        ).length > 0 ? (
                                            staffList.filter(s => 
                                                s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                                s.staffId.toLowerCase().includes(staffSearchQuery.toLowerCase())
                                            ).map(staff => (
                                                <button
                                                    key={staff.staffId}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedStaffId(staff.staffId);
                                                        setStaffSearchQuery(`${staff.name} (${staff.staffId})`);
                                                        setIsStaffDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50/50 text-sm flex items-center justify-between transition cursor-pointer border-none bg-white"
                                                >
                                                    <div>
                                                        <span className="font-semibold text-slate-700 block">{staff.name}</span>
                                                        <span className="text-xs text-slate-400 font-bold">{staff.staffId}</span>
                                                    </div>
                                                    {selectedStaffId === staff.staffId && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-xs font-semibold text-slate-400 text-center bg-white">
                                                No matching staff members found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">From Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={individualStartDate}
                                        onChange={(e) => setIndividualStartDate(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition cursor-pointer border-solid"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">To Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={individualEndDate}
                                        onChange={(e) => setIndividualEndDate(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition cursor-pointer border-solid"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-2xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPreparingReport}
                            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg border-none"
                        >
                            {isPreparingReport ? (
                                <>
                                    <FaCog className="animate-spin text-sm" /> Compiling...
                                </>
                            ) : (
                                <>
                                    <FaFilePdf /> Export Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
