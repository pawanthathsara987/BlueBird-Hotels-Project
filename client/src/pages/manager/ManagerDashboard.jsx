import { useState } from "react";
import ToursDashboard from "./ToursDashboard";

export default function ManagerDashboard() {
    const [dashboardSelectBtn, setDashboardSelectBtn] = useState("tour");

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
                {dashboardSelectBtn === "vehicle" && (
                    <div className="flex items-center justify-center h-96">
                        <h2 className="text-2xl font-semibold text-gray-500">Vehicle Dashboard - Coming Soon</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
