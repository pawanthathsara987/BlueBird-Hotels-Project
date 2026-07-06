import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../../../assets/bluebird logo.png";
import {
  Calendar,
  Compass,
  Car,
  User,
  History,
  Star,
  Sliders,
  LogOut,
  ChevronUp,
  Home,
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
  setIsMobileSidebarOpen,
  setIsProfileModalOpen
}) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
  };

  const handleSignOut = async () => {
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/customers/logout");
    } catch (e) {
      console.error("Logout API error:", e);
    }
    localStorage.removeItem("customerToken");
    sessionStorage.removeItem("customerToken");
    // Also clear the global Axios header to ensure no stale token leaks
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Successfully logged out!");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const workspaceTabs = [
    { id: "overview", label: "Overview", icon: <Sliders size={16} /> },
    { id: "bookings", label: "Hotel Bookings", icon: <Calendar size={16} />, badge: bookings.length },
    { id: "tours", label: "Tours & Excursions", icon: <Compass size={16} />, badge: tours.filter(t => t.rawStatus !== "canceled").length },
    { id: "rentals", label: "Vehicle Rentals", icon: <Car size={16} /> },
    { id: "payments", label: "Payments & Invoices", icon: <History size={16} /> }
  ];

  const preferenceTabs = [
    { id: "reviews", label: "My Reviews", icon: <Star size={16} /> }
  ];


  const sidebarLinkClass = (isActive) =>
    `flex items-center justify-between py-3 px-4 text-xs font-semibold tracking-wide rounded-xl transition-all duration-300 focus:outline-none border-l-4 ${isActive
      ? "bg-blue-600/10 text-blue-400 border-blue-500 shadow-sm shadow-blue-500/5"
      : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1"
    }`;

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-72 self-stretch bg-[#0f172a] text-slate-100 border-r border-slate-800/80 shrink-0 overflow-hidden h-full">

        {/* Branding Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 font-bold text-white uppercase text-sm shrink-0">
            {profile.name ? (profile.name.trim().split(/\s+/).map(n => n[0]).join("").substring(0, 2)) : "G"}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase truncate">BlueBird Hotels</div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight truncate">{profile.name}</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-5 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {/* Main Navigation */}
          <div>
            <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Portal Links</p>
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 py-3 px-4 text-xs font-semibold tracking-wide rounded-xl text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1 transition-all duration-300"
              >
                <Home size={16} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
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

        {/* Customer Profile section at bottom */}
        <div className="relative p-4 border-t border-slate-800/80 bg-slate-900/30">
          
          {/* Dropdown Menu (Desktop) */}
          {isProfileDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1e293b] border border-slate-700/80 rounded-2xl shadow-xl z-50 py-2 animate-in slide-in-from-bottom-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-700/40">
                <p className="text-xs font-semibold text-slate-200">{profile.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{profile.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-2.5 border-b border-slate-700/40"
              >
                <User size={14} className="text-slate-400" />
                <span>My Luxury Profile</span>
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors flex items-center space-x-2.5"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Profile Card Button (Desktop) */}
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 text-left font-sans overflow-hidden focus:outline-none hover:bg-slate-800/40 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-450 shrink-0 uppercase">
                {profile.name ? (profile.name.trim().split(/\s+/).map(n => n[0]).join("").substring(0, 2)) : "G"}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{profile.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{profile.email}</p>
              </div>
            </div>
            <ChevronUp size={14} className="text-slate-400 shrink-0 ml-1.5" />
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
              {/* Main Navigation */}
              <div>
                <p className="px-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">Portal Links</p>
                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 text-xs font-semibold tracking-wide rounded-xl text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-100 transition-all duration-300"
                  >
                    <Home size={16} />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
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

            <div className="relative pt-4 border-t border-slate-800/80 mt-auto bg-slate-900/30 -mx-5 px-5 pb-1">
              
              {/* Dropdown Menu (Mobile) */}
              {isMobileProfileDropdownOpen && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1e293b] border border-slate-700/80 rounded-2xl shadow-xl z-50 py-2 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-700/40">
                    <p className="text-xs font-semibold text-slate-200">{profile.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsMobileProfileDropdownOpen(false);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-2.5 border-b border-slate-700/40"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>My Luxury Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileProfileDropdownOpen(false);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors flex items-center space-x-2.5"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Profile Card Button (Mobile) */}
              <button
                onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/40 text-left font-sans overflow-hidden focus:outline-none hover:bg-slate-800/40 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-450 shrink-0 uppercase">
                    {profile.name ? (profile.name.trim().split(/\s+/).map(n => n[0]).join("").substring(0, 2)) : "G"}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{profile.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{profile.email}</p>
                  </div>
                </div>
                <ChevronUp size={14} className="text-slate-400 shrink-0 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
