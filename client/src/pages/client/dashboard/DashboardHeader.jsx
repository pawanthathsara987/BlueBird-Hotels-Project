import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/bluebird logo.png";
import {
  Menu,
  Search,
  X,
  Bell,
  ChevronDown,
  User,
  CreditCard,
  EyeOff,
  Eye,
  LogOut
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardHeader({
  profile,
  searchQuery,
  setSearchQuery,
  notifications,
  setNotifications,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  isNotifDropdownOpen,
  setIsNotifDropdownOpen,
  setIsMobileSidebarOpen,
  showRealPII,
  setShowRealPII,
  setActiveTab,
  handleMarkAllRead,
  maskEmail
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 bg-slate-900/5 hover:bg-slate-900/10 active:scale-95 rounded-xl text-slate-700 md:hidden transition-all border border-slate-200/60"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
        {/* Premium Luxury Logo */}
        <Link to="/" className="flex items-center space-x-2.5 focus:outline-none hover:opacity-90 transition-opacity">
          <img
            src={logo}
            alt="Bluebird Hotels Logo"
            className="h-10 md:h-12 object-contain"
          />
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <Search className="absolute left-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search reservations, itineraries, luxury transfers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50/80 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-full py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Right Actions Nav */}
      <div className="flex items-center space-x-4">
        {/* Notification Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifDropdownOpen(!isNotifDropdownOpen);
              setIsProfileDropdownOpen(false);
            }}
            className="p-2.5 hover:bg-slate-50 rounded-full text-slate-600 relative transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* Notification Panel Popover */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 py-3 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-100">
                <h4 className="font-semibold text-sm text-blue-950">Luxury Concierge Alerts</h4>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">Your inbox is clear.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-slate-50 transition-colors flex flex-col space-y-1 border-b border-slate-50/50 last:border-b-0 ${!n.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-xs text-blue-950 flex items-center gap-1.5">
                          {!n.read && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block animate-pulse"></span>}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 mt-1 text-center border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveTab("notifications");
                    setIsNotifDropdownOpen(false);
                  }}
                  className="text-xs text-blue-900 font-semibold hover:text-blue-700 w-full"
                >
                  Open Full Notification Center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
              setIsNotifDropdownOpen(false);
            }}
            className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
            aria-label="User profile settings menu"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-800/10"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-blue-950 leading-tight">{profile.name}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 py-2.5 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-blue-950">{profile.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{maskEmail(profile.email)}</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50/60 hover:text-blue-900 transition-colors flex items-center space-x-2"
              >
                <User size={14} />
                <span>My Luxury Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("payments");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50/60 hover:text-blue-900 transition-colors flex items-center space-x-2"
              >
                <CreditCard size={14} />
                <span>Payments &amp; Receipts</span>
              </button>
              <button
                onClick={() => {
                  setShowRealPII(!showRealPII);
                  setIsProfileDropdownOpen(false);
                  toast.success(showRealPII ? "Private data masked securely" : "Private data revealed");
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50/60 hover:text-blue-900 transition-colors flex items-center space-x-2 border-b border-slate-100"
              >
                {showRealPII ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showRealPII ? "Mask Private Data" : "Reveal Private Data"}</span>
              </button>
              <button
                onClick={() => {
                  toast.error("Logout simulation triggered");
                  setIsProfileDropdownOpen(false);
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50/60 transition-colors flex items-center space-x-2"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
