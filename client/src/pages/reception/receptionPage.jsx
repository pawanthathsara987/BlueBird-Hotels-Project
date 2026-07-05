import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdCheckCircle, MdLogout, MdMenu, MdClose, MdNotifications, MdOutlineBookOnline, MdBarChart, MdLocalTaxi, MdTerrain } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Dashboard from "./Dashboard";
import Booking from "./booking";
import CheckIn from "./CheckIn";
import CheckOut from "./CheckOut";
import Reports from "./Reports";
import AirportPickups from "./AirportPickups";
import TourBookings from "./TourBookings";
import VehicleBookings from "./VehicleBookings";

export default function ReceptionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showNotifications, setShowNotifications] = useState(false);
    const [pickupAlerts, setPickupAlerts] = useState([]);
    const [dismissedAlerts, setDismissedAlerts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dismissed_pickup_alerts') || '[]'); }
        catch { return []; }
    });
    const [newAlertBanner, setNewAlertBanner] = useState(null);

    // Dynamic theme state synchronized with Dashboard customizer
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("saas_dashboard_theme");
        return saved ? JSON.parse(saved) : {
            mode: "light",
            accent: "indigo",
            cardStyle: "sleek",
            font: "sans"
        };
    });

    useEffect(() => {
        const updateTheme = () => {
            const saved = localStorage.getItem("saas_dashboard_theme");
            if (saved) setTheme(JSON.parse(saved));
        };
        window.addEventListener("theme_changed", updateTheme);
        window.addEventListener("storage", updateTheme);
        return () => {
            window.removeEventListener("theme_changed", updateTheme);
            window.removeEventListener("storage", updateTheme);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ---- Pickup Alert Polling (every 5 min) ----
    const fetchPickupAlerts = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/reception/pickup-alerts`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data?.success) {
                const alerts = res.data.data || [];
                setPickupAlerts(alerts);
                // Show banner for new urgent (6h) alerts not yet dismissed
                const dismissed = JSON.parse(localStorage.getItem('dismissed_pickup_alerts') || '[]');
                const newUrgent = alerts.find(a => a.urgency === 'urgent' && !dismissed.includes(`${a.id}_${a.type}`));
                if (newUrgent) setNewAlertBanner(newUrgent);
            }
        } catch (e) {
            // silent fail
        }
    };

    useEffect(() => {
        if (!authorized) return;
        fetchPickupAlerts();
        const poll = setInterval(fetchPickupAlerts, 5 * 60 * 1000); // every 5 min
        return () => clearInterval(poll);
    }, [authorized]);

    const dismissAlert = (alertId, alertType) => {
        const key = `${alertId}_${alertType}`;
        const updated = [...dismissedAlerts, key];
        setDismissedAlerts(updated);
        localStorage.setItem('dismissed_pickup_alerts', JSON.stringify(updated));
        if (newAlertBanner && `${newAlertBanner.id}_${newAlertBanner.type}` === key) {
            setNewAlertBanner(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/staffLogin");
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded || decoded.role !== "receptionist") {
                navigate("/staffLogin");
            } else {
                setAuthorized(true);
            }
        } catch (e) {
            localStorage.removeItem("token");
            navigate("/staffLogin");
        }
    }, [navigate]);

    // Accent mappings for active link items
    const accentColors = {
        indigo: { bg: "bg-indigo-600 text-white shadow-md", text: "text-indigo-600 dark:text-indigo-400" },
        teal: { bg: "bg-teal-600 text-white shadow-md", text: "text-teal-600 dark:text-teal-400" },
        violet: { bg: "bg-violet-600 text-white shadow-md", text: "text-violet-600 dark:text-violet-400" },
        amber: { bg: "bg-amber-600 text-white shadow-md", text: "text-amber-600 dark:text-amber-400" },
        rose: { bg: "bg-rose-600 text-white shadow-md", text: "text-rose-600 dark:text-rose-400" },
        slate: { bg: "bg-slate-700 text-white shadow-md", text: "text-slate-700 dark:text-slate-300" },
    };
    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        const fontClass = theme.font === "mono" ? "font-mono tracking-tight" : theme.font === "serif" ? "font-serif" : "font-sans";
        const baseClass = `flex items-center gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-semibold ${fontClass}`;

        if (isActive) {
            return `${baseClass} ${currentAccent.bg} -translate-y-0.5`;
        }
        return `${baseClass} ${theme.mode === "dark"
            ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`;
    };

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const receptionistName = user ? user.name : "Receptionist";
    const receptionistRole = user ? user.role : "receptionist";
    const userImageUrl = user ? user.imageUrl : null;

    if (!authorized) {
        return null;
    }

    const fontStyle = theme.font === "mono" ? "font-mono" : theme.font === "serif" ? "font-serif" : "font-sans";

    const formattedDate = currentTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    return (
        <div className={`w-full h-screen flex relative overflow-hidden ${fontStyle} ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-900"} ${theme.mode === "light" ? "light-mode-high-contrast" : ""} transition-colors duration-300`}>
            <style>{`
                .light-mode-high-contrast .text-slate-400 {
                    color: #475569 !important; /* slate-600 */
                }
                .light-mode-high-contrast .text-slate-500 {
                    color: #334155 !important; /* slate-700 */
                }
            `}</style>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden print:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed md:static z-30 w-72 md:w-64 lg:w-72 h-full flex flex-col transition-transform duration-300 print:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 shadow-lg md:shadow-none ${theme.mode === "dark"
                    ? "bg-slate-900 border-r border-slate-800/80"
                    : "bg-white border-r border-slate-200/60"
                }`}>
                
                {/* Reception Profile image, role under it, name under it */}
                <div className={`w-full py-7 flex flex-col items-center justify-center px-4 flex-shrink-0 border-b ${theme.mode === "dark" ? "border-slate-800/80" : "border-slate-100"
                    }`}>
                    <div className="relative group">
                        {userImageUrl ? (
                            <img
                                src={userImageUrl}
                                alt="Receptionist"
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 shadow-md transition-transform duration-300 group-hover:scale-103 ${theme.mode === "dark" ? "border-slate-800" : "border-slate-100"
                                    }`}
                            />
                        ) : (
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center font-black shadow-md ${theme.mode === "dark"
                                ? "bg-slate-800 border-slate-700 text-slate-300"
                                : "bg-slate-50 border-slate-100 text-slate-600"
                                }`}>
                                {receptionistName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    {/* Role & Name underneath */}
                    <div className="text-center mt-3.5 space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full tracking-wider uppercase ${theme.mode === "dark"
                            ? "text-slate-300 bg-slate-800/60 border border-slate-700/50"
                            : "text-slate-600 bg-slate-100 border border-slate-200"
                            }`}>
                            {receptionistRole}
                        </span>
                        <h2 className={`text-sm md:text-base font-bold tracking-wide truncate max-w-[200px] ${theme.mode === "dark" ? "text-slate-100" : "text-slate-800"
                            }`}>
                            {receptionistName}
                        </h2>
                    </div>
                </div>

                <nav className="w-full flex-1 flex flex-col px-4 pt-4 space-y-2 pb-6 overflow-y-auto">
                    <Link to="/reception" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception")}><MdDashboard className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Dashboard</span></Link>
                    <Link to="/reception/checkin" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkin")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-In</span></Link>
                    <Link to="/reception/checkout" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/checkout")}><MdCheckCircle className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Check-Out</span></Link>
                    <Link to="/reception/bookings" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/bookings")}><MdOutlineBookOnline className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Bookings</span></Link>
                    <Link to="/reception/pickups" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/pickups")}><MdLocalTaxi className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Airport Pickups</span></Link>
                    <Link to="/reception/vehicles" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/vehicles")}><MdLocalTaxi className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Vehicle Bookings</span></Link>
                    <Link to="/reception/tours" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/tours")}><MdTerrain className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Tour Bookings</span></Link>
                    <Link to="/reception/reports" onClick={() => setSidebarOpen(false)} className={getLinkClass("/reception/reports")}><MdBarChart className="text-xl md:text-2xl flex-shrink-0" /> <span className="truncate">Reports</span></Link>

                    <div className="mt-auto pt-6">
                        <button
                            onClick={() => {
                                setSidebarOpen(false);
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                delete axios.defaults.headers.common["Authorization"];
                                navigate("/staffLogin");
                            }}
                            className="flex items-center w-full text-left gap-3 px-4 py-3 text-sm md:text-base rounded-xl transition-all duration-300 font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-650 cursor-pointer"
                        >
                            <MdLogout className="text-xl md:text-2xl flex-shrink-0" />
                            <span className="truncate">Logout</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main workspace area with persistent top header containing clock */}
            <div className="flex-grow flex flex-col h-full overflow-hidden">
                
                {/* Persistent Top Header Bar with Centered Clock */}
                <header className={`w-full h-16 grid grid-cols-3 items-center px-6 border-b flex-shrink-0 z-40 transition-colors print:hidden ${
                    theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/60"
                }`}>
                    
                    {/* Left: Mobile hamburger menu toggle */}
                    <div className="flex items-center">
                        <button
                            className={`md:hidden p-2.5 rounded-xl shadow-xs transition-colors border ${
                                theme.mode === "dark"
                                ? "bg-slate-800 border-slate-700 text-slate-200"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                        </button>
                    </div>

                    {/* Middle: Centered Live Clock, Month, Day, Year */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <span className={`text-xs md:text-sm font-black tracking-wide uppercase ${
                            theme.mode === "dark" ? "text-teal-350" : "text-[#0d9488]"
                        }`}>
                            {formattedDate}
                        </span>
                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 ${
                            theme.mode === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}>
                            {formattedTime}
                        </span>
                    </div>

                    {/* Right: Notifications bell */}
                    <div className="flex items-center justify-end relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 relative cursor-pointer"
                        >
                            {/* Unread badge */}
                            {pickupAlerts.filter(a => !dismissedAlerts.includes(`${a.id}_${a.type}`)).length > 0 && (
                                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">
                                    {pickupAlerts.filter(a => !dismissedAlerts.includes(`${a.id}_${a.type}`)).length}
                                </span>
                            )}
                            <MdNotifications className="text-xl" />
                        </button>

                        {/* Notification Popup Dropdown */}
                        {showNotifications && (
                            <div className={`absolute right-0 top-12 w-88 rounded-2xl border p-4 shadow-xl z-50 transition-colors duration-350 ${
                                theme.mode === "dark" 
                                ? "bg-slate-900 border-slate-800 text-slate-100" 
                                : "bg-white border-slate-200 text-slate-800"
                            }`} style={{width: "340px"}}>
                                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                                    <h4 className="text-xs font-black tracking-wide text-[#0c325e] dark:text-teal-400 uppercase flex items-center gap-1.5">
                                        🚖 Airport Pickup Alerts
                                    </h4>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">
                                        {pickupAlerts.filter(a => !dismissedAlerts.includes(`${a.id}_${a.type}`)).length} Active
                                    </span>
                                </div>
                                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                    {pickupAlerts.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                                            <p className="text-2xl mb-1">✅</p>
                                            <p className="text-[11px] font-bold">No upcoming pickups in the next 24h</p>
                                        </div>
                                    ) : (
                                        pickupAlerts.map(alert => {
                                            const isDismissed = dismissedAlerts.includes(`${alert.id}_${alert.type}`);
                                            const isUrgent = alert.urgency === 'urgent';
                                            return (
                                                <div
                                                    key={`${alert.id}_${alert.type}`}
                                                    className={`p-3 rounded-xl text-xs space-y-1 text-left relative transition-opacity ${
                                                        isDismissed ? 'opacity-40' : ''
                                                    } ${isUrgent
                                                        ? 'bg-red-50/80 dark:bg-red-950/25 border border-red-200/50 dark:border-red-900/40 border-l-4 border-l-red-600'
                                                        : 'bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 border-l-4 border-l-amber-500'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className={`text-[10px] tracking-wide font-black ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                                            {isUrgent ? '🚨 URGENT — ' : '⏰ UPCOMING — '}
                                                            {isUrgent ? `In ${alert.hoursRemaining < 1 ? '<1h' : alert.hoursRemaining + 'h'}` : `In ${alert.hoursRemaining}h`}
                                                        </span>
                                                        {!isDismissed && (
                                                            <button
                                                                onClick={() => dismissAlert(alert.id, alert.type)}
                                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] leading-none ml-auto flex-shrink-0 cursor-pointer"
                                                                title="Dismiss"
                                                            >✕</button>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-800 dark:text-slate-100 text-[11px] font-bold leading-snug">
                                                        {alert.guestName}
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                                                        📍 {alert.pickup_location} &nbsp;·&nbsp; 🕐 {alert.pickup_time} &nbsp;·&nbsp; 👥 {alert.passenger_count} pax
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                                                        📅 {alert.pickup_date}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <button
                                    onClick={() => { setShowNotifications(false); window.location.href = '/reception/pickups'; }}
                                    className="mt-3 w-full text-center text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                                >
                                    View All Pickups →
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Urgent Pickup Alert Banner — floats at top of main content */}
                {newAlertBanner && !dismissedAlerts.includes(`${newAlertBanner.id}_${newAlertBanner.type}`) && (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-red-600 text-white text-xs font-bold shadow-md z-30 flex-shrink-0 print:hidden">
                        <span className="text-base">🚨</span>
                        <span className="flex-1">
                            <strong>AIRPORT PICKUP ALERT:</strong> {newAlertBanner.guestName} — {newAlertBanner.pickup_location} at {newAlertBanner.pickup_time} (in {newAlertBanner.hoursRemaining}h)
                        </span>
                        <button
                            onClick={() => dismissAlert(newAlertBanner.id, newAlertBanner.type)}
                            className="ml-auto px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-black cursor-pointer"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => { dismissAlert(newAlertBanner.id, newAlertBanner.type); window.location.href = '/reception/pickups'; }}
                            className="px-3 py-1 bg-white text-red-600 rounded-lg text-[11px] font-black cursor-pointer"
                        >
                            View Pickups
                        </button>
                    </div>
                )}

                {/* Content Panel */}
                <div className={`flex-grow h-full overflow-y-auto ${
                    theme.mode === "dark" ? "bg-slate-950" : "bg-slate-50/50"
                }`}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/checkin" element={<CheckIn />} />
                        <Route path="/checkout" element={<CheckOut />} />
                        <Route path="/bookings" element={<Booking />} />
                        <Route path="/pickups" element={<AirportPickups />} />
                        <Route path="/vehicles" element={<VehicleBookings />} />
                        <Route path="/tours" element={<TourBookings />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </div>
            </div>

        </div>
    );
}
