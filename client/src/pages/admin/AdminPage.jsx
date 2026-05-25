import { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { MdAdminPanelSettings, MdDashboard, MdBedroomParent, MdBookOnline, MdPeople, MdSettings, MdLogout, MdMenu, MdClose } from "react-icons/md";
import RoomManagement from "./rooms/roomManagement";
import AmenitiesForm from "./rooms/AmenitiesForm";
import RoomForm from "./rooms/RoomForm";
import RoomTypeForm from "./rooms/RoomTypeForm";
import PackageImageForm from "./rooms/PackageImageForm";
import StaffManagement from "./user/StaffManegement";
import AddNewStaffMember from "./user/AddNewStaffMember";
import UpdateStaffMember from "./user/UpdateStaffMember";
import ViewDeletedStaff from "./user/ViewDeletedStaff";
import AdminDashboard from "./AdminDashboard";
import OtherItemPriceView from "./rooms/OtherItemPriceView";

export default function AdminPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarLinkClass = ({ isActive }) =>
        `flex items-center gap-3 py-3 px-4 text-base font-medium rounded-xl transition-all duration-300 focus:outline-none border-l-4 ${isActive
            ? "bg-blue-600/10 text-blue-400 border-blue-500 shadow-sm shadow-blue-500/5"
            : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1"
        }`;

    return (
        <div className="w-full h-screen flex relative">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile hamburger button */}
            <button
                className="fixed top-4 left-4 z-30 md:hidden bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-slate-800 shadow-lg shadow-black/20 transition-all duration-200 active:scale-95"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>

            {/* Sidebar */}
            <div className={`fixed md:static z-30 w-72 h-full bg-[#0f172a] text-slate-100 border-r border-slate-800/80 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
                {/* Branding Header */}
                <div className="px-6 py-8 border-b border-slate-800/80 flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
                        <MdAdminPanelSettings className="text-2xl text-white animate-pulse" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">BlueBird Hotels</div>
                        <h1 className="text-lg font-bold text-slate-100 leading-tight">Admin Portal</h1>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-grow px-4 py-6 overflow-y-auto space-y-7 scrollbar-hide">
                    {/* Overview Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Overview</p>
                        <div className="space-y-1">
                            <NavLink to="/admin" end onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdDashboard className="text-xl" />
                                <span>Dashboard</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* Management Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Management</p>
                        <div className="space-y-1">
                            <NavLink to="/admin/rooms/roomManagement" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdBedroomParent className="text-xl" />
                                <span>Rooms</span>
                            </NavLink>
                            <NavLink to="/admin/users" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdPeople className="text-xl" />
                                <span>Users</span>
                            </NavLink>
                            <NavLink to="/admin/extra-charges" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdBookOnline className="text-xl" />
                                <span>Extra Charges</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* System Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">System</p>
                        <div className="space-y-1">
                            <NavLink to="/admin/settings" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdSettings className="text-xl" />
                                <span>Settings</span>
                            </NavLink>
                        </div>
                    </div>
                </div>

                {/* Admin Profile & Logout section at bottom */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-200 truncate">Administrator</h4>
                            <p className="text-[10px] text-slate-500 truncate">admin@bluebird.com</p>
                        </div>
                    </div>
                    <NavLink
                        to="/logout"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-xl transition-all duration-300 shadow-sm shadow-rose-950/20"
                    >
                        <MdLogout className="text-base" />
                        <span>Logout</span>
                    </NavLink>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 h-full bg-gray-100 overflow-y-scroll pt-14 md:pt-0">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/rooms/roomManagement" element={<RoomManagement />} />
                    <Route path="/rooms/room/add" element={<RoomForm />} />
                    <Route path="/rooms/room/edit" element={<RoomForm />} />
                    <Route path="/rooms/amenities/add" element={<AmenitiesForm />} />
                    <Route path="/rooms/amenities/edit" element={<AmenitiesForm />} />
                    <Route path="/rooms/packages/add" element={<RoomTypeForm />} />
                    <Route path="/rooms/packages/edit" element={<RoomTypeForm />} />
                    <Route path="/rooms/packages/image/add" element={<PackageImageForm />} />
                    <Route path="/bookings" element={<h1 className="p-5">Bookings Management</h1>} />
                    <Route path="/users" element={<StaffManagement />} />
                    <Route path="/users/addStaffMember" element={<AddNewStaffMember />} />
                    <Route path="/users/updateStaffMember" element={<UpdateStaffMember />} />
                    <Route path="/users/viewDeletedStaff" element={<ViewDeletedStaff />} />
                    <Route path="/extra-charges" element={<OtherItemPriceView />} />
                    <Route path="/settings" element={<h1 className="p-5">Settings</h1>} />
                </Routes>
            </div>
        </div>
    );
}