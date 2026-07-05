import { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { logout } from "../../utils/logout";
import { MdAdminPanelSettings, MdDashboard, MdBedroomParent, MdBookOnline, MdPeople, MdSettings, MdLogout, MdMenu, MdClose, MdShoppingBag, MdCoPresent, MdEventNote } from "react-icons/md";
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
import ServiceChargeView from "./rooms/ServiceChargeView";
import ShopManagement from "./shop/ShopManagement";
import AttendanceRecords from "./Attendance/AttendanceRecords";
import LeaveManagement from "./leave/LeaveManagement";
import AdminProfileSettings from "./AdminProfileSettings";


export default function AdminPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [adminImageUrl, setAdminImageUrl] = useState(() => localStorage.getItem("adminImageUrl") || "");
    const navigate = useNavigate();

    // ── Route Guard ─────────────────────────────────────────────────────────
    // Protect the entire admin dashboard: verify JWT exists and belongs to
    // an admin. Redirect to the login page if the check fails.
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/staffLogin", { replace: true });
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded || decoded.role !== "admin") {
                // Token exists but belongs to a different role — reject access
                navigate("/staffLogin", { replace: true });
            } else {
                setAuthorized(true);
            }
        } catch {
            // Malformed / tampered token
            localStorage.removeItem("token");
            navigate("/staffLogin", { replace: true });
        }
    }, [navigate]);
    // ────────────────────────────────────────────────────────────────────────

    // Fetch admin profile image
    useEffect(() => {
        const fetchAdminImage = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const decoded = jwtDecode(token);
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getAll`);
                const adminData = res.data.find((user) => user.userId === decoded.id);
                if (adminData?.imageUrl) {
                    setAdminImageUrl(adminData.imageUrl);
                    localStorage.setItem("adminImageUrl", adminData.imageUrl);
                }
            } catch {
                // silently ignore — avatar will fall back to initials
            }
        };
        fetchAdminImage();
    }, []);

    // Block render until the auth check is complete
    if (!authorized) return null;

    const adminName = localStorage.getItem("adminName") || "Admin Portal";
    const adminEmail = localStorage.getItem("adminEmail") || "admin@bluebird.com";
    const adminInitials = adminName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AD";

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
                {/* Admin Profile Header */}
                <div className="w-full py-7 flex flex-col items-center justify-center px-4 flex-shrink-0 border-b border-slate-800/80">
                    <div className="relative group">
                        {adminImageUrl ? (
                            <img
                                src={adminImageUrl}
                                alt={adminName}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-slate-800 shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-700 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                                {adminInitials}
                            </div>
                        )}
                        {/* Online indicator */}
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                    </div>
                    {/* Role badge & name */}
                    <div className="text-center mt-3.5 space-y-1">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full tracking-wider uppercase text-blue-300 bg-blue-500/10 border border-blue-500/20">
                            Administrator
                        </span>
                        <h2 className="text-sm md:text-base font-bold tracking-wide truncate max-w-[200px] text-slate-100">
                            {adminName}
                        </h2>
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
                            <NavLink to="/admin/attendance-records" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdCoPresent className="text-xl" />
                                <span>Attendance Logs</span>
                            </NavLink>
                            <NavLink to="/admin/leave-management" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdEventNote className="text-xl" />
                                <span>Leave Management</span>
                            </NavLink>
                            <NavLink to="/admin/extra-charges" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdBookOnline className="text-xl" />
                                <span>Extra Charges</span>
                            </NavLink>
                            <NavLink to="/admin/shop-items" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdShoppingBag className="text-xl" />
                                <span>Shop Items</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* System Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">System</p>
                        <div className="space-y-1">
                            <NavLink to="/admin/settings" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdSettings className="text-xl" />
                                <span>Profile Settings</span>
                            </NavLink>
                        </div>
                    </div>
                </div>

                {/* Admin Profile & Logout section at bottom */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner uppercase">
                            {adminInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-200 truncate">Administrator</h4>
                            <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setSidebarOpen(false); logout(); }}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-xl transition-all duration-300 shadow-sm shadow-rose-950/20 cursor-pointer"
                    >
                        <MdLogout className="text-base" />
                        <span>Logout</span>
                    </button>
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
                    <Route path="/attendance-records" element={<AttendanceRecords />} />
                    <Route path="/leave-management" element={<LeaveManagement />} />
                    <Route path="/extra-charges" element={<ServiceChargeView />} />
                    <Route path="/shop-items" element={<ShopManagement />} />
                    <Route path="/settings" element={<AdminProfileSettings />} />
                </Routes>
            </div>
        </div>
    );
}