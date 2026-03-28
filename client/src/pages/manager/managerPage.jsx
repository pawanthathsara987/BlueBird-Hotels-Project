import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { MdDashboard, MdBedroomParent, MdBookOnline, MdLoop, MdAssessment, MdLogout, MdMenu, MdClose } from "react-icons/md";
import AddTour from "./tours/TourForm";

export default function ManagerPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="w-full h-screen flex relative">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <button
                className="fixed top-4 left-4 z-30 md:hidden bg-[#29384d] text-white p-2 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>

            <div className={`fixed md:static z-30 w-75 h-full bg-[#29384d] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="w-full h-25 flex flex-col items-center justify-center">
                    <h1 className="text-xl font-bold text-white">Manager</h1>
                </div>
                <div className="w-full flex flex-col pl-5 pt-5">
                    <Link to="/manager" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdDashboard className="text-2xl" /> Dashboard</Link>
                    <Link to="/manager/rooms" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdBedroomParent className="text-2xl" /> Tours</Link>
                    <Link to="/manager/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdBookOnline className="text-2xl" /> Bookings</Link>
                    <Link to="/manager/tours" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdLoop className="text-2xl" /> Vehiles</Link>
                    <Link to="/manager/reports" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdAssessment className="text-2xl" /> Reports</Link>
                    <Link to="/logout" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdLogout className="text-2xl" /> Logout</Link>
                </div>
            </div>

            <div className="flex-1 h-full bg-gray-100 overflow-y-scroll pt-14 md:pt-0 p-4">
                <Routes>
                    <Route path="/" element={<h1 className="text-2xl font-bold">Welcome, Manager!</h1>} />
                    <Route path="/rooms" element={<h1 className="text-2xl font-bold">Manage Rooms</h1>} />
                    <Route path="/bookings" element={<h1 className="text-2xl font-bold">Manage Bookings</h1>} />
                    <Route path="/tours" element={<AddTour />} />
                    <Route path="/reports" element={<h1 className="text-2xl font-bold">View Reports</h1>} />
                </Routes>
            </div>
        </div>
    );
}



