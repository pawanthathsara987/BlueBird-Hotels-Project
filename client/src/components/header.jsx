import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/bluebird logo.png";
import { LuListCollapse, LuMenu } from "react-icons/lu";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getWeather();
    const token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    sessionStorage.removeItem("customerToken");
    setIsLoggedIn(false);
    toast.success("Successfully logged out. We hope to welcome you back soon!", {
      style: {
        border: '1px solid #10b981',
        padding: '16px',
        color: '#065f46',
        fontWeight: 'bold',
        borderRadius: '16px',
        background: '#f0fdf4',
      }
    });
    navigate("/");
  };

  // determine local day/night based on hour (simple client-side heuristic)
  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const isDay = hour >= 6 && hour < 18;

  async function getWeather() {
    try {
      const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=7.2083&longitude=79.8358&current=temperature_2m");
      const temperature = response.data.current.temperature_2m;
      setWeather(temperature);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  return (
    <header className="w-full bg-white shadow-sm relative z-50">
      <div className="w-full px-4 lg:px-10 h-22.5 grid grid-cols-[1fr_auto_1fr] items-center">

        <div className="hidden lg:flex justify-start items-center gap-3 text-sm text-gray-600">
          <span>Negombo</span>
          <span className="flex items-center gap-2">
            {isDay ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-500" />
            )}
            <span>{weather !== null ? `${weather}°C` : "Loading..."}</span>
          </span>
        </div>

        <div className="flex lg:hidden justify-start">
          <button onClick={() => setSideBarOpen(true)}>
            <LuMenu className="text-3xl text-gray-700" />
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-center gap-8 font-medium">
          <Link to="/" className="hover:text-blue-600">HOME</Link>
          {isLoggedIn && (
            <Link to="/customer/dashboard" className="hover:text-emerald-700 text-emerald-800 font-extrabold tracking-wide">DASHBOARD</Link>
          )}
          <Link className="hover:text-blue-600">HOTELS</Link>
          <Link className="hover:text-blue-600">PAGES</Link>

          <img src={logo} alt="logo" className="h-20 object-contain" />

          <Link to="/booking/tour" className="hover:text-blue-600">TRAVELS</Link>
          <Link className="hover:text-blue-600">GALLERY</Link>
          <Link to="/contact" className="hover:text-blue-600">CONTACT</Link>
        </div>

        <div className="flex items-center gap-4 justify-end col-start-3">
          <div className="hidden lg:flex items-center gap-3 font-semibold">
            {isLoggedIn ? (
              <>
                <Link
                  to="/customer/dashboard"
                  className="px-4.5 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 rounded-2xl border border-emerald-250/50 transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  ✨ Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl border border-rose-200 transition-all duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/customerLogin")}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all duration-300 cursor-pointer"
              >
                Sign In
              </button>
            )}
            {location.pathname !== "/booking" && (
              <button
                type="button"
                onClick={() => {
                  navigate("/booking")
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-sky-600 via-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                Book Now
              </button>
            )}
          </div>

          <div className="flex lg:hidden items-center col-start-3">
            <img src={logo} alt="logo" className="h-12 object-contain" />
          </div>
        </div>
      </div>

      {sideBarOpen && (
        <div className="fixed lg:hidden w-screen h-screen top-0 left-0 bg-black/50 z-50 transition-all duration-300">
          <div className="bg-white w-62.5 h-full flex flex-col shadow-lg animate-in slide-in-from-left duration-300">
            <div className="w-full h-25 bg-accent flex justify-between items-center px-4 border-b">
              <img src={logo} alt="logo" className="h-14 object-contain" />
              <LuListCollapse
                onClick={() => setSideBarOpen(false)}
                className="text-gray-600 text-2xl cursor-pointer rotate-180 hover:text-red-500"
              />
            </div>

            <div className="flex flex-col text-lg font-medium text-gray-700 gap-6 p-6">
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                Home
              </Link>
              {isLoggedIn && (
                <Link className="text-emerald-800 font-extrabold hover:text-emerald-950 transition" to="/customer/dashboard" onClick={() => setSideBarOpen(false)}>
                  ✨ Dashboard
                </Link>
              )}
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                HOTELS
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                PAGES
              </Link>
              <Link className="hover:text-blue-600 transition" to="/booking/tour" onClick={() => setSideBarOpen(false)}>
                TRAVELS
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                GALLERY
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                CONTACT
              </Link>
              <hr className="border-gray-200 my-1" />
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setSideBarOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-rose-600 font-bold hover:text-rose-700 transition cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <Link className="text-blue-650 font-bold hover:text-blue-700 transition" to="/customerLogin" onClick={() => setSideBarOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}