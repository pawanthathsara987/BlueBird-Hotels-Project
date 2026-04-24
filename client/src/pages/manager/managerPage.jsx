import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { MdDashboard, MdBedroomParent, MdBookOnline, MdLoop, MdAssessment, MdLogout, MdMenu, MdClose } from "react-icons/md";
import { DollarSign, Inbox, CheckSquare } from "lucide-react";
import AddTour from "./tours/TourForm";
import TourEdit from "./tours/TourEdit";
import TourItemForm from "./tours/TourItemForm";
import TourItemView from "./tours/TourItemView";
import TourItemSelectPage from "./tours/TourItemSelectPage";
import TourManagement from "./tours/tourManagement";
import TourInquiriesManagement from "./TourInquiriesManagement";
import TourBookingsManagement from "./TourBookingsManagement";
import TourPaymentTracking from "./TourPaymentTracking";

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

            <div className={`fixed md:static z-30 w-64 h-full bg-[#29384d] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="w-full h-24 flex flex-col items-center justify-center">
                    <h1 className="text-xl font-bold text-white">Manager</h1>
                </div>
                <div className="w-full flex flex-col pl-5 pt-5 space-y-1">
                    <Link to="/manager" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70 hover:text-white hover:bg-white/10 rounded"><MdDashboard className="text-2xl" /> Dashboard</Link>
                    <Link to="/manager/tours/tourManagement" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70 hover:text-white hover:bg-white/10 rounded"><MdBedroomParent className="text-2xl" /> Tours</Link>
                    <a href="#tour-section" className="px-3 py-2 text-sm font-semibold text-white/50">Tour Booking</a>
                    <Link to="/manager/tour-inquiries" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-base text-white/70 hover:text-white hover:bg-white/10 rounded ml-4"><Inbox className="w-5 h-5" /> Inquiries</Link>
                    <Link to="/manager/tour-bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-base text-white/70 hover:text-white hover:bg-white/10 rounded ml-4"><CheckSquare className="w-5 h-5" /> Bookings</Link>
                    <Link to="/manager/tour-payments" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-base text-white/70 hover:text-white hover:bg-white/10 rounded ml-4"><DollarSign className="w-5 h-5" /> Payments</Link>
                    <Link to="/manager/vehicles" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70 hover:text-white hover:bg-white/10 rounded"><MdLoop className="text-2xl" /> Vehicles</Link>
                    <Link to="/manager/reports" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70 hover:text-white hover:bg-white/10 rounded"><MdAssessment className="text-2xl" /> Reports</Link>
                    <Link to="/logout" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70 hover:text-white hover:bg-white/10 rounded"><MdLogout className="text-2xl" /> Logout</Link>
                </div>
            </div>

            <div className="flex-1 h-full bg-gray-100 overflow-y-scroll pt-14 md:pt-0 p-4">
                <Routes>
                    <Route path="/" element={<h1 className="text-2xl font-bold">Welcome, Manager!</h1>} />
                    <Route path="/tours/tourManagement" element={<TourManagement />} />
                    <Route path="/tours/add" element={<AddTour />} />
                    <Route path="/tours/edit/:id" element={<TourEdit />} />
                    <Route path="/tour-inquiries" element={<TourInquiriesManagement />} />
                    <Route path="/tour-bookings" element={<TourBookingsManagement />} />
                    <Route path="/tour-payments" element={<TourPaymentTracking />} />
                    <Route path="/vehicles" element={<h1 className="text-2xl font-bold">Manage Vehicles</h1>} />
                    <Route path="/reports" element={<h1 className="text-2xl font-bold">View Reports</h1>} />
                    <Route path="/tours/item/add" element={<TourItemForm />} />
                    <Route path="/tours/item/edit/:itemId" element={<TourItemForm />} />
                    <Route path="/tours/item/select" element={<TourItemSelectPage />} />
                </Routes>
            </div>
        </div>
    );
}



