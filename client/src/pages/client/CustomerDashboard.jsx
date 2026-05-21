import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Search, 
  MapPin, 
  Users, 
  CreditCard, 
  Clock, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  Filter, 
  Compass, 
  X, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Footer from "../../components/footer";

// Helper to decode JWT client-side safely without a library if needed, 
// though we have jwt-decode. We will use a safe try/catch with jwtDecode.
import { jwtDecode } from "jwt-decode";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'upcoming', 'completed', 'cancelled'
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  
  // Modal states
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [modifyingBooking, setModifyingBooking] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Mock Bookings Data with high fidelity details matching the resort's schema
  const [bookings, setBookings] = useState([
    {
      id: "RES-98214",
      roomType: "Sunset Beach Villa",
      boardType: "Full Board",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      checkIn: "2026-06-15",
      checkOut: "2026-06-20",
      nights: 5,
      adults: 2,
      children: 2,
      childAges: [4, 8],
      status: "upcoming", // upcoming, completed, cancelled
      totalPrice: 4650.00,
      notes: "High floor request, celebrating wedding anniversary.",
      airportPickup: {
        enabled: true,
        pickupDate: "2026-06-15",
        pickupTime: "14:30"
      }
    },
    {
      id: "RES-87105",
      roomType: "Deluxe King Room",
      boardType: "Bed & Breakfast",
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
      checkIn: "2026-04-10",
      checkOut: "2026-04-12",
      nights: 2,
      adults: 2,
      children: 0,
      childAges: [],
      status: "completed",
      totalPrice: 580.00,
      notes: "Late check-in requested.",
      airportPickup: {
        enabled: false
      }
    },
    {
      id: "RES-76342",
      roomType: "Ocean Front Suite",
      boardType: "Half Board",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
      checkIn: "2026-02-05",
      checkOut: "2026-02-08",
      nights: 3,
      adults: 2,
      children: 1,
      childAges: [6],
      status: "cancelled",
      totalPrice: 1620.00,
      notes: "Request ocean facing view close to resort spa.",
      airportPickup: {
        enabled: true,
        pickupDate: "2026-02-05",
        pickupTime: "10:15"
      }
    }
  ]);

  // Handle Token decoding & Authentication check
  useEffect(() => {
    const token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (err) {
        console.error("Token decoding error:", err);
        // Set standard luxury guest mockup details if decoding fails or testing
        setCurrentUser({
          firstName: "Evelyn",
          lastName: "Harcourt",
          email: "evelyn.harcourt@luxurytravel.com",
          country: "United Kingdom",
          phoneNumber: "+44 7700 900077"
        });
      }
    } else {
      // Set mockup default values for demo/preview purposes since it's a dummy interface
      setCurrentUser({
        firstName: "Alexander",
        lastName: "Vanderbilt",
        email: "alexander.vanderbilt@luxury.com",
        country: "United States",
        phoneNumber: "+1 (555) 019-2834"
      });
    }
  }, []);

  // Filter and Search logic
  const filteredBookings = bookings.filter((booking) => {
    // 1. Tab Status Filter
    if (activeTab !== "all" && booking.status !== activeTab) {
      return false;
    }

    // 2. Search Query (matches reservation id, room type, or board type)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchId = booking.id.toLowerCase().includes(query);
      const matchRoom = booking.roomType.toLowerCase().includes(query);
      const matchBoard = booking.boardType.toLowerCase().includes(query);
      if (!matchId && !matchRoom && !matchBoard) {
        return false;
      }
    }

    // 3. Date Filters
    if (startDateFilter) {
      const checkInDate = parseISO(booking.checkIn);
      const startFilter = parseISO(startDateFilter);
      if (isBefore(checkInDate, startFilter)) {
        return false;
      }
    }
    if (endDateFilter) {
      const checkInDate = parseISO(booking.checkIn);
      const endFilter = parseISO(endDateFilter);
      if (isAfter(checkInDate, endFilter)) {
        return false;
      }
    }

    return true;
  });

  // Action: Confirm Cancellation
  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    
    // Update local state dynamically
    setBookings(prev => 
      prev.map(b => b.id === cancellingBooking.id ? { ...b, status: "cancelled" } : b)
    );
    
    toast.success(`Booking ${cancellingBooking.id} has been successfully cancelled.`, {
      style: {
        border: '1px solid #10b981',
        padding: '16px',
        color: '#065f46',
        fontWeight: 'bold',
        borderRadius: '16px',
        background: '#f0fdf4',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    });
    
    setCancellingBooking(null);
  };

  // Action: Modify Booking (Mock updates)
  const handleModifySubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newNotes = data.get("notes");
    
    setBookings(prev => 
      prev.map(b => b.id === modifyingBooking.id ? { ...b, notes: newNotes } : b)
    );

    toast.success(`Booking ${modifyingBooking.id} modified successfully!`, {
      style: {
        border: '1px solid #059669',
        padding: '16px',
        color: '#064e3b',
        fontWeight: 'bold',
        borderRadius: '16px',
        background: '#ecfdf5',
      }
    });

    setModifyingBooking(null);
  };

  // Statistics counters
  const totalSpend = bookings
    .filter(b => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const activeCount = bookings.filter(b => b.status === "upcoming").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-stone-50"
      style={{
        background: "linear-gradient(180deg, #f5f2eb 0%, #f9f8f5 40%, #f0f4f1 100%)",
      }}
    >
      {/* Background Ambient Luxury Glows */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-800/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none z-0" />
      
      <Header />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 space-y-10">
        
        {/* VIP Welcome Header Hero Grid */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-[0_20px_50px_rgba(28,25,23,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-50/50 blur-[50px] pointer-events-none" />
          
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-800 text-white px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3 h-3 animate-pulse text-amber-300" /> Bluebird VIP Guest
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-stone-850 tracking-tight">
              Bonjour, <span className="bg-gradient-to-r from-emerald-850 to-emerald-700 bg-clip-text text-transparent">{currentUser?.firstName || "Luxury"} {currentUser?.lastName || "Guest"}</span>
            </h1>
            <p className="text-sm text-stone-500 font-semibold max-w-md">
              Welcome back to your private sanctuary workspace. Manage your elite bookings, dining packages, and customizable check-in requests.
            </p>
          </div>

          {/* Member Card Details */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl p-5 border border-stone-800 shadow-md shrink-0 w-full sm:w-80 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300">Island Elite Circle</span>
              <Compass className="w-5 h-5 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Account Member</span>
              <span className="text-sm font-bold tracking-wide">{currentUser?.email || "guest@bluebird.com"}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-800/80 text-xs">
              <div>
                <span className="text-[9px] text-stone-400 block uppercase font-bold">Country</span>
                <span className="font-semibold">{currentUser?.country || "International"}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-stone-400 block uppercase font-bold">Level tier</span>
                <span className="text-amber-300 font-black uppercase tracking-wider">Gold Elite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Stays Statistics Counter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-450 uppercase tracking-widest block">Active Stays</span>
              <span className="text-2xl font-black text-stone-800">{activeCount}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-450 uppercase tracking-widest block">Past Journeys</span>
              <span className="text-2xl font-black text-stone-800">{completedCount}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-250/50 text-stone-700">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-450 uppercase tracking-widest block">Total Invested</span>
              <span className="text-2xl font-black text-stone-800">${totalSpend.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-450 uppercase tracking-widest block">Loyalty Points</span>
              <span className="text-2xl font-black text-stone-800">{(totalSpend * 0.1).toFixed(0)} pts</span>
            </div>
          </div>
          
        </div>

        {/* Filter and Content Controls Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-stone-200/90 shadow-sm space-y-5">
          
          {/* Header Controls Block */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            
            {/* Interactive Luxury Tab Indicators */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Reservations" },
                { id: "upcoming", label: "Upcoming Stays" },
                { id: "completed", label: "Completed Stays" },
                { id: "cancelled", label: "Canceled Stays" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 border ${
                    activeTab === tab.id
                      ? "bg-emerald-850 hover:bg-emerald-950 text-white border-emerald-900/10 shadow-sm active:scale-98"
                      : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400 cursor-pointer active:scale-98"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Fast search filter bar */}
            <div className="relative w-full lg:w-80 shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search package name, id..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white/70 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 transition"
              />
            </div>
            
          </div>

          {/* Date Range History Filtering */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50/60 p-4 rounded-xl border border-stone-150/65">
            <span className="text-xs uppercase font-extrabold tracking-widest text-stone-450 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-800" /> History Filter:
            </span>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400">From</span>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-stone-250 bg-white rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400">To</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-stone-250 bg-white rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              
              {(startDateFilter || endDateFilter || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDateFilter("");
                    setEndDateFilter("");
                    setSearchQuery("");
                  }}
                  className="text-xs font-extrabold text-rose-600 hover:text-rose-800 underline uppercase tracking-wider ml-auto sm:ml-4 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Bookings Display Container */}
          <div className="space-y-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col lg:flex-row relative group ${
                    booking.status === "cancelled" ? "border-stone-200/70 opacity-80" : "border-stone-200/90"
                  }`}
                >
                  {/* Glowing vertical side accent tags */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    booking.status === "upcoming" 
                      ? "bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.4)]" 
                      : booking.status === "completed" 
                        ? "bg-amber-500" 
                        : "bg-stone-400"
                  }`} />

                  {/* Left Side: Thumbnail Preview */}
                  <div className="relative w-full lg:w-72 h-44 lg:h-auto shrink-0 overflow-hidden">
                    <img
                      src={booking.image}
                      alt={booking.roomType}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                    />
                    
                    {/* Floating Luxury Board Type Tag */}
                    <div className="absolute top-3 left-4 bg-stone-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-stone-700">
                      {booking.boardType}
                    </div>

                    {/* Overlay shading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Middle Area: Detailed Metadata grid */}
                  <div className="flex-1 p-5 md:p-6 space-y-4">
                    
                    {/* Upper row: Booking Code, Status Tag, Dates */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">Reservation Code</span>
                        <span className="text-stone-850 font-black text-sm tracking-tight">{booking.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Interactive Status Indicator Badges */}
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-3xs transition flex items-center gap-1.5 ${
                          booking.status === "upcoming"
                            ? "bg-emerald-50 text-emerald-850 border-emerald-250"
                            : booking.status === "completed"
                              ? "bg-amber-50 text-amber-800 border-amber-250"
                              : "bg-rose-50 text-rose-800 border-rose-250"
                        }`}>
                          {booking.status === "upcoming" && <Clock className="w-3 h-3 text-emerald-800 animate-pulse" />}
                          {booking.status === "completed" && <CheckCircle className="w-3 h-3 text-amber-600" />}
                          {booking.status === "cancelled" && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle grid row: Stay detail columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-800">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">Arrive</span>
                        <span className="text-xs font-black text-stone-750 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                          {format(parseISO(booking.checkIn), "dd MMM, yyyy")}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 block capitalize">
                          {format(parseISO(booking.checkIn), "eeee")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">Depart</span>
                        <span className="text-xs font-black text-stone-750 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                          {format(parseISO(booking.checkOut), "dd MMM, yyyy")}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 block capitalize">
                          {format(parseISO(booking.checkOut), "eeee")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">Guests & Stay</span>
                        <span className="text-xs font-black text-stone-750 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-800" />
                          {booking.adults + booking.children} Guests
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 block">
                          {booking.nights} {booking.nights === 1 ? "Night" : "Nights"} • {booking.adults} Ad {booking.children > 0 ? `• ${booking.children} Ch` : ""}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">Invested amount</span>
                        <span className="text-sm font-black text-emerald-900 block">
                          ${booking.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-stone-450 block uppercase tracking-wider">
                          ${(booking.totalPrice / booking.nights).toFixed(0)} / night avg
                        </span>
                      </div>
                      
                    </div>

                    {/* Bottom notes & pickup tags if active */}
                    <div className="pt-3.5 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50 p-3 rounded-xl">
                      <p className="text-xs font-semibold text-stone-500 leading-relaxed max-w-xl">
                        <span className="font-bold text-stone-450 uppercase text-[10px] tracking-wider block mb-0.5">Sanctuary Personal Requests</span>
                        {booking.notes || "No special requests listed."}
                      </p>
                      
                      {booking.airportPickup?.enabled && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-850 border border-emerald-200/50 px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 self-start md:self-auto animate-fadeIn">
                          ✈️ Pickup: {booking.airportPickup.pickupTime} ({format(parseISO(booking.airportPickup.pickupDate), "dd MMM")})
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Right Side: Action Decks (Cancel, Modify, etc.) */}
                  <div className="border-t lg:border-t-0 lg:border-l border-stone-200/70 p-5 bg-stone-50/50 shrink-0 w-full lg:w-48 flex flex-row lg:flex-col justify-center gap-3">
                    
                    {booking.status === "upcoming" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setModifyingBooking(booking)}
                          className="flex-1 w-full font-bold uppercase text-[10px] tracking-widest py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-750 border border-stone-250 shadow-3xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Modify Stay
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(booking)}
                          className="flex-1 w-full font-bold uppercase text-[10px] tracking-widest py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 shadow-3xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel Stay
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(booking)}
                          className="flex-1 w-full font-bold uppercase text-[10px] tracking-widest py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-750 border border-stone-250 shadow-3xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Invoice
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => navigate("/booking")}
                          className="flex-1 w-full font-bold uppercase text-[10px] tracking-widest py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-950/10 shadow-3xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          Book Again <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    
                  </div>
                  
                </div>
              ))
            ) : (
              // Empty Search / Filter Results State
              <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Compass className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-stone-800 font-extrabold text-lg tracking-tight">No Stays Found</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-md mx-auto">
                  We couldn't find any stays that fit your filter criteria. Try adjusting the search query, check-in dates, or switching booking tabs.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                    setStartDateFilter("");
                    setEndDateFilter("");
                  }}
                  className="font-extrabold uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white transition active:scale-95 shadow-3xs cursor-pointer border border-emerald-900/10"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <Footer />

      {/* ──────────────── MODAL 1: CANCEL STAY MODAL ──────────────── */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200/90 shadow-2xl p-6 relative overflow-hidden space-y-6">
            
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-rose-50/50 blur-[20px] pointer-events-none" />
            
            <button
              type="button"
              onClick={() => setCancellingBooking(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
                <Trash2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-stone-850 font-black text-lg tracking-tight">Cancel Sanctuary Stay</h3>
                <p className="text-[10px] text-stone-450 uppercase font-extrabold tracking-widest mt-0.5">Code: {cancellingBooking.id}</p>
              </div>
            </div>

            <div className="space-y-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-150 text-xs">
              <div className="flex justify-between font-semibold text-stone-500">
                <span>Room Class:</span>
                <span className="font-extrabold text-stone-800">{cancellingBooking.roomType}</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-500">
                <span>Check-in date:</span>
                <span className="font-extrabold text-stone-800">{cancellingBooking.checkIn}</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-500">
                <span>Invested amount:</span>
                <span className="font-black text-rose-700">${cancellingBooking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 text-stone-500 font-semibold text-xs leading-relaxed">
              <p className="text-stone-700 font-bold">Are you absolutely sure you wish to cancel this booking?</p>
              <p>
                As this booking is in a flexible loyalty tier, a full refund of <span className="font-black text-emerald-800">${cancellingBooking.totalPrice.toFixed(2)}</span> will be credited back to your original payment method. The room will be immediately released.
              </p>
            </div>

            <div className="flex gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-white hover:bg-stone-50 text-stone-700 border border-stone-250 shadow-3xs cursor-pointer active:scale-95 transition"
              >
                Back to Safety
              </button>
              
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-rose-600 hover:bg-rose-700 text-white border border-rose-750 shadow-3xs cursor-pointer active:scale-95 transition"
              >
                Confirm Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────── MODAL 2: MODIFY STAY MODAL ──────────────── */}
      {modifyingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-stone-200/90 shadow-2xl p-6 relative overflow-hidden space-y-6">
            
            <button
              type="button"
              onClick={() => setModifyingBooking(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-stone-850 font-black text-lg tracking-tight">Modify Sanctuary Stay</h3>
                <p className="text-[10px] text-stone-450 uppercase font-extrabold tracking-widest mt-0.5">Code: {modifyingBooking.id}</p>
              </div>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4">
              
              <div className="bg-stone-50 p-4.5 rounded-2xl border border-stone-150 space-y-2.5 text-xs text-stone-550">
                <div className="flex justify-between">
                  <span className="font-bold">Suite Class:</span>
                  <span className="font-extrabold text-stone-800">{modifyingBooking.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Board:</span>
                  <span className="font-bold text-emerald-800">{modifyingBooking.boardType}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200/65 pt-2 mt-1">
                  <span>Stay Nights:</span>
                  <span className="font-bold text-stone-750">{modifyingBooking.nights} Nights ({modifyingBooking.checkIn} to {modifyingBooking.checkOut})</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-extrabold tracking-widest text-stone-400 block px-0.5">
                  Update Special Requests & Requests Note
                </label>
                <textarea
                  name="notes"
                  defaultValue={modifyingBooking.notes}
                  rows={4}
                  className="w-full border border-stone-250 bg-white rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 transition"
                  placeholder="E.g., high floor request, special dietary requirements, bedding options..."
                />
              </div>

              <div className="bg-amber-50/65 border border-amber-250/50 p-3.5 rounded-xl text-[11px] text-amber-700 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> To modify your arrival dates, suite categories, or add additional rooms, you can cancel this booking for free and re-book, or consult our dedicated 24/7 guest relations concierge service desk at check-in.
                </p>
              </div>

              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyingBooking(null)}
                  className="flex-1 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-white hover:bg-stone-50 text-stone-700 border border-stone-250 shadow-3xs cursor-pointer active:scale-95 transition"
                >
                  Discard Changes
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-emerald-800 hover:bg-emerald-950 text-white border border-emerald-900/10 shadow-3xs cursor-pointer active:scale-95 transition"
                >
                  Save Modifications
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ──────────────── MODAL 3: INVOICE MODAL ──────────────── */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200/90 shadow-2xl p-6 relative overflow-hidden space-y-6 text-stone-800">
            
            <button
              type="button"
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 border-b border-stone-100 pb-5">
              <span className="font-black text-emerald-800 uppercase tracking-widest text-xs">BlueBird Luxury Resorts</span>
              <h3 className="font-extrabold text-stone-850 text-lg tracking-tight">Sanctuary Stay Invoice</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Code: {viewingReceipt.id} • Status: {viewingReceipt.status}</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-stone-500">
              
              <div className="flex justify-between">
                <span>Guest Name:</span>
                <span className="font-bold text-stone-850">{currentUser?.firstName} {currentUser?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Suite Booking:</span>
                <span className="font-bold text-stone-850">{viewingReceipt.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span>Board Option:</span>
                <span className="font-bold text-stone-850">{viewingReceipt.boardType}</span>
              </div>
              <div className="flex justify-between">
                <span>Nights of Stay:</span>
                <span className="font-bold text-stone-850">{viewingReceipt.nights} Nights</span>
              </div>
              <div className="flex justify-between">
                <span>Stay Period:</span>
                <span className="font-bold text-stone-850">{viewingReceipt.checkIn} to {viewingReceipt.checkOut}</span>
              </div>

              <div className="border-t border-stone-150 pt-4 space-y-2.5">
                <div className="flex justify-between font-bold">
                  <span>Room Accommodation Rate:</span>
                  <span className="text-stone-800">${(viewingReceipt.totalPrice * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Luxury Tax & Service Charge (15%):</span>
                  <span className="text-stone-800">${(viewingReceipt.totalPrice * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-950 text-sm border-t border-stone-150 pt-3">
                  <span>Total Settled Amount:</span>
                  <span className="text-emerald-900">${viewingReceipt.totalPrice.toFixed(2)}</span>
                </div>
              </div>

            </div>

            <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-2xl text-center text-[10px] text-stone-450 leading-relaxed font-bold">
              🎉 Thank you for selecting Bluebird Luxury Resorts. This invoice represents a fully settled accommodation ledger balance. We look forward to greeting you.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-white hover:bg-stone-50 text-stone-755 border border-stone-250 shadow-3xs cursor-pointer active:scale-95 transition"
              >
                Close Receipt
              </button>
              
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-emerald-800 hover:bg-emerald-950 text-white border border-emerald-900/10 shadow-3xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
