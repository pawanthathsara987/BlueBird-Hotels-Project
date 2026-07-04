import { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { logout } from "../../utils/logout";
import { MdDashboard, MdBedroomParent, MdLoop, MdAssessment, MdLogout, MdMenu, MdClose } from "react-icons/md";
import { Inbox, Calendar, Wrench, ClipboardCheck, Compass, ShieldAlert } from "lucide-react";
import AddTour from "./tours/TourForm";
import TourEdit from "./tours/TourEdit";
import TourItemForm from "./tours/TourItemForm";
import TourItemView from "./tours/TourItemView";
import TourItemSelectPage from "./tours/TourItemSelectPage";
import TourManagement from "./tours/tourManagement";
import TourInquiriesManagement from "./TourInquiriesManagement";
import ManagerDashboard from "./ManagerDashboard";
import TourBookings from "./tours/TourBookingsManagement";
import VehicleManagement from "./vehicle/VehicleManagement";
import VehicleTypeManagement from "./vehicle/VehicleTypeManagement";
import DriversManagement from "./vehicle/DriversManagement";
import VehicleRentalPolicy from "./vehicle/VehicleRentalPolicy";
import BookingManagement from "./vehicle/BookingManagement";
import VehicleReports from "./vehicle/VehicleReports";
import ServiceLogManagement from "./vehicle/ServiceLogManagement";
import ChecklistManagement from "./vehicle/ChecklistManagement";

export default function ManagerPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();

    // ── Route Guard ────────────────────────────────────────────────────────
    // Protect the manager dashboard: verify JWT exists and role is "manager".
    // Redirects to /staffLogin if the check fails.
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/staffLogin", { replace: true });
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded || decoded.role !== "manager") {
                navigate("/staffLogin", { replace: true });
            } else {
                setAuthorized(true);
            }
        } catch {
            localStorage.removeItem("token");
            navigate("/staffLogin", { replace: true });
        }
    }, [navigate]);
    // ────────────────────────────────────────────────────────────────────────

    // Block render until auth check completes
    if (!authorized) return null;

    const managerName = localStorage.getItem("managerName") || "Manager Portal";
    const managerEmail = localStorage.getItem("managerEmail") || "manager@bluebird.com";
    const managerInitials = managerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "MP";

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
                        <Compass className="text-2xl text-white animate-pulse" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">BlueBird Hotels</div>
                        <h1 className="text-lg font-bold text-slate-100 leading-tight">{managerName}</h1>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-grow px-4 py-6 overflow-y-auto space-y-7 scrollbar-hide">
                    {/* Overview Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Overview</p>
                        <div className="space-y-1">
                            <NavLink to="/manager" end onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdDashboard className="text-xl" />
                                <span>Dashboard</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* Tours Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Tours & Bookings</p>
                        <div className="space-y-1">
                            <NavLink to="/manager/tours/tourManagement" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdBedroomParent className="text-xl" />
                                <span>Tours</span>
                            </NavLink>
                            <NavLink to="/manager/tour-inquiries" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <Inbox className="w-5 h-5" />
                                <span>Inquiries</span>
                            </NavLink>
                            <NavLink to="/manager/tour-bookings" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <Calendar className="w-5 h-5" />
                                <span>Tour Bookings</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* Vehicles Group */}
                    <div>
                        <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Fleet Management</p>
                        <div className="space-y-1">
                            <NavLink to="/manager/vehicles" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdLoop className="text-xl" />
                                <span>Vehicles</span>
                            </NavLink>
                            <NavLink to="/manager/vehicle-bookings" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <Calendar className="w-5 h-5" />
                                <span>Bookings</span>
                            </NavLink>
                            <NavLink to="/manager/drivers" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <Inbox className="w-5 h-5" />
                                <span>Drivers</span>
                            </NavLink>
                            <NavLink to="/manager/vehicle-policy" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <ShieldAlert className="w-5 h-5" />
                                <span>Rental Policy</span>
                            </NavLink>
                            <NavLink to="/manager/service-logs" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <Wrench className="w-5 h-5" />
                                <span>Service Logs</span>
                            </NavLink>
                            <NavLink to="/manager/checklists" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <ClipboardCheck className="w-5 h-5" />
                                <span>Checklists</span>
                            </NavLink>
                            <NavLink to="/manager/reports" onClick={() => setSidebarOpen(false)} className={sidebarLinkClass}>
                                <MdAssessment className="text-xl" />
                                <span>Reports</span>
                            </NavLink>
                        </div>
                    </div>
                </div>

                {/* Manager Profile & Logout section at bottom */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner uppercase">
                            {managerInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-200 truncate">Manager</h4>
                            <p className="text-[10px] text-slate-500 truncate">{managerEmail}</p>
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
                    <Route index element={<ManagerDashboard />} />
                    <Route path="tours/tourManagement" element={<TourManagement />} />
                    <Route path="tours/add" element={<AddTour />} />
                    <Route path="tours/edit/:id" element={<TourEdit />} />
                    <Route path="tour-inquiries" element={<TourInquiriesManagement />} />
                    <Route path="tour-bookings" element={<TourBookings />} />
                    <Route path="vehicles" element={<VehicleManagement />} />
                    <Route path="vehicle-types" element={<VehicleTypeManagement />} />
                    <Route path="vehicle-bookings" element={<BookingManagement />} />
                    <Route path="service-logs" element={<ServiceLogManagement />} />
                    <Route path="checklists" element={<ChecklistManagement />} />
                    <Route path="drivers" element={<DriversManagement />} />
                    <Route path="vehicle-policy" element={<VehicleRentalPolicy />} />
                    <Route path="reports" element={<VehicleReports />} />
                    <Route path="tours/item/add" element={<TourItemForm />} />
                    <Route path="tours/item/edit/:itemId" element={<TourItemForm />} />
                    <Route path="tours/item/select" element={<TourItemSelectPage />} />
                </Routes>
            </div>
        </div>
    );
}



