import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/bluebird logo.png";
import { LuListCollapse, LuMenu } from "react-icons/lu";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getWeather();
  }, []);

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
          <Link className="hover:text-blue-600">HOTELS</Link>
          <Link className="hover:text-blue-600">PAGES</Link>

          <img src={logo} alt="logo" className="h-20 object-contain" />

          <Link to="/booking/tour" className="hover:text-blue-600">TRAVELS</Link>
          <Link className="hover:text-blue-600">GALLERY</Link>
          <Link to="/contact" className="hover:text-blue-600">CONTACT</Link>
        </div>

        <div className="flex items-center gap-4 justify-end col-start-3">
          <div className="hidden lg:flex items-center gap-3 font-semibold">
            <button
              onClick={() => navigate("/customerLogin")}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </button>
            {location.pathname !== "/booking" && (
              <button
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
              <Link className="text-blue-650 font-bold hover:text-blue-700 transition" to="/customerLogin" onClick={() => setSideBarOpen(false)}>
                Sign In
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}