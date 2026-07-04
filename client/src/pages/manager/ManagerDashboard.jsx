import { useState } from "react";
import { Link } from "react-router-dom";
import ToursDashboard from "./ToursDashboard";
import VehiclesDashboard from "./vehicle/VehiclesDashboard";
import DriverForm from "./vehicle/DriverForm";

export default function ManagerDashboard() {
    const [dashboardSelectBtn, setDashboardSelectBtn] = useState("tour");
    const [showDriverForm, setShowDriverForm] = useState(false);

    return (
        <div className="w-full">
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setDashboardSelectBtn("tour")}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                        dashboardSelectBtn === "tour"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    Tour
                </button>
                <button
                    onClick={() => setDashboardSelectBtn("vehicle")}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                        dashboardSelectBtn === "vehicle"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    Vehicle
                </button>
            </div>

            <div className="mt-4">
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
