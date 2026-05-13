import { useState } from "react";
import { Link } from "react-router-dom";
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
                    <div className="flex items-center justify-center min-h-96">
                        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-800">Vehicle Dashboard</h2>
                            <p className="mt-3 text-gray-600">
                                Manage the hotel fleet from the dedicated vehicle page.
                            </p>
                            <Link
                                to="/manager/vehicles"
                                className="inline-flex mt-6 items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Open Vehicle Manager
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
