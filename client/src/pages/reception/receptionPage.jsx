import { useState } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import { MdDashboard, MdCheckCircle, MdLogout, MdMenu, MdClose, MdPersonPin } from "react-icons/md";
import { GiWalk } from "react-icons/gi";
import { MdOutlineBookOnline } from "react-icons/md";
import Dashboard from "./dashboard";
import Booking from "./booking";
import CheckIn from "./CheckIn";
import CheckOut from "./CheckOut";


export default function ReceptionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-medium ${
            isActive 
            ? "bg-blue-500 text-white shadow-md shadow-blue-500/40" 
            : "text-white/70 hover:bg-white/10 hover:text-white hover:shadow-lg hover:-translate-y-0.5"
        }`;
    };

    return (
        <div className="w-full h-screen flex relative">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile hamburger button */}
            <button
                className="fixed top-4 left-4 z-30 md:hidden bg-[#29384d] text-white p-2 rounded-lg shadow-md hover:bg-[#3a4f6b] transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>

            {/* Sidebar */}
            <div className={`fixed md:static z-30 w-72 md:w-64 lg:w-72 h-full flex flex-col bg-[#29384d] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl md:shadow-none`}>
                <div className="w-full h-24 md:h-28 flex flex-col items-center justify-center px-4 mt-4 md:mt-0 flex-shrink-0">
                    <MdPersonPin className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-md" />
                    <h1 className="text-lg md:text-xl font-bold text-white mt-1 tracking-wide">Reception</h1>
                </div>
                <nav className="w-full flex-1 flex flex-col px-4 pt-2 md:pt-4 space-y-2 pb-6 overflow-y-auto">
                    <Link to="/reception" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception")}><MdDashboard className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Dashboard</span></Link>
                    <Link to="/reception/checkin" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkin")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-In</span></Link>
                    <Link to="/reception/checkout" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkout")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-Out</span></Link>
                    <Link to="/reception/bookings" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/bookings")}><MdOutlineBookOnline className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Bookings</span></Link>
                    <div className="mt-auto pt-6">
                        <Link to="/logout" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:shadow-lg hover:-translate-y-0.5`}><MdLogout className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Logout</span></Link>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 h-full bg-gray-100 overflow-y-auto pt-14 md:pt-0">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/checkin" element={<CheckIn />} />
                    <Route path="/checkout" element={<CheckOut />} />
                    <Route path="/bookings" element={<Booking />} />
                </Routes>
            </div>
        </div>
    );
}
