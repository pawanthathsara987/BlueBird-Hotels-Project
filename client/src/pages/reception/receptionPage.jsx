import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { MdDashboard, MdCheckCircle, MdLogout, MdMenu, MdClose, MdPersonPin } from "react-icons/md";
import { GiWalk } from "react-icons/gi";
import { MdOutlineBookOnline } from "react-icons/md";
import Dashboard from "./dashboard";
import Booking from "./booking";
import CheckIn from "./CheckIn";
import CheckOut from "./CheckOut";
import VisitorBooking from "./visitorBooking";

export default function ReceptionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                className="fixed top-4 left-4 z-30 md:hidden bg-[#29384d] text-white p-2 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>

            {/* Sidebar */}
            <div className={`fixed md:static z-30 w-72 md:w-64 lg:w-72 h-full bg-[#29384d] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="w-full h-24 md:h-28 flex flex-col items-center justify-center px-4">
                    <MdPersonPin className="w-14 h-14 md:w-16 md:h-16 text-white" />
                    <h1 className="text-lg md:text-xl font-bold text-white mt-1">Reception</h1>
                </div>
                <nav className="w-full flex flex-col pl-2 md:pl-4 pt-4 md:pt-6 space-y-1">
                    <Link to="/reception" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition"><MdDashboard className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Dashboard</span></Link>
                    <Link to="/reception/checkin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition"><MdCheckCircle className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Check-In</span></Link>
                    <Link to="/reception/checkout" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition"><MdCheckCircle className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Check-Out</span></Link>
                    <Link to="/reception/visiting" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition"><GiWalk className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Visiting</span></Link>
                    <Link to="/reception/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition"><MdOutlineBookOnline className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Bookings</span></Link>
                    <Link to="/logout" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 md:px-4 py-3 text-sm md:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition mt-auto"><MdLogout className="text-lg md:text-2xl flex-shrink-0" /> <span className="truncate">Logout</span></Link>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 h-full bg-gray-100 overflow-y-auto pt-14 md:pt-0">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/checkin" element={<CheckIn />} />
                    <Route path="/checkout" element={<CheckOut />} />
                    <Route path="/visiting" element={<VisitorBooking />} />
                    <Route path="/bookings" element={<Booking />} />
                </Routes>
            </div>
        </div>
    );
}
