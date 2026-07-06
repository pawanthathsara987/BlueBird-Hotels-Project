import { useState } from "react";
import LeaveRequestsTab from "./components/LeaveRequestsTab";
import LeaveTypesTab from "./components/LeaveTypesTab";
import LeaveLimitsTab from "./components/LeaveLimitsTab";
import { MdEventNote, MdListAlt, MdTune } from "react-icons/md";

export default function LeaveManagement() {
    const [activeTab, setActiveTab] = useState("requests");

    return (
        <div className="p-4 md:p-6 space-y-6 text-slate-700 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <MdEventNote className="text-blue-600" />
                        Leave Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage staff leave requests and leave types</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide whitespace-nowrap">
                <button
                    className={`flex-shrink-0 flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === "requests"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("requests")}
                >
                    <MdEventNote className="text-lg" />
                    Leave Requests
                </button>
                <button
                    className={`flex-shrink-0 flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === "types"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("types")}
                >
                    <MdListAlt className="text-lg" />
                    Leave Types
                </button>
                <button
                    className={`flex-shrink-0 flex items-center gap-2 py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === "limits"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("limits")}
                >
                    <MdTune className="text-lg" />
                    Leave Limits
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "requests" && <LeaveRequestsTab />}
                {activeTab === "types" && <LeaveTypesTab />}
                {activeTab === "limits" && <LeaveLimitsTab />}
            </div>
        </div>
    );
}
