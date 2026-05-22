import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/bluebird logo.png";
import {
  Calendar,
  Compass,
  Car,
  User,
  History,
  Bell,
  Star,
  Sliders,
  LogOut,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardSidebar({
  profile,
  activeTab,
  setActiveTab,
  setSearchQuery,
  bookings,
  tours,
  isEmptyState,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen
}) {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
  };

  const handleSignOut = () => {
    toast.error("Logout simulation triggered");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const workspaceTabs = [
    { id: "overview", label: "Overview", icon: <Sliders size={16} /> },
    { id: "bookings", label: "Hotel Bookings", icon: <Calendar size={16} />, badge: bookings.length },
    { id: "tours", label: "Tour Inquiries", icon: <Compass size={16} />, badge: tours.filter(t => t.status === "Pending Review").length },
    { id: "rentals", label: "Vehicle Rentals", icon: <Car size={16} /> },
    { id: "payments", label: "Payments & Invoices", icon: <History size={16} /> }
  ];

  const preferenceTabs = [
    { id: "reviews", label: "My Reviews", icon: <Star size={16} /> },
    { id: "profile", label: "Profile Settings", icon: <User size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-950 text-white/90 border-r border-blue-900 shrink-0">
        {/* User Profile Mini Banner */}
        <div className="p-6 border-b border-blue-900 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border border-blue-900/40"
            />
          </div>
          <h3 className="font-serif font-semibold text-sm mt-3 tracking-wide text-white">{profile.name}</h3>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase px-3 mb-2">Workspace</p>
          {workspaceTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-700 to-blue-800 text-white shadow-xs border-l-4 border-cyan-500' : 'hover:bg-blue-900/40 text-blue-200/85 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {!isEmptyState && tab.badge > 0 && (
                <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${activeTab === tab.id ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-300'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase px-3 pt-6 mb-2">Account Preferences</p>
          {preferenceTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-700 to-blue-800 text-white shadow-xs border-l-4 border-cyan-500' : 'hover:bg-blue-900/40 text-blue-200/85 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {!isEmptyState && tab.badge > 0 && (
                <span className="px-2 py-0.5 text-[9px] bg-rose-500 text-white rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE NAVIGATION SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-blue-950 text-white/90 border-r border-blue-900 p-5 shadow-2xl animate-in slide-in-from-left duration-300 z-50">
            <div className="flex justify-between items-center mb-6 border-b border-blue-900 pb-4">
              <Link to="/" className="flex items-center focus:outline-none hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Bluebird Hotels Logo"
                  className="h-8 object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 hover:bg-blue-900/50 rounded-lg text-blue-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Core navigation inside mobile drawer */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {[...workspaceTabs, ...preferenceTabs].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-700 to-blue-800 text-white shadow-xs' : 'hover:bg-blue-900/40 text-blue-200/85 hover:text-white'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-blue-900 mt-4 text-center">
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full py-2.5 bg-rose-900/30 text-rose-400 border border-rose-900/50 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-900/40 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
