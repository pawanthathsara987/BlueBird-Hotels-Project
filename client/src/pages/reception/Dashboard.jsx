import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import {
    Sparkles,
    CheckCircle,
    User,
    Hotel,
    Calendar,
    RefreshCw,
    TrendingUp,
    DollarSign,
    ClipboardList,
    CheckSquare,
    Trash2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Settings,
    Moon,
    Sun,
    Activity,
    Bell,
    Layers,
    PieChart
} from "lucide-react";
import RoomStatusGrid from "../../components/admin/dashboard/RoomStatusGrid";
import { toast } from "react-hot-toast";
import { MdLocalTaxi, MdTerrain } from "react-icons/md";

export default function Dashboard() {
    // ----------------------------------------------------
    // 1. Unified State Management
    // ----------------------------------------------------
    const [availableRooms, setAvailableRooms] = useState(0);
    const [todayCheckIns, setTodayCheckIns] = useState(0);
    const [todayCheckOuts, setTodayCheckOuts] = useState(0);
    const [occupiedRooms, setOccupiedRooms] = useState(0);
    const [recentCheckIns, setRecentCheckIns] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [todayPickups, setTodayPickups] = useState(0);
    const [analyticsSummary, setAnalyticsSummary] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        roomsStats: { total: 0, available: 0, occupied: 0, maintenance: 0 },
        weeklyTrend: []
    });

    // RoomStatusGrid states
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Receptionist details
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const receptionistName = user ? user.name : "Receptionist";
    const receptionistRole = user ? user.role : "receptionist";
    const userImageUrl = user ? user.imageUrl : null;

    // ----------------------------------------------------
    // 2. Customizable Theme Engine Configuration
    // ----------------------------------------------------
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("saas_dashboard_theme");
        return saved ? JSON.parse(saved) : {
            mode: "light",
            accent: "indigo",
            cardStyle: "sleek",
            font: "sans"
        };
    });
    const [showThemePanel, setShowThemePanel] = useState(false);

    useEffect(() => {
        localStorage.setItem("saas_dashboard_theme", JSON.stringify(theme));
        window.dispatchEvent(new Event("theme_changed"));
    }, [theme]);

    // Accent mappings for tailwind classes
    const accentColors = {
        indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600", bgLight: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-100 dark:border-indigo-950", focusRing: "focus:ring-indigo-500", raw: "#6366f1" },
        emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600", bgLight: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-950", focusRing: "focus:ring-emerald-500", raw: "#10b981" },
        violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-600", bgLight: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-950", focusRing: "focus:ring-violet-500", raw: "#8b5cf6" },
        amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-600", bgLight: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-950", focusRing: "focus:ring-amber-500", raw: "#f59e0b" },
        rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600", bgLight: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-950", focusRing: "focus:ring-rose-500", raw: "#f43f5e" },
        slate: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-700", bgLight: "bg-slate-100 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-850", focusRing: "focus:ring-slate-500", raw: "#475569" },
    };

    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getCardStyle = () => {
        let style = "p-6 transition-all duration-300 relative overflow-hidden ";

        // Mode background colors
        if (theme.mode === "dark") {
            style += "bg-slate-900 text-slate-100 ";
        } else {
            style += "bg-white text-slate-800 ";
        }

        // Border / Shadows matching Stripe and Linear style
        if (theme.cardStyle === "sleek") {
            style += "shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md hover:border-slate-200/60 dark:hover:border-slate-700/80 rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "border border-slate-200/80 dark:border-slate-850 shadow-none rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border border-white/20 dark:border-slate-800/40 shadow-lg rounded-3xl ";
        }
        return style;
    };

    const getFontFamily = () => {
        if (theme.font === "mono") return "font-mono tracking-tight";
        if (theme.font === "serif") return "font-serif";
        return "font-sans";
    };

    // ----------------------------------------------------
    // 3. Unified Data Fetcher Function
    // ----------------------------------------------------
    const fetchDashboardData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [
                availableRes,
                checkInsRes,
                checkOutsRes,
                occupiedRes,
                recentCheckInsRes,
                recentBookingsRes,
                roomsRes,
                typesRes,
                analyticsRes,
                pickupsRes
            ] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/available-rooms`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/today-checkins`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/today-checkouts`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/occupied-rooms`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/recent-checkins`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/recent-bookings`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/rooms`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-types`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/analytics-summary`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/airport-pickups`)
            ]);

            setAvailableRooms(availableRes.data?.data?.availableRoom || availableRes.data?.data?.count || 0);
            setTodayCheckIns(checkInsRes.data?.data?.checkIns || checkInsRes.data?.data?.count || 0);
            setTodayCheckOuts(checkOutsRes.data?.data?.checkOuts || checkOutsRes.data?.data?.count || 0);
            setOccupiedRooms(occupiedRes.data?.data?.occupiedRooms || occupiedRes.data?.data?.count || 0);
            setRecentCheckIns(recentCheckInsRes.data?.data || recentCheckInsRes.data || []);
            setRecentBookings(recentBookingsRes.data?.data || recentBookingsRes.data || []);

            const todayStr = new Date().toISOString().split("T")[0];
            const pickupsCount = pickupsRes.data?.data?.filter(p => p.pickup_date === todayStr).length || 0;
            setTodayPickups(pickupsCount);

            if (analyticsRes.data && analyticsRes.data.success) {
                setAnalyticsSummary(analyticsRes.data.data || {});
            }
            if (roomsRes.data && roomsRes.data.success) {
                setRooms(roomsRes.data.data || []);
            }
            if (typesRes.data && typesRes.data.success) {
                setRoomTypes(typesRes.data.data || []);
            }

            if (isSilent) {
                toast.success("Dashboard content updated.");
            }
        } catch (error) {
            console.error("Dashboard refresh error:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/staffLogin";
            } else {
                toast.error("Failed to load live dashboard statistics.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ----------------------------------------------------
    // 4. Interactive Tasks Manager Engine (Saves to localStorage)
    // ----------------------------------------------------
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem("dashboard_tasks");
        return saved ? JSON.parse(saved) : [
            { id: 1, text: "Audit mini-bar invoice sheets", completed: false },
            { id: 2, text: "Verify check-in lists with room statuses", completed: true },
            { id: 3, text: "Update room status indicators on matrix", completed: false },
            { id: 4, text: "Coordinate room change request for suite 203", completed: false },
        ];
    });
    const [newTaskText, setNewTaskText] = useState("");
    const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState(null);

    useEffect(() => {
        localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
        setNewTaskText("");
        toast.success("Receptionist task registered.");
    };

    const handleToggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        setConfirmDeleteTaskId(null);
        toast.success("Task removed from checklist.");
    };

    // ----------------------------------------------------
    // 5. Dynamic Analytics Computations
    // ----------------------------------------------------
    const roomsStats = useMemo(() => {
        if (analyticsSummary.roomsStats && typeof analyticsSummary.roomsStats.total === "number") {
            return analyticsSummary.roomsStats;
        }
        const total = rooms.length;
        const occupied = rooms.filter(r => r.status?.toLowerCase() === "occupied").length;
        const maintenance = rooms.filter(r => r.status?.toLowerCase() === "maintenance").length;
        const available = Math.max(0, total - occupied - maintenance);
        return { total, occupied, maintenance, available };
    }, [rooms, analyticsSummary]);

    const totalRoomsCount = useMemo(() => {
        return roomsStats.total;
    }, [roomsStats]);

    const occupancyRate = useMemo(() => {
        if (totalRoomsCount === 0) return 0;
        return Math.round((occupiedRooms / totalRoomsCount) * 100);
    }, [occupiedRooms, totalRoomsCount]);

    // Total bookings count from analytics
    const totalBookingsCount = useMemo(() => {
        return analyticsSummary.totalBookings || 0;
    }, [analyticsSummary]);

    // Average room rate / total revenue from database room payments
    const dynamicRevenue = useMemo(() => {
        return analyticsSummary.totalRevenue || (occupiedRooms * 145);
    }, [analyticsSummary, occupiedRooms]);

    // ----------------------------------------------------
    // 6. Interactive Custom SVG Donut Chart Setup
    // ----------------------------------------------------
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

    const donutSegments = useMemo(() => {
        const total = roomsStats.available + roomsStats.occupied + roomsStats.maintenance || 1;
        const circ = 2 * Math.PI * 36; // R = 36, circ = 226.19

        let cumulativePercent = 0;
        return [
            { id: "available", label: "Available", value: roomsStats.available, color: "#10b981", percent: (roomsStats.available / total) * 100 },
            { id: "occupied", label: "Occupied", value: roomsStats.occupied, color: currentAccent.raw, percent: (roomsStats.occupied / total) * 100 },
            { id: "maintenance", label: "Maintenance", value: roomsStats.maintenance, color: "#ef4444", percent: (roomsStats.maintenance / total) * 100 },
        ].map(segment => {
            const dashArray = `${(segment.percent * circ) / 100} ${circ}`;
            const dashOffset = -((cumulativePercent * circ) / 100);
            cumulativePercent += segment.percent;
            return { ...segment, strokeDasharray: dashArray, strokeDashoffset: dashOffset };
        });
    }, [roomsStats, currentAccent]);

    // ----------------------------------------------------
    // 7. Interactive Custom SVG Area Trend Chart Setup
    // ----------------------------------------------------
    const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);
    const trendData = useMemo(() => {
        if (analyticsSummary.weeklyTrend && analyticsSummary.weeklyTrend.length > 0) {
            return analyticsSummary.weeklyTrend;
        }
        return [
            { day: "Mon", occupancy: Math.max(10, Math.round(occupancyRate * 0.8)), bookings: Math.max(2, recentBookings.length - 2) },
            { day: "Tue", occupancy: Math.max(15, Math.round(occupancyRate * 0.85)), bookings: Math.max(3, recentBookings.length - 1) },
            { day: "Wed", occupancy: Math.max(20, Math.round(occupancyRate * 0.9)), bookings: Math.max(4, recentBookings.length) },
            { day: "Thu", occupancy: Math.max(18, Math.round(occupancyRate * 0.95)), bookings: Math.max(3, recentBookings.length - 1) },
            { day: "Fri", occupancy: occupancyRate || 68, bookings: Math.max(5, recentBookings.length + 2) },
            { day: "Sat", occupancy: Math.min(100, Math.round(occupancyRate * 1.15)), bookings: Math.max(6, recentBookings.length + 4) },
            { day: "Sun", occupancy: Math.max(12, Math.round(occupancyRate * 0.75)), bookings: Math.max(3, recentBookings.length - 2) }
        ];
    }, [occupancyRate, recentBookings, analyticsSummary]);

    const trendPoints = useMemo(() => {
        const width = 500;
        const height = 180;
        const xOffset = 30;
        const yOffset = 20;

        return trendData.map((d, i) => {
            const x = ((width - xOffset - 10) / 6) * i + xOffset;
            const y = height - ((d.occupancy / 100) * (height - yOffset - 10)) - yOffset;
            return { x, y, ...d };
        });
    }, [trendData]);

    const trendSvgPath = useMemo(() => {
        if (trendPoints.length === 0) return "";
        let path = `M ${trendPoints[0].x} ${trendPoints[0].y}`;
        for (let i = 1; i < trendPoints.length; i++) {
            // Cubic bezier control points for curved aesthetics
            const prev = trendPoints[i - 1];
            const curr = trendPoints[i];
            const cp1x = prev.x + (curr.x - prev.x) / 2;
            const cp1y = prev.y;
            const cp2x = prev.x + (curr.x - prev.x) / 2;
            const cp2y = curr.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }
        return path;
    }, [trendPoints]);

    const trendSvgArea = useMemo(() => {
        if (trendPoints.length === 0) return "";
        return `${trendSvgPath} L ${trendPoints[trendPoints.length - 1].x} 160 L ${trendPoints[0].x} 160 Z`;
    }, [trendPoints, trendSvgPath]);

    // ----------------------------------------------------
    // 8. Notion-Style Bookings Table Filters & Pagination
    // ----------------------------------------------------
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
    const [bookingPage, setBookingPage] = useState(1);
    const bookingsPerPage = 5;

    const filteredBookings = useMemo(() => {
        const q = bookingSearch.toLowerCase().trim();
        return recentBookings.filter(b => {
            // Search: guest name, room number, or booking ID
            const matchName = `${b.firstName} ${b.lastName}`.toLowerCase().includes(q);
            const matchRoom = b.rooms?.toLowerCase().includes(q);
            const matchId = String(b.reservation_id).includes(q);
            const matchSearch = !q || matchName || matchRoom || matchId;

            // Determine effective status: room-level statuses take priority over booking-level
            let status = b.bookingStatus || "confirmed"; // booking-level: confirmed / cancelled / no_show
            if (b.roomStatuses?.includes('checked_in')) status = "checked_in";
            else if (b.roomStatuses?.includes('checked_out')) status = "checked_out";
            else if (b.roomStatuses?.includes('cancelled')) status = "cancelled";
            else if (b.bookingStatus === 'no_show' || b.bookingStatus === 'no-show') status = "no_show";

            const matchStatus = bookingStatusFilter === "all" || status === bookingStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [recentBookings, bookingSearch, bookingStatusFilter]);

    const paginatedBookings = useMemo(() => {
        const start = (bookingPage - 1) * bookingsPerPage;
        return filteredBookings.slice(start, start + bookingsPerPage);
    }, [filteredBookings, bookingPage]);

    const totalBookingPages = Math.ceil(filteredBookings.length / bookingsPerPage) || 1;

    // Reset pagination index if filters alter quantity
    useEffect(() => {
        setBookingPage(1);
    }, [bookingSearch, bookingStatusFilter]);

    // ----------------------------------------------------
    // 9. Live Activity Feed (from real database data)
    // ----------------------------------------------------
    const activities = useMemo(() => {
        const items = [];
        recentCheckIns.slice(0, 3).forEach((ci, i) => {
            items.push({
                id: `ci-${i}`,
                type: "checkin",
                text: `${ci.firstName} ${ci.lastName} checked in — Room${ci.rooms ? ' ' + ci.rooms : ''}`,
                time: ci.checkIn ? new Date(ci.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Today"
            });
        });
        recentBookings.slice(0, 3).forEach((b, i) => {
            const isCheckedOut = b.roomStatuses?.includes('checked_out');
            const isCheckedIn = b.roomStatuses?.includes('checked_in');
            items.push({
                id: `bk-${i}`,
                type: isCheckedOut ? "checkout" : isCheckedIn ? "checkin" : "booking",
                text: `${b.firstName} ${b.lastName} — ${isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Currently In' : 'Reservation confirmed'}${b.rooms ? ' · Room ' + b.rooms : ''}`,
                time: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recent"
            });
        });
        if (items.length === 0) {
            items.push({ id: 'empty', type: 'task', text: 'No recent activity recorded.', time: 'Now' });
        }
        return items.slice(0, 5);
    }, [recentCheckIns, recentBookings]);

    // Render Component
    return (
        <div className={`w-full min-h-screen ${getFontFamily()} ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-900"} ${theme.mode === "light" ? "light-mode-high-contrast" : ""} transition-colors duration-300 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8`}>
            <style>{`
                .light-mode-high-contrast .text-slate-400 {
                    color: #475569 !important; /* slate-600 */
                }
                .light-mode-high-contrast .text-slate-500 {
                    color: #334155 !important; /* slate-700 */
                }
                .light-mode-high-contrast .text-gray-400 {
                    color: #4b5563 !important; /* gray-600 */
                }
                .light-mode-high-contrast .text-gray-500 {
                    color: #374151 !important; /* gray-700 */
                }
            `}</style>

            {/* ----------------------------------------------------
                Header Section & Theme Selection panel
               ---------------------------------------------------- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-1 flex-grow">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${theme.mode === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                            <Sparkles size={12} className="animate-pulse" />
                            BLUEBIRD Hotel
                        </span>
                        {refreshing && (
                            <span className="text-[10px] text-slate-400 animate-pulse flex items-center gap-1">
                                <RefreshCw size={10} className="animate-spin" /> Updating...
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                        Welcome, <span className={currentAccent.text}>{receptionistName}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Operational summary, live matrix configurations, and theme-level customizations.
                    </p>
                </div>

                {/* Dashboard Settings & Refresh Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto z-10">
                    <button
                        onClick={() => setShowThemePanel(!showThemePanel)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition duration-200 border cursor-pointer ${showThemePanel
                            ? `${currentAccent.bg} text-white border-transparent`
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                    >
                        <Settings size={14} className={showThemePanel ? "animate-spin-slow" : ""} />
                        Customizer
                    </button>

                    <button
                        onClick={() => fetchDashboardData(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition duration-200 shadow-sm cursor-pointer"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        Sync Live
                    </button>

                    {/* Quick profile info */}
                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                        {userImageUrl ? (
                            <img src={userImageUrl} alt={receptionistName} className="w-7 h-7 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-extrabold text-xs">
                                {receptionistName[0].toUpperCase()}
                            </div>
                        )}
                        <div className="hidden lg:block text-left">
                            <h4 className="text-[11px] font-bold leading-tight">{receptionistName}</h4>
                            <p className="text-[9px] text-slate-400 capitalize">{receptionistRole}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customizer Dropdown Panel */}
            {showThemePanel && (
                <div className={`p-6 rounded-2xl border transition-all duration-300 animate-fadeIn ${theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Mode Select */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Dashboard Theme</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTheme({ ...theme, mode: "light" })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${theme.mode === "light"
                                        ? `${currentAccent.bg} text-white border-transparent`
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <Sun size={14} /> Light
                                </button>
                                <button
                                    onClick={() => setTheme({ ...theme, mode: "dark" })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${theme.mode === "dark"
                                        ? `${currentAccent.bg} text-white border-transparent`
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <Moon size={14} /> Dark
                                </button>
                            </div>
                        </div>

                        {/* Accent Color Select */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Accent Colors</h4>
                            <div className="grid grid-cols-6 gap-2">
                                {Object.keys(accentColors).map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTheme({ ...theme, accent: color })}
                                        style={{ backgroundColor: accentColors[color].raw }}
                                        className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 relative cursor-pointer ${theme.accent === color
                                            ? "border-slate-700 dark:border-white scale-110 shadow-md"
                                            : "border-transparent hover:border-slate-300"
                                            }`}
                                        title={color}
                                    >
                                        {theme.accent === color && (
                                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Styling Selector */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Card Layouts</h4>
                            <div className="flex gap-2">
                                {["sleek", "bordered", "glass"].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setTheme({ ...theme, cardStyle: style })}
                                        className={`flex-1 p-2 rounded-xl text-xs font-bold border capitalize transition cursor-pointer ${theme.cardStyle === style
                                            ? `${currentAccent.bg} text-white border-transparent`
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fonts Selector */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Interface Font</h4>
                            <div className="flex gap-2">
                                {["sans", "mono", "serif"].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => setTheme({ ...theme, font: font })}
                                        className={`flex-1 p-2 rounded-xl text-xs font-bold border capitalize transition cursor-pointer ${theme.font === font
                                            ? `${currentAccent.bg} text-white border-transparent`
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ----------------------------------------------------
                KPI Cards Section (Bookings, Revenue, Occupancy, Check-ins, Check-outs)
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

                {/* 1. Bookings Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl ${currentAccent.bgLight} ${currentAccent.text}`}>
                            <Calendar size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <TrendingUp size={10} /> +14.2%
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Bookings Quantity</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : recentBookings.length}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total processed reservations</p>
                    </div>
                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${currentAccent.bg} animate-ping opacity-75`} />
                </div>

                {/* 2. Projected Revenue Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <TrendingUp size={10} /> +9.8%
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Projected Revenue</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : `LKR ${dynamicRevenue.toLocaleString()}`}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Occupied rooms calculation</p>
                    </div>
                </div>

                {/* 3. Occupancy Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            <Activity size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            Stripe rate
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Occupancy Rate</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : `${occupancyRate}%`}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{occupiedRooms} Rooms currently occupied</p>
                    </div>
                </div>

                {/* 4. Check-Ins Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded-full">
                            Today
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Live Check-Ins</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : todayCheckIns}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Expected arrivals today</p>
                    </div>
                </div>

                {/* 5. Check-Outs Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                            <User size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded-full">
                            Today
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Live Check-Outs</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : todayCheckOuts}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Expected departures today</p>
                    </div>
                </div>

                {/* 6. Airport Pickups Card */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400">
                            <MdLocalTaxi size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded-full">
                            Today
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Airport Pickups</p>
                        <h3 className="text-2xl font-black">{loading ? "..." : todayPickups}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Expected pickup requests today</p>
                    </div>
                </div>

            </div>

            {/* ----------------------------------------------------
                Quick Actions Panel
               ---------------------------------------------------- */}
            <div className={`${getCardStyle()} border border-slate-100 dark:border-slate-800`}>
                <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <Sparkles size={16} className={currentAccent.text} />
                    Quick Actions Panel
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
                    <button onClick={() => window.location.href = "/reception/bookings?tab=new"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <Calendar className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">New Booking</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/bookings?tab=new"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <User className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Walk-in Guest</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/checkin"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <CheckCircle className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Check In</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/checkout"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <CheckSquare className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Check Out</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/checkin"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <Hotel className="w-5 h-5 text-violet-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Assign Room</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/reports"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <ClipboardList className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Generate Invoice</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/pickups"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <MdLocalTaxi className="w-5.5 h-5.5 text-teal-650 mb-1.5 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Airport Pickup</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/tours?action=new"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <MdTerrain className="w-5 h-5 text-green-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Book Tour</span>
                    </button>
                    <button onClick={() => window.location.href = "/reception/bookings"} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition cursor-pointer text-center group">
                        <Search className="w-5 h-5 text-slate-500 mb-2 group-hover:scale-110 transition" />
                        <span className="text-[11px] font-bold">Search Guest</span>
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------
                Interactive SVG Charts & Status Donuts
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Custom SVG Area Trend Chart */}
                <div className={`${getCardStyle()} lg:col-span-2 flex flex-col justify-between`}>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <TrendingUp size={16} className={currentAccent.text} />
                                Occupancy & Booking Analytics
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">7-Day trend projection dashboard</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentAccent.bgLight} ${currentAccent.text}`}>
                            Live Tracker
                        </span>
                    </div>

                    <div className="relative w-full h-[180px] mt-2">
                        {/* Custom Render SVG */}
                        <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={currentAccent.raw} stopOpacity="0.25" />
                                    <stop offset="100%" stopColor={currentAccent.raw} stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal guide lines */}
                            <line x1="30" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                            <line x1="30" y1="65" x2="490" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                            <line x1="30" y1="110" x2="490" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                            <line x1="30" y1="160" x2="490" y2="160" stroke="#cbd5e1" className="dark:stroke-slate-700" />

                            {/* Main Area Path */}
                            {!loading && trendSvgArea && (
                                <path d={trendSvgArea} fill="url(#chartGradient)" className="transition-all duration-500" />
                            )}

                            {/* Main Line Path */}
                            {!loading && trendSvgPath && (
                                <path
                                    d={trendSvgPath}
                                    fill="none"
                                    stroke={currentAccent.raw}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    className="transition-all duration-500"
                                />
                            )}

                            {/* Hotspots / Interactive dots */}
                            {!loading && trendPoints.map((point, i) => (
                                <g key={i}>
                                    {/* Hover hotspot area */}
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="12"
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredTrendPoint(i)}
                                        onMouseLeave={() => setHoveredTrendPoint(null)}
                                    />
                                    {/* Real visible dot */}
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredTrendPoint === i ? "6" : "4"}
                                        fill={hoveredTrendPoint === i ? currentAccent.raw : "white"}
                                        stroke={currentAccent.raw}
                                        strokeWidth="2"
                                        className="transition-all duration-200 cursor-pointer pointer-events-none"
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Interactive Tooltip Overlay */}
                        {hoveredTrendPoint !== null && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${(trendPoints[hoveredTrendPoint].x / 500) * 100}%`,
                                    top: `${(trendPoints[hoveredTrendPoint].y / 180) * 100 - 30}%`,
                                    transform: "translateX(-50%)"
                                }}
                                className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] p-2 rounded-lg shadow-xl pointer-events-none z-20 flex flex-col gap-0.5 border border-slate-800/20 whitespace-nowrap animate-scaleUp"
                            >
                                <span className="font-extrabold border-b border-slate-800/10 dark:border-slate-100/10 pb-0.5">
                                    {trendPoints[hoveredTrendPoint].day} Overview
                                </span>
                                <span>Occupancy: <strong>{trendPoints[hoveredTrendPoint].occupancy}%</strong></span>
                                <span>Reservations: <strong>{trendPoints[hoveredTrendPoint].bookings} rooms</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Chart X axis text */}
                    <div className="flex justify-between items-center px-[30px] pt-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                        {trendData.map((d, i) => (
                            <span key={i} className={hoveredTrendPoint === i ? currentAccent.text : ""}>
                                {d.day}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Custom SVG Interactive Donut Chart */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <PieChart size={16} className={currentAccent.text} />
                                Allocation status
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total room matrix breakdown</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2 space-y-4">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                                {/* Base Circle */}
                                <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800" />

                                {/* Segment circles */}
                                {!loading && donutSegments.map((seg, i) => (
                                    <circle
                                        key={i}
                                        cx="45"
                                        cy="45"
                                        r="36"
                                        fill="transparent"
                                        stroke={seg.color}
                                        strokeWidth={hoveredDonutSegment === seg.id ? "11" : "8"}
                                        strokeDasharray={seg.strokeDasharray}
                                        strokeDashoffset={seg.strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-300 cursor-pointer"
                                        onMouseEnter={() => setHoveredDonutSegment(seg.id)}
                                        onMouseLeave={() => setHoveredDonutSegment(null)}
                                    />
                                ))}
                            </svg>
                            {/* Inner statistics details */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <h4 className="text-xl font-black">
                                    {loading ? "..." : (hoveredDonutSegment ? roomsStats[hoveredDonutSegment === "available" ? "available" : hoveredDonutSegment === "occupied" ? "occupied" : "maintenance"] : totalRoomsCount)}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-none">
                                    {hoveredDonutSegment ? hoveredDonutSegment : "Total Rooms"}
                                </p>
                            </div>
                        </div>

                        {/* Legends */}
                        <div className="w-full grid grid-cols-3 gap-2 pt-2 text-center">
                            {donutSegments.map((seg, i) => (
                                <div
                                    key={i}
                                    onMouseEnter={() => setHoveredDonutSegment(seg.id)}
                                    onMouseLeave={() => setHoveredDonutSegment(null)}
                                    className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${hoveredDonutSegment === seg.id ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{seg.label}</span>
                                    </div>
                                    <h5 className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">
                                        {loading ? "..." : seg.value} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({Math.round(seg.percent)}%)</span>
                                    </h5>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* ----------------------------------------------------
                Room Status Grid Allocation Matrix (Preserved existing feature)
               ---------------------------------------------------- */}
            <RoomStatusGrid
                loading={loading}
                rooms={rooms}
                roomTypes={roomTypes}
            />

            {/* ----------------------------------------------------
                Hotel BlueBird Tasks Manager, Recent Bookings, Live Activities
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Tasks Management Checklist */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <ClipboardList size={16} className={currentAccent.text} />
                                Front Desk Checklist
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Daily checklist & routine logs</p>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                            Shift Tasks
                        </span>
                    </div>

                    {/* Add Task Input Form */}
                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Add routine checklist task..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            className={`flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 ${currentAccent.focusRing}`}
                        />
                        <button
                            type="submit"
                            className={`p-2 rounded-xl text-white hover:scale-102 transition cursor-pointer ${currentAccent.bg}`}
                        >
                            <Plus size={14} />
                        </button>
                    </form>

                    {/* Tasks List */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-50 dark:border-slate-800 transition duration-150 ${task.completed ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-70" : "bg-white dark:bg-slate-900"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleTask(task.id)}
                                        className={`p-0.5 rounded-md border transition-all cursor-pointer ${task.completed
                                            ? `${currentAccent.bg} text-white border-transparent`
                                            : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <CheckSquare size={12} className={task.completed ? "opacity-100" : "opacity-0"} />
                                    </button>
                                    <span className={`text-xs truncate ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                                        {task.text}
                                    </span>
                                </div>
                                {confirmDeleteTaskId === task.id ? (
                                    <div className="flex items-center gap-1 ml-2 animate-fade-in">
                                        <span className="text-[10px] font-bold text-red-500 whitespace-nowrap">Delete?</span>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            title="Confirm delete"
                                            className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteTaskId(null)}
                                            title="Cancel"
                                            className="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDeleteTaskId(task.id)}
                                        className="text-slate-300 hover:text-red-500 transition ml-2 cursor-pointer"
                                        title="Delete task"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-slate-400 text-xs py-8 text-center">All shift tasks successfully completed.</p>
                        )}
                    </div>
                </div>

                {/* 2. Notion-style Recent Bookings Panel */}
                <div className={`${getCardStyle()} lg:col-span-2 flex flex-col justify-between`}>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-1.5">
                                    <Layers size={16} className={currentAccent.text} />
                                    Recent Reservation Bookings
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Search by guest name, booking ID, or filter by status</p>
                            </div>

                            {/* Filters & search */}
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-grow sm:flex-grow-0">
                                    <input
                                        type="text"
                                        placeholder="Name, room or ID..."
                                        value={bookingSearch}
                                        onChange={(e) => setBookingSearch(e.target.value)}
                                        className="w-full sm:w-44 pl-7 pr-3 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1"
                                    />
                                    <Search size={10} className="absolute left-2.5 top-2.5 text-slate-400" />
                                    {bookingSearch && (
                                        <button
                                            onClick={() => setBookingSearch("")}
                                            className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <select
                                    value={bookingStatusFilter}
                                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                                    className="px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg focus:outline-none cursor-pointer"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="checked_in">Checked-in</option>
                                    <option value="checked_out">Checked-out</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No-show</option>
                                </select>
                            </div>
                        </div>

                        {/* Bookings List */}
                        <div className="space-y-2 min-h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="text-slate-400 text-xs">Loading bookings...</p>
                                    </div>
                                </div>
                            ) : paginatedBookings.length > 0 ? (
                                paginatedBookings.map((booking) => {
                                    // Determine status
                                    const isCheckedIn = booking.roomStatuses?.includes('checked_in');
                                    const isCheckedOut = booking.roomStatuses?.includes('checked_out');
                                    const isCancelled = booking.roomStatuses?.includes('cancelled') || booking.bookingStatus === 'cancelled';
                                    const isNoShow = booking.bookingStatus === 'no_show' || booking.bookingStatus === 'no-show';

                                    let badgeBg, badgeText, badgeDot;
                                    if (isCheckedIn) {
                                        badgeBg = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/30 text-emerald-600 dark:text-emerald-400";
                                        badgeText = "Checked-in"; badgeDot = "bg-emerald-500";
                                    } else if (isCheckedOut) {
                                        badgeBg = "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400";
                                        badgeText = "Checked-out"; badgeDot = "bg-slate-400";
                                    } else if (isCancelled) {
                                        badgeBg = "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-950/30 text-red-600 dark:text-red-400";
                                        badgeText = "Cancelled"; badgeDot = "bg-red-500";
                                    } else if (isNoShow) {
                                        badgeBg = "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-950/30 text-orange-600 dark:text-orange-400";
                                        badgeText = "No-show"; badgeDot = "bg-orange-500";
                                    } else {
                                        badgeBg = "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-950/30 text-blue-600 dark:text-blue-400";
                                        badgeText = "Confirmed"; badgeDot = "bg-blue-500";
                                    }

                                    return (
                                        <div
                                            key={booking.reservation_id}
                                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-50 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition duration-150"
                                        >
                                            {/* Left: Guest info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-xs">{booking.firstName} {booking.lastName}</h4>
                                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        #{booking.reservation_id}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-1">
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        Check-in: <span className="font-semibold">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</span>
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        Check-out: <span className="font-semibold">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</span>
                                                    </p>
                                                    {booking.total_price && (
                                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                            LKR {Number(booking.total_price).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Room chips + status badge */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="flex gap-1 flex-wrap">
                                                    {booking.rooms?.split(",").slice(0, 3).map((room, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40 text-[9px] font-bold px-1.5 py-0.5 rounded"
                                                        >
                                                            R-{room.trim()}
                                                        </span>
                                                    ))}
                                                    {booking.rooms?.split(",").length > 3 && (
                                                        <span className="text-[9px] text-slate-400 font-bold px-1">
                                                            +{booking.rooms.split(",").length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`${badgeBg} border text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${badgeDot} inline-block`} />
                                                    {badgeText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Layers size={14} className="text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 text-xs text-center">
                                        {bookingSearch || bookingStatusFilter !== "all"
                                            ? "No bookings match your search or filter."
                                            : "No bookings recorded yet."}
                                    </p>
                                    {(bookingSearch || bookingStatusFilter !== "all") && (
                                        <button
                                            onClick={() => { setBookingSearch(""); setBookingStatusFilter("all"); }}
                                            className="text-[10px] font-bold text-blue-500 hover:text-blue-600 underline cursor-pointer"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notion-style Pagination Control */}
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 text-[10px] text-slate-400 font-bold">
                        <span>
                            Showing {Math.min(filteredBookings.length, (bookingPage - 1) * bookingsPerPage + 1)} - {Math.min(filteredBookings.length, bookingPage * bookingsPerPage)} of {filteredBookings.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={bookingPage === 1}
                                onClick={() => setBookingPage(bookingPage - 1)}
                                className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                            >
                                <ChevronLeft size={12} />
                            </button>
                            <button
                                disabled={bookingPage === totalBookingPages}
                                onClick={() => setBookingPage(bookingPage + 1)}
                                className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                            >
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ----------------------------------------------------
                Analytics & Live Shift activity Feed
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Live Activity Feed */}
                <div className={getCardStyle()}>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <Bell size={16} className={currentAccent.text} />
                                Live Shift Activity Feed
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Real-time terminal event log</p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>

                    <div className="space-y-4">
                        {activities.map((act) => (
                            <div key={act.id} className="flex gap-3 text-xs">
                                <div className="mt-0.5 flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${act.type === "checkin" ? "bg-emerald-500 border-emerald-200" :
                                        act.type === "checkout" ? "bg-red-500 border-red-200" :
                                            act.type === "booking" ? "bg-blue-500 border-blue-200" :
                                                "bg-slate-500 border-slate-200"
                                        }`} />
                                    <div className="w-0.5 h-10 bg-slate-100 dark:bg-slate-800 mt-1" />
                                </div>
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-slate-700 dark:text-slate-300 font-medium">{act.text}</p>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Deeper Operational Analytics */}
                <div className={`${getCardStyle()} lg:col-span-2`}>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <Layers size={16} className={currentAccent.text} />
                                Hotel BlueBird Analytics Summary
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">ADR, RevPAR, and occupancy indexes</p>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                            Q3 Overview
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                        <div className="p-4 bg-slate-100/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/50">
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Average Daily Rate (ADR)</h5>
                            <h3 className="text-xl font-black mt-1 text-slate-800 dark:text-white">
                                {loading ? "..." : (occupiedRooms > 0 ? `LKR ${Math.round(dynamicRevenue / occupiedRooms).toLocaleString()}` : "N/A")}
                            </h3>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                Revenue ÷ occupied rooms
                            </p>
                        </div>

                        <div className="p-4 bg-slate-100/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/50">
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Revenue Per Available Room (RevPAR)</h5>
                            <h3 className="text-xl font-black mt-1 text-slate-800 dark:text-white">
                                {loading ? "..." : (totalRoomsCount > 0 ? `LKR ${Math.round(dynamicRevenue / totalRoomsCount).toLocaleString()}` : "N/A")}
                            </h3>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                Total revenue ÷ total rooms
                            </p>
                        </div>

                        <div className="p-4 bg-slate-100/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/50">
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Today's Traffic</h5>
                            <h3 className="text-xl font-black mt-1 text-slate-800 dark:text-white">
                                {loading ? "..." : (todayCheckIns + todayCheckOuts)} guests
                            </h3>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <span className="text-blue-600 dark:text-blue-500 font-bold">{loading ? "..." : todayCheckIns} in</span> &nbsp;·&nbsp; <span className="text-orange-600 dark:text-orange-500 font-bold">{loading ? "..." : todayCheckOuts} out</span>
                            </p>
                        </div>
                    </div>

                    {/* Operational Tips Banner */}
                    <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"
                        }`}>
                        <div className={`p-2 rounded-lg ${currentAccent.bg} text-white hidden sm:block`}>
                            <Sparkles size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white">Linear Smart Suggestion</h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Current occupancy is at <strong className="text-slate-700 dark:text-slate-200">{occupancyRate}%</strong>. Consider launching package loyalty upgrades to raise ADR averages for expected walk-in requests.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
