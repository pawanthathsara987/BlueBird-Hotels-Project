import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdCheckCircle, MdLogout, MdMenu, MdClose, MdPersonPin } from "react-icons/md";
import { GiWalk } from "react-icons/gi";
import { MdOutlineBookOnline } from "react-icons/md";
import Dashboard from "./dashboard";
import Booking from "./booking";
import CheckIn from "./CheckIn";
import CheckOut from "./CheckOut";
import { jwtDecode } from "jwt-decode";
import axios from "axios";


export default function ReceptionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/receptionistLogin");
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded || decoded.role !== "receptionist") {
                navigate("/receptionistLogin");
            } else {
                setAuthorized(true);
            }
        } catch (e) {
            localStorage.removeItem("token");
            navigate("/receptionistLogin");
        }
    }, [navigate]);

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-medium ${
            isActive 
            ? "bg-blue-500 text-white shadow-md shadow-blue-500/40" 
            : "text-white/70 hover:bg-white/10 hover:text-white hover:shadow-lg hover:-translate-y-0.5"
        }`;
    };

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const receptionistName = user ? user.name : "Receptionist";
    const receptionistRole = user ? user.role : "receptionist";
    const userImageUrl = user ? user.imageUrl : null;

    if (!authorized) {
        return null;
    }

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
                <div className="w-full py-6 flex flex-col items-center justify-center px-4 flex-shrink-0 border-b border-white/10">
                    {/* Reception Profile Image */}
                    <div className="relative group">
                        {userImageUrl ? (
                            <img 
                                src={userImageUrl} 
                                alt="Receptionist" 
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500/10 border-4 border-white/20 flex items-center justify-center text-white text-xl font-black shadow-lg">
                                {receptionistName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#29384d] rounded-full" />
                    </div>
                    {/* Role & Name */}
                    <div className="text-center mt-3 space-y-1">
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded-full tracking-wider uppercase">
                            {receptionistRole}
                        </span>
                        <h2 className="text-sm md:text-base font-bold text-white tracking-wide truncate max-w-[200px]">
                            {receptionistName}
                        </h2>
                    </div>
                </div>
                <nav className="w-full flex-1 flex flex-col px-4 pt-2 md:pt-4 space-y-2 pb-6 overflow-y-auto">
                    <Link to="/reception" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception")}><MdDashboard className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Dashboard</span></Link>
                    <Link to="/reception/checkin" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkin")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-In</span></Link>
                    <Link to="/reception/checkout" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkout")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-Out</span></Link>
                    <Link to="/reception/bookings" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/bookings")}><MdOutlineBookOnline className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Bookings</span></Link>
                    <div className="mt-auto pt-6">
                        <button 
                            onClick={() => {
                                setSidebarOpen(false);
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                delete axios.defaults.headers.common["Authorization"];
                                navigate("/receptionistLogin");
                            }}
                            className={`flex items-center w-full text-left gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
                        >
                            <MdLogout className="text-xl md:text-2xl flex-shrink-0" />
                            <span className="truncate">Logout</span>
                        </button>
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
