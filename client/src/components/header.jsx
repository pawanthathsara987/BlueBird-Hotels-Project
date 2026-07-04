import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/bluebird logo.png";
import { LuListCollapse, LuMenu } from "react-icons/lu";
import { Sun, Moon, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getWeather();
    const checkAuth = (e) => {
      if (e) {
        if (!e.key || e.key === "customerToken") {
          const storedToken = localStorage.getItem("customerToken");
          if (!storedToken) {
            sessionStorage.removeItem("customerToken");
          } else if (e.newValue) {
            sessionStorage.setItem("customerToken", e.newValue);
          }
        }
      }

      let token =
        localStorage.getItem("customerToken") ||
        sessionStorage.getItem("customerToken");
      if (token === "undefined" || token === "null") {
        localStorage.removeItem("customerToken");
        sessionStorage.removeItem("customerToken");
        token = null;
      }
      setIsLoggedIn(!!token);

      // Try to read user name from stored token payload
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const first = payload.firstName || "";
          const last = payload.lastName || "";
          setUserName((first + " " + last).trim() || "Guest");
        } catch {
          setUserName("Guest");
        }
      } else {
        setUserName("");
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]); // re-check on route change so logout is reflected

  // Close profile dropdown when clicking outside BOTH dropdown containers
  useEffect(() => {
    function handleClickOutside(e) {
      const inDesktop = desktopProfileRef.current?.contains(e.target);
      const inMobile  = mobileProfileRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/customers/logout");
    } catch (e) {
      console.error("Logout API error:", e);
    }
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    setProfileOpen(false);
    setSideBarOpen(false);
    toast.success("Successfully logged out!", {
      style: {
        border: "1px solid #10b981",
        padding: "16px",
        color: "#065f46",
        fontWeight: "bold",
        borderRadius: "16px",
        background: "#f0fdf4",
      },
    });
    navigate("/");
  };

  const hour =
    typeof window !== "undefined" ? new Date().getHours() : 12;
  const isDay = hour >= 6 && hour < 18;

  async function getWeather() {
    try {
      const res = await axios.get(
        "https://api.open-meteo.com/v1/forecast?latitude=7.2083&longitude=79.8358&current=temperature_2m"
      );
      setWeather(res.data.current.temperature_2m);
    } catch {
      /* silent */
    }
  }

  // Initials avatar fallback
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ─── nav links ───────────────────────────────────────────────────────────
  const leftLinks = [
    { label: "HOME", to: "/" },
    { label: "TRAVELS", to: "/booking/tour" },
    { label: "VEHICLES", to: "/vehicles" },
  ];
  const rightLinks = [
    { label: "GALLERY", to: "/gallery" },
    { label: "FAQ", to: "/faq" },
    { label: "REVIEWS", to: "/reviews" },
    { label: "CONTACT", to: "/contact" },
  ];

  return (
    <header className="w-full bg-white shadow-sm relative z-50">
      {/* ── Desktop bar ── */}
      <div className="w-full px-4 lg:px-10 h-[90px] hidden lg:grid grid-cols-[1fr_auto_1fr] items-center">

        {/* LEFT: weather + left nav */}
        <div className="flex items-center gap-6">
          {/* Weather */}
          <span className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
            {isDay ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-400" />
            )}
            Negombo &nbsp;
            <span className="font-semibold text-gray-700">
              {weather !== null ? `${weather}°C` : "—"}
            </span>
          </span>

          {/* Left nav links */}
          <nav className="flex items-center gap-6 font-medium text-sm tracking-wide text-gray-700">
            {leftLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: Logo */}
        <div className="flex items-center justify-center px-6">
          <Link to="/">
            <img src={logo} alt="BlueBird Logo" className="h-20 object-contain" />
          </Link>
        </div>

        {/* RIGHT: right nav + auth */}
        <div className="flex items-center justify-end gap-6">
          {/* Right nav links */}
          <nav className="flex items-center gap-6 font-medium text-sm tracking-wide text-gray-700">
            {rightLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth zone */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              /* ── Profile avatar + dropdown ── */
              <div className="relative" ref={desktopProfileRef}>
                <button
                  id="profile-menu-btn"
                  type="button"
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 group focus:outline-none"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  {/* Avatar circle */}
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-white group-hover:ring-blue-200 transition-all duration-200 select-none">
                    {initials || <User size={16} />}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-cyan-50">
                      <p className="text-xs font-bold text-blue-900 truncate">{userName || "Valued Guest"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">BlueBird Member</p>
                    </div>
                    {/* Actions */}
                    <div className="py-1.5">
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 group/item"
                      >
                        <LayoutDashboard size={15} className="text-blue-500 group-hover/item:text-blue-700 transition-colors" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors duration-150 group/item"
                      >
                        <LogOut size={15} className="text-rose-400 group-hover/item:text-rose-600 transition-colors" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/customerLogin", { state: { from: location.pathname } })}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Book Now — hidden on booking page */}
            {location.pathname !== "/booking" && (
              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-600/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer whitespace-nowrap"
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bar ── */}
      <div className="lg:hidden flex items-center justify-between px-4 h-16">
        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setSideBarOpen(true)}
          aria-label="Open menu"
          className="p-1"
        >
          <LuMenu className="text-3xl text-gray-700" />
        </button>

        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="BlueBird Logo" className="h-12 object-contain" />
        </Link>

        {/* Mobile right: profile avatar or sign in icon */}
        {isLoggedIn ? (
          <div className="relative" ref={mobileProfileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((p) => !p)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-white"
              aria-label="User menu"
            >
              {initials || <User size={16} />}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <p className="text-xs font-bold text-blue-900 truncate">{userName || "Valued Guest"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">BlueBird Member</p>
                </div>
                <div className="py-1.5">
                  <Link
                    to="/customer/dashboard"
                    onClick={() => { setProfileOpen(false); setSideBarOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <LayoutDashboard size={15} className="text-blue-500" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={15} className="text-rose-400" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/customerLogin")}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Sign in"
          >
            <User size={18} />
          </button>
        )}
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sideBarOpen && (
        <div
          className="fixed lg:hidden inset-0 bg-black/50 z-50"
          onClick={() => setSideBarOpen(false)}
        >
          <div
            className="bg-white w-72 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-gray-100 bg-gradient-to-r from-blue-950 to-blue-800">
              <img src={logo} alt="BlueBird Logo" className="h-12 object-contain brightness-200" />
              <button
                type="button"
                onClick={() => setSideBarOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <LuListCollapse className="text-2xl rotate-180" />
              </button>
            </div>

            {/* User greeting (if logged in) */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-blue-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                  {initials || <User size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-blue-900 truncate">{userName || "Valued Guest"}</p>
                  <p className="text-[10px] text-gray-400">BlueBird Member</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex flex-col text-sm font-medium text-gray-700 gap-1 px-3 pt-4 pb-2 flex-1 overflow-y-auto">
              {[
                { label: "Home", to: "/" },
                { label: "Reviews", to: "/reviews" },
                { label: "FAQ", to: "/faq" },
                { label: "Travels", to: "/booking/tour" },
                { label: "Vehicles", to: "/vehicles" },
                { label: "Gallery", to: "/gallery" },
                { label: "Contact", to: "/contact" },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setSideBarOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/customer/dashboard"
                      onClick={() => setSideBarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-800 hover:bg-emerald-50 font-semibold transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-emerald-600" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                    >
                      <LogOut size={16} className="text-rose-400" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/customerLogin"
                    onClick={() => setSideBarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                  >
                    <User size={16} className="text-blue-500" />
                    Sign In
                  </Link>
                )}

                {location.pathname !== "/booking" && (
                  <button
                    type="button"
                    onClick={() => { setSideBarOpen(false); navigate("/booking"); }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </nav>

            {/* Bottom weather strip */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              {isDay ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
              <span>Negombo &nbsp;·&nbsp; {weather !== null ? `${weather}°C` : "—"}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}