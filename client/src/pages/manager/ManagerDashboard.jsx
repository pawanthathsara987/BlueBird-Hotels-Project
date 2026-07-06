import { useState } from "react";
import { Sparkles, Map, Car } from "lucide-react";
import ToursDashboard from "./ToursDashboard";
import VehiclesDashboard from "./vehicle/VehiclesDashboard";
import DriverForm from "./vehicle/DriverForm";

export default function ManagerDashboard() {
    const [dashboardSelectBtn, setDashboardSelectBtn] = useState("tour");
    const [showDriverForm, setShowDriverForm] = useState(false);

    return (
        <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                            <Sparkles size={12} className="animate-pulse" />
                            Operations Overview
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                        Manager Control Center
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 font-medium">
                        Analytical dashboard for managing tour packages, inquiries, and vehicle fleet bookings.
                    </p>
                </div>

                {/* Tab Switcher - Segmented Control */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 self-stretch sm:self-auto">
                    <button
                        onClick={() => setDashboardSelectBtn("tour")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-300 ${
                            dashboardSelectBtn === "tour"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Map size={14} />
                        Tours Analytics
                    </button>
                    <button
                        onClick={() => setDashboardSelectBtn("vehicle")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-300 ${
                            dashboardSelectBtn === "vehicle"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Car size={14} />
                        Vehicles Analytics
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-transparent">
                {dashboardSelectBtn === "tour" && <ToursDashboard />}
                {dashboardSelectBtn === "vehicle" && <VehiclesDashboard />}
            </div>

            {showDriverForm && (
                <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
                    <div className="max-w-3xl mx-auto">
                        <DriverForm onCancel={() => setShowDriverForm(false)} onSaved={() => setShowDriverForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
