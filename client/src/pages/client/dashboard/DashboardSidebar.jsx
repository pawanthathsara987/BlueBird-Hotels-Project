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


  const sidebarLinkClass = (isActive) =>
    `flex items-center justify-between py-3 px-4 text-xs font-semibold tracking-wide rounded-xl transition-all duration-300 focus:outline-none border-l-4 ${isActive
      ? "bg-blue-600/10 text-blue-400 border-blue-500 shadow-sm shadow-blue-500/5"
      : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1"
    }`;

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0f172a] text-slate-100 border-r border-slate-800/80 shrink-0">
        
        {/* Branding Header */}
        <div className="px-6 py-8 border-b border-slate-800/80 flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
            <User className="text-2xl text-white animate-pulse" size={24} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">BlueBird Hotels</div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">Customer Portal</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow px-4 py-6 overflow-y-auto space-y-7 scrollbar-hide">
          {/* Workspace Group */}
          <div>
            <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Workspace</p>
            <div className="space-y-1">
              {workspaceTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full ${sidebarLinkClass(activeTab === tab.id)}`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {!isEmptyState && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Group */}
          <div>
            <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Account Preferences</p>
            <div className="space-y-1">
              {preferenceTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full ${sidebarLinkClass(activeTab === tab.id)}`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {!isEmptyState && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500 text-white'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Customer Profile & Sign Out section at bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 mb-3 font-sans">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-9 h-9 rounded-lg object-cover border border-slate-800/80"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{profile.name}</h4>
              <p className="text-[10px] text-slate-500 truncate">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-xl transition-all duration-300 shadow-sm shadow-rose-950/20"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAVIGATION SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-[#0f172a] text-slate-100 border-r border-slate-800/80 p-5 shadow-2xl animate-in slide-in-from-left duration-300 z-50">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
              <Link to="/" className="flex items-center focus:outline-none hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Bluebird Hotels Logo"
                  className="h-8 object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 hover:bg-slate-800/50 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Core navigation inside mobile drawer */}
            <nav className="flex-grow space-y-7 overflow-y-auto">
              {/* Workspace Group */}
              <div>
                <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Workspace</p>
                <div className="space-y-1">
                  {workspaceTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabClick(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full ${sidebarLinkClass(activeTab === tab.id)}`}
                    >
                      <div className="flex items-center gap-3">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      {!isEmptyState && tab.badge > 0 && (
                        <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences Group */}
              <div>
                <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Preferences</p>
                <div className="space-y-1">
                  {preferenceTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabClick(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full ${sidebarLinkClass(activeTab === tab.id)}`}
                    >
                      <div className="flex items-center gap-3">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      {!isEmptyState && tab.badge > 0 && (
                        <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500 text-white'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileSidebarOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-xl transition-all duration-300 shadow-sm shadow-rose-950/20"
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
