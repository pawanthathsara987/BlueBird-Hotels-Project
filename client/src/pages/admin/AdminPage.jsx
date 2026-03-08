import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { MdAdminPanelSettings, MdDashboard, MdBedroomParent, MdBookOnline, MdPeople, MdSettings, MdLogout, MdMenu, MdClose } from "react-icons/md";
import RoomManagement from "./rooms/roomManagement";
import StaffManagement from "./StaffManegement";
import AddNewStaffMember from "./AddNewStaffMember";

export default function AdminPage() {
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
            <div className={`fixed md:static z-30 w-75 h-full bg-[#29384d] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="w-full h-25 flex flex-col items-center justify-center">
                    <MdAdminPanelSettings className="w-16 h-16 text-white" />
                    <h1 className="text-xl font-bold text-white">Admin</h1>
                </div>
                <div className="w-full flex flex-col pl-5 pt-5">
                    <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdDashboard className="text-2xl" /> Dashboard</Link>
                    <Link to="/admin/rooms/roomManagement" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdBedroomParent className="text-2xl" /> Rooms</Link>
                    <Link to="/admin/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdBookOnline className="text-2xl" /> Bookings</Link>
                    <Link to="/admin/users" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdPeople className="text-2xl" /> Users</Link>
                    <Link to="/admin/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdSettings className="text-2xl" /> Settings</Link>
                    <Link to="/logout" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70"><MdLogout className="text-2xl" /> Logout</Link>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 h-full bg-gray-100 overflow-y-scroll pt-14 md:pt-0">
                <Routes>
                    <Route path="/" element={<h1 className="p-5">Welcome to Admin Dashboard</h1>} />
                    <Route path="/rooms/roomManagement" element={<RoomManagement />} />
                    <Route path="/bookings" element={<h1 className="p-5">Bookings Management</h1>} />
                    <Route path="/users" element={<StaffManagement />} />
                    <Route path="/users/addStaffMember" element={<AddNewStaffMember />} />
                    <Route path="/settings" element={<h1 className="p-5">Settings</h1>} />
                </Routes>
            </div>
        </div>
    );
}