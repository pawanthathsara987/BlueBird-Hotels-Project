"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import { Plus, Minus, Calendar, Users, Globe, ChevronDown, ChevronLeft, ChevronRight, Info, Sparkles, Coffee, Utensils, Check, Moon, ArrowRight, Trash2, Lock, Unlock, Car, Clock, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import RoomDetailsModal from "../../pages/client/booking/RoomDetailsModal";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/* ---------------- MAIN ---------------- */
const RoomSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [detailingRoom, setDetailingRoom] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const passedData = location.state?.bookingData;
    if (passedData?.checkInDate && passedData?.checkOutDate) {
      return [
        {
          startDate: new Date(passedData.checkInDate),
          endDate: new Date(passedData.checkOutDate),
          key: "selection",
        },
      ];
    }
    return [
      {
        startDate: new Date(),
        endDate: addDays(new Date(), 2),
        key: "selection",
      },
    ];
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);

  // Global settings
  const [nationality, setNationality] = useState(() => {
    return location.state?.bookingData?.nationality || "Sri Lankan";
  });

  // Extra booking options (Personal requests & airport pickup)
  const [personalRequest, setPersonalRequest] = useState(() => {
    return localStorage.getItem("personalRequest") || "";
  });
  const [airportPickupEnabled, setAirportPickupEnabled] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("airportPickUp"));
      return !!stored?.enabled;
    } catch {
      return false;
    }
  });
  const [pickupTime, setPickupTime] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("airportPickUp"));
      return stored?.time || "12:00";
    } catch {
      return "12:00";
    }
  });

  // Set packages config
  const packages = [
    {
      id: 1,
      name: "Room Only",
      tagline: "Maximum stay flexibility",
      icon: Sparkles,
      color: "from-stone-400 to-stone-600",
      description: "Enjoy luxurious accommodation with full access to resort amenities. Customize your dining experience during your stay.",
      features: ["Five-star Luxury Room", "High-speed Resort Wi-Fi", "Access to Infinity Pools & Beach", "24/7 Butler Support"],
    },
    {
      id: 2,
      name: "Bed & Breakfast",
      tagline: "Gourmet coastal breakfast",
      icon: Coffee,
      color: "from-amber-400 to-amber-600",
      description: "Awake to fresh ocean breezes and gourmet breakfast buffet featuring international and Sri Lankan specialties.",
      features: ["Five-star Luxury Room", "Gourmet Beachfront Breakfast Buffet", "Welcome Tropical Mocktails", "Daily Fresh Fruit Platter"],
    },
    {
      id: 3,
      name: "Half Board",
      tagline: "Curated gourmet dining",
      icon: Utensils,
      color: "from-rose-400 to-rose-600",
      description: "Treat your senses to culinary excellence. Includes breakfast buffet and a bespoke 3-course dinner daily.",
      features: ["Gourmet Beachfront Breakfast", "Daily 3-Course Dinner", "Priority Table Reservations", "15% off Spa treatments"],
    },
    {
      id: 4,
      name: "Full Board",
      tagline: "All-inclusive gastronomy",
      icon: Utensils,
      color: "from-emerald-500 to-teal-700",
      description: "Immerse yourself in total carefree culinary bliss. Enjoy fine breakfast, lunch, and dinner curated by master chefs.",
      features: ["All Gourmet Meals Included", "Premium Beachfront Venues", "Private Dining Consultation", "Selected complimentary beverages"],
    },
  ];

  // Available luxury room categories with images & price guides
  const roomTypes = [
    {
      name: "Deluxe King Room",
      maxOccupancy: 3,
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
      ],
      price: "$250",
      description: "Savor elegant coastal living in our Deluxe King Room. Featuring high ceilings, custom-crafted teak furniture, and a private sanctuary terrace offering serene garden views.",
      tagline: "Refined sanctuary with hand-selected designer touches.",
      roomSize: "45 m² / 484 sq ft",
      cancellationPolicy: "Free cancellation up to 24 hours prior to check-in.",
      paymentPolicy: "No deposit required. Pay upon arrival at the front desk."
    },
    {
      name: "Ocean Front Suite",
      maxOccupancy: 4,
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80"
      ],
      price: "$450",
      description: "Gaze upon uninterrupted Indian Ocean panoramas from our Ocean Front Suite. Complete with a signature plush king bed, deep soaking marble tub, and a spacious sun-drenched balcony.",
      tagline: "Captivating ocean vistas meets sophisticated beach luxury.",
      roomSize: "72 m² / 775 sq ft",
      cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
      paymentPolicy: "Guaranteed booking. Pay on check-in."
    },
    {
      name: "Sunset Beach Villa",
      maxOccupancy: 5,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
      ],
      price: "$750",
      description: "Step directly onto powdery white sands from your private Sunset Beach Villa. Features a personal plunge pool, open-air garden rain shower, and front-row seats to majestic daily sunsets.",
      tagline: "Your private beachfront sanctuary with an infinity plunge pool.",
      roomSize: "115 m² / 1,238 sq ft",
      cancellationPolicy: "Free cancellation up to 7 days prior to arrival.",
      paymentPolicy: "10% refundable deposit required to hold reservation."
    },
    {
      name: "Grand Presidential Suite",
      maxOccupancy: 6,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
      ],
      price: "$1,250",
      description: "The peak of opulent resort living. Our two-bedroom Grand Presidential Suite features a private fitness studio, absolute ocean frontage, massive dining terrace, and a dedicated 24-hour private butler.",
      tagline: "Unrivaled coastal majesty, supreme comfort, and elite butler service.",
      roomSize: "240 m² / 2,583 sq ft",
      cancellationPolicy: "Free cancellation up to 14 days prior to arrival.",
      paymentPolicy: "Guaranteed reservation. Major credit cards pre-authorized."
    }
  ];

  // Helper to calculate room price dynamically based on room type and board type
  const calculateRoomPrice = (roomType, boardType) => {
    if (!roomType) return 0;
    const typeObj = roomTypes.find(t => t.name === roomType);
    if (!typeObj) return 0;
    const base = Number(typeObj.price.replace(/[^0-9.]/g, '')) || 0;
    const addons = { "Room Only": 0, "Bed & Breakfast": 40, "Half Board": 90, "Full Board": 150 };
    return base + (addons[boardType] || 0);
  };

  // Dynamic added rooms list (Initialize with one default room using selected board type, initially unconfigured or restored from location state)
  const [addedRooms, setAddedRooms] = useState(() => {
    const passedRooms = location.state?.selectedRooms;
    if (Array.isArray(passedRooms) && passedRooms.length > 0) {
      return passedRooms.map(r => {
        const typeIdx = roomTypes.findIndex(t => t.name === r.roomType);
        const pkgIdx = packages.findIndex(p => p.name === r.boardType);
        return {
          id: r.frontendRoomId || Date.now() + Math.random(),
          roomType: r.roomType || "",
          adults: r.adults || 2,
          children: r.kids || 0,
          childAges: r.kidAges || [],
          boardType: r.boardType || "Room Only",
          price: r.pricePerNight || 0,
          isConfigured: true,
          categoryIndex: typeIdx >= 0 ? typeIdx : 0,
          packageIndex: pkgIdx >= 0 ? pkgIdx : 0
        };
      });
    }
    return [
      {
        id: 1,
        roomType: "", // Enforce selection!
        adults: 2,
        children: 0,
        childAges: [], // Enforce specify child age
        boardType: "Room Only",
        price: 0,
        isConfigured: false,
        categoryIndex: 0,
        packageIndex: 0
      }
    ];
  });

  // Add Room Button Handler
  const handleAddNewRoom = () => {
    const newRoom = {
      id: Date.now(),
      roomType: "",
      adults: 2,
      children: 0,
      childAges: [],
      boardType: "Room Only",
      price: 0,
      isConfigured: false,
      categoryIndex: 0,
      packageIndex: 0
    };
    setAddedRooms([...addedRooms, newRoom]);
  };

  // Delete Room Handler
  const handleDeleteRoom = (roomId) => {
    if (addedRooms.length > 1) {
      setAddedRooms(addedRooms.filter(r => r.id !== roomId));
    }
  };

  // Confirm Room Configuration Handler
  const handleConfirmRoom = (roomId, idx) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        if (!r.roomType) {
          toast.error(`Please select a room category for Room ${idx + 1}.`);
          return r;
        }
        if (r.children > 0 && r.childAges.some(age => age === "")) {
          toast.error(`Please specify the age for all children in Room ${idx + 1}.`);
          return r;
        }
        toast.success(`Room ${idx + 1} configuration confirmed!`);
        return { ...r, isConfigured: true };
      }
      return r;
    }));
  };

  // Edit/Unlock Room Configuration Handler
  const handleEditRoom = (roomId) => {
    setAddedRooms(prev => prev.map(r => r.id === roomId ? { ...r, isConfigured: false } : r));
  };

  // Helper to rotate items array so that the item before the active index peeks on the left
  const getRotatedArray = (arr, index) => {
    const len = arr.length;
    if (len === 0) return [];
    const startIndex = (index - 1 + len) % len;
    const result = [];
    for (let k = 0; k < len; k++) {
      result.push(arr[(startIndex + k) % len]);
    }
    return result;
  };

  // Carousel Navigation handlers for category and packages
  const handleCategoryPrev = (roomId) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newIndex = (r.categoryIndex - 1 + roomTypes.length) % roomTypes.length;
        const newRoomType = roomTypes[newIndex].name;
        return {
          ...r,
          categoryIndex: newIndex,
          roomType: newRoomType,
          price: calculateRoomPrice(newRoomType, r.boardType)
        };
      }
      return r;
    }));
  };

  const handleCategoryNext = (roomId) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newIndex = (r.categoryIndex + 1) % roomTypes.length;
        const newRoomType = roomTypes[newIndex].name;
        return {
          ...r,
          categoryIndex: newIndex,
          roomType: newRoomType,
          price: calculateRoomPrice(newRoomType, r.boardType)
        };
      }
      return r;
    }));
  };

  const handlePackagePrev = (roomId) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newIndex = (r.packageIndex - 1 + packages.length) % packages.length;
        const newBoardType = packages[newIndex].name;
        return {
          ...r,
          packageIndex: newIndex,
          boardType: newBoardType,
          price: calculateRoomPrice(r.roomType, newBoardType)
        };
      }
      return r;
    }));
  };

  const handlePackageNext = (roomId) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newIndex = (r.packageIndex + 1) % packages.length;
        const newBoardType = packages[newIndex].name;
        return {
          ...r,
          packageIndex: newIndex,
          boardType: newBoardType,
          price: calculateRoomPrice(r.roomType, newBoardType)
        };
      }
      return r;
    }));
  };

  // Board Type Selection Handler
  const handleBoardTypeChange = (roomId, newBoardType) => {
    const pkgIdx = packages.findIndex(p => p.name === newBoardType);
    setAddedRooms(prev => prev.map(r =>
      r.id === roomId ? {
        ...r,
        boardType: newBoardType,
        packageIndex: pkgIdx >= 0 ? pkgIdx : r.packageIndex,
        price: calculateRoomPrice(r.roomType, newBoardType)
      } : r
    ));
  };

  // Room Type Selection Handler
  const handleRoomTypeChange = (roomId, newType) => {
    const typeIdx = roomTypes.findIndex(t => t.name === newType);
    setAddedRooms(prev => prev.map(r =>
      r.id === roomId ? {
        ...r,
        roomType: newType,
        categoryIndex: typeIdx >= 0 ? typeIdx : r.categoryIndex,
        price: calculateRoomPrice(newType, r.boardType)
      } : r
    ));
  };

  // Child Age Selection Handler
  const handleChildAgeChange = (roomId, childIndex, newAge) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextAges = [...(r.childAges || [])];
        nextAges[childIndex] = newAge === "" ? "" : parseInt(newAge, 10);
        return { ...r, childAges: nextAges };
      }
      return r;
    }));
  };

  // Occupancy Update Handler
  const handleUpdateRoomGuests = (roomId, type, delta) => {
    setAddedRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        if (type === "adults") {
          return { ...r, adults: Math.max(1, r.adults + delta) };
        } else if (type === "children") {
          const nextChildren = Math.max(0, r.children + delta);
          let nextAges = [...(r.childAges || [])];
          if (delta > 0) {
            for (let i = 0; i < delta; i++) {
              nextAges.push("");
            }
          } else if (delta < 0) {
            nextAges = nextAges.slice(0, nextChildren);
          }
          return { ...r, children: nextChildren, childAges: nextAges };
        }
      }
      return r;
    }));
  };

  // Aggregated totals for read-only preview bar
  const totalRooms = addedRooms.length;
  const configuredRoomsCount = addedRooms.filter(r => r.isConfigured).length;
  const hasUnconfiguredRoom = addedRooms.some(r => !r.isConfigured);
  const totalAdults = addedRooms.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = addedRooms.reduce((sum, r) => sum + r.children, 0);
  const totalNightlyRate = addedRooms.reduce((sum, r) => sum + (r.price || 0), 0);

  // Refs for click outside detection
  const nationalityRef = useRef(null);
  const dateRangeRef = useRef(null);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target)) {
        setShowNationalityDropdown(false);
      }
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute stay duration in nights
  const getStayNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    if (!start || !end) return 1;
    const diffTime = Math.abs(end - start);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleFinalBookingSubmit = () => {
    const nights = getStayNights();

    // Calculate total nightly rate of all rooms
    const totalNightlyRate = addedRooms.reduce((sum, r) => sum + (r.price || 0), 0);

    // Save to localStorage so BookingSummary.jsx and RoomPayment.jsx can read them
    localStorage.setItem("personalRequest", personalRequest);
    localStorage.setItem(
      "airportPickUp",
      JSON.stringify({
        enabled: airportPickupEnabled,
        time: pickupTime,
      })
    );

    // Construct bookingData expected by BookingSummary.jsx
    const bookingData = {
      checkInDate: dateRange[0].startDate.toISOString(),
      checkOutDate: dateRange[0].endDate.toISOString(),
      nights: nights,
      totalPrice: totalNightlyRate * nights + (airportPickupEnabled ? 50 : 0),
      nationality: nationality,
    };

    // Construct selectedRooms list expected by BookingSummary.jsx
    const selectedRooms = addedRooms.map((r, i) => {
      const roomNights = nights;
      const roomNightlyRate = r.price || 0;
      return {
        frontendRoomId: r.id,
        packageName: `${r.roomType} (${r.boardType})`,
        roomType: r.roomType,
        boardType: r.boardType,
        adults: r.adults,
        kids: r.children,
        kidAges: r.childAges,
        actualKidAges: r.childAges,
        nights: roomNights,
        pricePerNight: roomNightlyRate,
        totalPrice: roomNightlyRate * roomNights,
        originalTotalPrice: roomNightlyRate * roomNights,
        discount: 0,
        checkInDate: dateRange[0].startDate.toISOString(),
        checkOutDate: dateRange[0].endDate.toISOString(),
      };
    });

    toast.success("Redirecting to your booking summary...");

    // Navigate to booking summary page
    navigate("/booking-summary", {
      state: {
        bookingData,
        selectedRooms,
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_rgba(28,25,23,0.18)] border border-stone-200/90 p-6 md:p-9 space-y-9 relative transition-all duration-300">

      {/* Upper Luxury Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="bg-emerald-800 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Stay
          </span>
          <h2 className="text-stone-800 font-extrabold text-xl tracking-tight">Configure Your Escape</h2>
        </div>
        <div className="text-xs text-stone-500 font-semibold flex items-center gap-1.5 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          Best Rates Guaranteed Direct
        </div>
      </div>

      {/* Premium Booking Selector Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-stone-50/70 p-4 rounded-2xl border border-stone-100">

        {/* Nationality Dropdown */}
        <div ref={nationalityRef} className="lg:col-span-3 flex flex-col relative h-full">
          <label className="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 px-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-800" /> Nationality
          </label>

          <button
            type="button"
            onClick={() => {
              setShowNationalityDropdown(!showNationalityDropdown);
              setShowCalendar(false);
            }}
            className="flex-1 flex items-center justify-between border border-stone-200/80 bg-white hover:border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 px-4 py-3.5 rounded-xl transition text-left cursor-pointer group shadow-xs"
          >
            <span className="text-stone-800 font-bold text-sm flex items-center gap-2">
              {nationality === "Sri Lankan" ? "🇱🇰 Sri Lankan" : "🌐 Non-Sri Lankan"}
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showNationalityDropdown ? "rotate-180 text-emerald-800" : "group-hover:text-stone-600"}`} />
          </button>

          {showNationalityDropdown && (
            <div className="absolute top-[105%] left-0 w-full bg-white border border-stone-200/90 rounded-xl shadow-xl z-50 p-1.5 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  setNationality("Sri Lankan");
                  setShowNationalityDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${nationality === "Sri Lankan" ? "bg-emerald-50 text-emerald-950 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
              >
                <span>🇱🇰 Sri Lankan Resident</span>
                {nationality === "Sri Lankan" && <Check className="w-3.5 h-3.5 text-emerald-800" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNationality("Non Sri Lankan Resident");
                  setShowNationalityDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${nationality === "Non Sri Lankan Resident" ? "bg-emerald-50 text-emerald-950 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
              >
                <span>🌐 Non-Sri Lankan Resident</span>
                {nationality === "Non Sri Lankan Resident" && <Check className="w-3.5 h-3.5 text-emerald-800" />}
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Check In - Check Out Dates */}
        <div ref={dateRangeRef} className="lg:col-span-5 flex flex-col relative h-full">
          <label className="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 px-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-800" /> Check In — Check Out
          </label>

          <button
            type="button"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowNationalityDropdown(false);
            }}
            className="flex-1 flex items-center justify-between border border-stone-200/80 bg-white hover:border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 p-3.5 rounded-xl transition text-left cursor-pointer shadow-xs group"
          >
            {/* Visual Stay Card Blocks */}
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Arrive</span>
                <span className="text-stone-800 font-extrabold text-sm tracking-tight">
                  {format(dateRange[0].startDate, "dd MMM")}
                </span>
                <span className="text-xs font-medium text-stone-400 capitalize">
                  {format(dateRange[0].startDate, "eeee")}
                </span>
              </div>

              {/* Night Counter stay badge */}
              <div className="flex flex-col items-center justify-center px-3 py-1 bg-stone-100 group-hover:bg-emerald-50 rounded-lg border border-stone-200/50 transition">
                <span className="text-xs font-extrabold text-stone-600 uppercase tracking-widest flex items-center gap-1">
                  <Moon className="w-2.5 h-2.5 text-emerald-800" /> {getStayNights()}
                </span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-px animate-fadeIn">
                  {getStayNights() === 1 ? "Night" : "Nights"}
                </span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Depart</span>
                <span className="text-stone-800 font-extrabold text-sm tracking-tight">
                  {format(dateRange[0].endDate, "dd MMM")}
                </span>
                <span className="text-xs font-medium text-stone-400 capitalize">
                  {format(dateRange[0].endDate, "eeee")}
                </span>
              </div>
            </div>
          </button>

          {showCalendar && (
            <div className="absolute top-[105%] left-0 lg:left-1/2 lg:-translate-x-1/2 bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-50 p-4 max-w-sm md:max-w-none overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Select Stay Dates</h4>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-md transition shadow-2xs"
                >
                  Done
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <DateRange
                  ranges={dateRange}
                  onChange={(item) => setDateRange([item.selection])}
                  months={window.innerWidth > 768 ? 2 : 1}
                  direction="horizontal"
                  minDate={new Date()}
                  rangeColors={["#065f46"]}
                  color="#065f46"
                />
              </div>
            </div>
          )}
        </div>

        {/* Read-Only Occupancy Preview Bar */}
        <div className="lg:col-span-4 flex flex-col relative group h-full">
          <label className="text-xs uppercase font-bold tracking-widest text-stone-500 mb-2 px-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-800" /> Occupancy Preview
          </label>

          <div className="flex-1 flex items-center justify-between border border-stone-200/80 bg-stone-100/50 px-4 py-3.5 rounded-xl transition text-left cursor-default shadow-xs select-none">
            <div className="flex flex-col">
              <span className="text-stone-800 font-extrabold text-sm">
                {totalAdults + totalChildren} {totalAdults + totalChildren === 1 ? "Guest" : "Guests"}
              </span>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-px">
                {totalRooms} {totalRooms === 1 ? "Room" : "Rooms"} ({configuredRoomsCount} Configured) • {totalAdults} Ad • {totalChildren} Ch
              </span>
            </div>

            {/* Dynamic visual indicator for configuration completeness */}
            <span className={`text-xs font-bold px-2 py-1 rounded-lg border transition-colors duration-300 ${hasUnconfiguredRoom
              ? "bg-amber-50 text-amber-700 border-amber-250/50"
              : "bg-emerald-50 text-emerald-850 border-emerald-250/50"
              }`}>
              {hasUnconfiguredRoom ? "Incomplete" : "Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* "Add Room" Action Trigger */}
      <div className="flex flex-col items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleAddNewRoom}
          disabled={hasUnconfiguredRoom}
          className={`font-extrabold uppercase text-xs tracking-wider px-8 py-3.5 rounded-xl transition-all duration-300 transform flex items-center gap-2 border shadow-sm ${hasUnconfiguredRoom
            ? "bg-stone-100 text-stone-400 border-stone-200/80 cursor-not-allowed scale-100 shadow-none"
            : "bg-emerald-800 hover:bg-emerald-950 text-white border-emerald-900/10 cursor-pointer active:scale-98 hover:shadow-[0_6px_15px_rgba(6,95,70,0.12)] group"
            }`}
        >
          {hasUnconfiguredRoom ? (
            <Lock className="w-4 h-4 text-stone-400" />
          ) : (
            <Plus className="w-4 h-4 text-emerald-200 transition-transform group-hover:rotate-90" />
          )}
          Add Room
        </button>
        {hasUnconfiguredRoom && (
          <p className="text-xs font-bold text-amber-600 flex items-center gap-1 animate-pulse">
            ⚠️ Configure and confirm Room {totalRooms} before adding another
          </p>
        )}
      </div>

      {/* 2. Room Type Assignment & Occupancy Configuration Panel */}
      <div className="space-y-5 pt-4 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-stone-800 font-bold text-lg tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" /> 2. Configure Added Rooms
            </h3>
            <p className="text-sm text-stone-500">Assign a luxurious room category and occupancy size to each room</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-1 rounded-full shadow-2xs">
            {totalRooms} {totalRooms === 1 ? "Room Configured" : "Rooms Configured"}
          </span>
        </div>

        <div className="space-y-6">
          {addedRooms.map((room, idx) => {
            const isPrevRoomUnconfigured = addedRooms.slice(0, idx).some(r => !r.isConfigured);

            return isPrevRoomUnconfigured && !room.isConfigured ? (
              // ---------------- PENDING / LOCKED STATE ----------------
              <div
                key={room.id}
                className="bg-stone-100/40 border border-stone-200 rounded-2xl p-6 relative shadow-3xs flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 animate-fadeIn"
              >
                {/* Left side: Muted status info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                  <div className="w-11 h-11 rounded-full bg-stone-105 border border-stone-200 flex items-center justify-center shrink-0 shadow-3xs">
                    <Lock className="w-4 h-4 text-stone-400 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-400">
                        Room {idx + 1} Locked
                      </span>
                    </div>

                    <h4 className="text-stone-500 font-extrabold text-base tracking-tight">
                      Pending Configuration
                    </h4>

                    <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                      Please configure and confirm <span className="text-stone-600 font-bold">Room {idx}</span> to unlock the configuration for this room.
                    </p>
                  </div>
                </div>

                {/* Right side: Delete room option is still available */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  {addedRooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-stone-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 border border-stone-200 hover:border-rose-100 bg-white transition cursor-pointer active:scale-95 shadow-3xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : room.isConfigured ? (
              // ---------------- CONFIRMED / LOCKED STATE ----------------
              <div
                key={room.id}
                className="bg-emerald-50/10 border-2 border-emerald-600/30 rounded-2xl p-6 relative shadow-3xs flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 animate-fadeIn"
              >
                {/* Left side: Room status, name, details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-5 h-5 text-emerald-800" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-850">
                        Room {idx + 1} Confirmed
                      </span>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded-md flex items-center gap-1">
                        {(() => {
                          const pkg = packages.find(p => p.name === room.boardType);
                          const PkgIcon = pkg ? pkg.icon : Sparkles;
                          return <PkgIcon className="w-2.5 h-2.5 text-emerald-800" />;
                        })()}
                        {room.boardType}
                      </span>
                    </div>

                    <h4 className="text-stone-800 font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                      <span>{room.roomType}</span>
                      <span className="text-emerald-850 bg-emerald-50 border border-emerald-250/60 px-2 py-0.5 rounded-lg text-xs font-extrabold tracking-wide">
                        ${room.price} / night
                      </span>
                    </h4>

                    <p className="text-xs text-stone-500 font-semibold flex items-center gap-2">
                      <span>Occupancy:</span>
                      <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md font-bold text-xs">
                        {room.adults} {room.adults === 1 ? "Adult" : "Adults"}
                      </span>
                      {room.children > 0 && (
                        <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md font-bold text-xs flex items-center gap-1">
                          <span>
                            {room.children} {room.children === 1 ? "Child" : "Children"}
                          </span>
                          <span className="text-stone-450 font-bold text-xs">
                            ({room.childAges.map(age => age === 0 ? "Infant" : `${age}y`).join(", ")})
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right side: Image thumbnail and actions */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  {roomTypes.find(t => t.name === room.roomType) && (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-stone-200/80 shadow-3xs shrink-0 hidden sm:block">
                      <img
                        src={roomTypes.find(t => t.name === room.roomType).image}
                        alt={room.roomType}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-stone-950/80 text-white text-xs font-black px-2 py-0.5 rounded backdrop-blur-3xs">
                        ${room.price}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPrevRoomUnconfigured) {
                          toast.error(`Please configure and confirm Room ${idx} before editing Room ${idx + 1}.`);
                          return;
                        }
                        handleEditRoom(room.id);
                      }}
                      className={`font-bold uppercase text-xs tracking-wider px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-3xs group border ${isPrevRoomUnconfigured
                        ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed animate-pulse"
                        : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 cursor-pointer active:scale-95"
                        }`}
                    >
                      {isPrevRoomUnconfigured ? (
                        <Lock className="w-3 h-3 text-stone-450" />
                      ) : (
                        <Unlock className="w-3 h-3 text-stone-450 group-hover:text-stone-600 transition" />
                      )}
                      Edit Room
                    </button>

                    {addedRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-stone-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 border border-stone-200 hover:border-rose-100 bg-white transition cursor-pointer active:scale-95 shadow-3xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // ---------------- EDITABLE / CONFIGURING STATE ----------------
              <div
                key={room.id}
                className="bg-stone-50/50 border border-stone-200/80 rounded-2xl p-6 relative group hover:border-emerald-600/30 transition-all duration-300 shadow-2xs flex flex-col lg:flex-row lg:items-stretch gap-6 animate-fadeIn"
              >
                {/* Left Side: Room details & occupancy controls */}
                <div className="lg:w-80 shrink-0 flex flex-col justify-between space-y-4">

                  {/* Room Identifier Header */}
                  <div className="flex justify-between items-center border-b border-stone-200/40 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-850 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
                      Room {idx + 1}
                    </span>

                    <div className="flex items-center gap-2.5">
                      {/* Selected Package Badge */}
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> {room.boardType}
                      </span>

                      {/* Delete Room Button */}
                      {addedRooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info summary description */}
                  <div className="text-xs text-stone-500 leading-relaxed bg-white/45 p-3.5 rounded-xl border border-stone-200/50 space-y-2.5">
                    <div>
                      <span className="font-bold text-stone-400 block text-xs uppercase tracking-wider mb-0.5">Selected Category</span>
                      <span className={`font-bold block text-sm ${room.roomType ? "text-emerald-850" : "text-amber-650 italic font-semibold animate-pulse"}`}>
                        {room.roomType || "⚠️ Selection Required"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200/40">
                      <span className="font-bold text-stone-400 block text-xs uppercase tracking-wider mb-0.5">Selected Board Type</span>
                      <span className="font-bold block text-sm text-emerald-850 flex items-center gap-1.5">
                        {(() => {
                          const pkg = packages.find(p => p.name === room.boardType);
                          const PkgIcon = pkg ? pkg.icon : Sparkles;
                          return <PkgIcon className="w-3.5 h-3.5 text-emerald-800" />;
                        })()}
                        {room.boardType || "Room Only"}
                      </span>
                    </div>
                    {room.roomType && (
                      <div className="pt-2.5 border-t border-stone-200/40 space-y-1.5 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/50 animate-fadeIn">
                        <span className="font-bold text-stone-400 block text-xs uppercase tracking-wider">Calculated Room Price</span>
                        <div className="flex flex-col text-stone-750 font-bold text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Base Rate:</span>
                            <span>
                              ${(() => {
                                const typeObj = roomTypes.find(t => t.name === room.roomType);
                                return typeObj ? Number(typeObj.price.replace(/[^0-9.]/g, '')) : 0;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{room.boardType} Add-on:</span>
                            <span>
                              +${(() => {
                                const addons = { "Room Only": 0, "Bed & Breakfast": 40, "Half Board": 90, "Full Board": 150 };
                                return addons[room.boardType] || 0;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-emerald-200/35 flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-850">Total Nightly Rate:</span>
                          <span className="font-black text-emerald-900 text-sm sm:text-base">
                            ${room.price} / night
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Occupancy counters for this specific room */}
                  <div className="flex flex-col gap-3">

                    {/* Adults Count */}
                    <div className="flex items-center justify-between bg-white border border-stone-200/60 p-3 rounded-xl shadow-3xs">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-800">Adults</span>
                        <span className="text-xs text-stone-400 font-bold">Ages 11+</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomGuests(room.id, "adults", -1)}
                          disabled={room.adults <= 1}
                          className="w-6.5 h-6.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-400 active:scale-90 transition bg-stone-50 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-stone-800 w-4 text-center">{room.adults}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomGuests(room.id, "adults", 1)}
                          className="w-6.5 h-6.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-400 active:scale-90 transition bg-stone-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Kids Count */}
                    <div className="flex items-center justify-between bg-white border border-stone-200/60 p-3 rounded-xl shadow-3xs animate-fadeIn">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-800">Kids</span>
                        <span className="text-xs text-stone-400 font-bold">Ages 0-11</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomGuests(room.id, "children", -1)}
                          disabled={room.children <= 0}
                          className="w-6.5 h-6.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-400 active:scale-90 transition bg-stone-50 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-stone-800 w-4 text-center">{room.children}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomGuests(room.id, "children", 1)}
                          className="w-6.5 h-6.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-400 active:scale-90 transition bg-stone-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Specify Child Ages Grid */}
                    {room.children > 0 && (
                      <div className="bg-white border border-stone-200/60 p-3 rounded-xl shadow-3xs space-y-3 animate-fadeIn">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-850 block border-b border-stone-100 pb-1.5">
                          Specify Child Ages
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: room.children }).map((_, childIdx) => {
                            const currentAge = room.childAges?.[childIdx] ?? "";
                            return (
                              <div key={childIdx} className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-stone-400">Child {childIdx + 1} Age</span>
                                <select
                                  value={currentAge}
                                  onChange={(e) => handleChildAgeChange(room.id, childIdx, e.target.value)}
                                  className={`border text-xs rounded-lg px-2 py-1 bg-stone-50 text-stone-700 font-bold focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer ${currentAge === "" ? "border-amber-300 ring-2 ring-amber-500/5" : "border-stone-200 hover:border-stone-300"
                                    }`}
                                >
                                  <option value="">Select Age</option>
                                  <option value="0">Under 1 (Infant)</option>
                                  {Array.from({ length: 11 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1} Years</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>

                        {room.childAges?.some(age => age === "") && (
                          <p className="text-xs font-extrabold text-amber-600 animate-pulse">
                            ⚠️ Age required for each child
                          </p>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Confirm & Lock Room Button */}
                  <button
                    type="button"
                    onClick={() => handleConfirmRoom(room.id, idx)}
                    className={`w-full font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 border shadow-2xs ${!room.roomType || (room.children > 0 && room.childAges.some(age => age === ""))
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-250/50 cursor-pointer"
                      : "bg-emerald-800 hover:bg-emerald-950 text-white border-emerald-900/10 cursor-pointer active:scale-98 shadow-[0_4px_10px_rgba(6,95,70,0.08)] hover:shadow-[0_6px_14px_rgba(6,95,70,0.12)] group"
                      }`}
                  >
                    <Check className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${!room.roomType || (room.children > 0 && room.childAges.some(age => age === ""))
                      ? "text-amber-600"
                      : "text-emerald-250"
                      }`} />
                    Confirm Room {idx + 1}
                  </button>
                </div>

                {/* Right Side: Category and Board Type Selectors Stacked */}
                <div className="flex-1 flex flex-col min-w-0 space-y-6">
                  {/* Category Selector */}
                  <div className="relative w-full px-1">
                    <label className="text-xs uppercase font-extrabold tracking-widest text-stone-400 mb-2.5 px-0.5 block flex items-center justify-between">
                      <span>Select Room Category</span>
                      {room.roomType && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded-md normal-case tracking-normal">
                          Active: {room.roomType}
                        </span>
                      )}
                    </label>
                    <div className="relative w-full">
                      {/* Grid track wrapper with premium border, background, and spacing */}
                      <div className="w-full rounded-2xl border-3 border-stone-200/70 bg-white/40 p-3 shadow-3xs">
                        <div className="flex gap-4 pb-1 pt-1 items-stretch overflow-x-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                          {roomTypes.map((type) => {
                            const isSelected = room.roomType === type.name;
                            return (
                              <div
                                key={type.name}
                                onClick={() => handleRoomTypeChange(room.id, type.name)}
                                className={`min-w-[195px] w-[195px] bg-white rounded-xl border-2 transition-all duration-350 cursor-pointer overflow-hidden flex flex-col justify-between group relative active:scale-98 ${isSelected
                                  ? "border-emerald-600 ring-4 ring-emerald-500/15 scale-[1.03] shadow-[0_12px_24px_rgba(6,95,70,0.12)] z-10"
                                  : "border-stone-200/80 hover:border-emerald-600/40 hover:scale-[1.01] hover:shadow-2xs"
                                  }`}
                              >
                                {/* HD room thumbnail preview */}
                                <div className="relative h-28 overflow-hidden shrink-0">
                                  <img
                                    src={type.image}
                                    alt={type.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                  />
                                  <div className="absolute top-2 right-2 z-10">
                                    {isSelected ? (
                                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md border border-white/20">
                                        <Check className="w-3.5 h-3.5" />
                                      </span>
                                    ) : (
                                      <span className="w-6 h-6 rounded-full bg-white/90 text-stone-500 flex items-center justify-center backdrop-blur-3xs shadow-sm border border-stone-200/50 hover:bg-stone-50">
                                        <Plus className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>

                                  {/* Info Trigger Button (Top-left always visible with interactive hover scale) */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailingRoom(type);
                                    }}
                                    className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-white/95 text-stone-600 hover:text-emerald-800 flex items-center justify-center backdrop-blur-3xs shadow-sm border border-stone-200/50 hover:border-stone-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                                    title="View suite details"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Price Tag Badge */}
                                  <div className="absolute bottom-2 left-2 bg-stone-950/85 text-white px-2.5 py-0.5 rounded text-xs font-black tracking-wider backdrop-blur-3xs">
                                    {type.price} / night
                                  </div>
                                </div>

                                {/* Card metadata details */}
                                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                  <h5 className="font-extrabold text-stone-850 text-xs leading-tight tracking-tight group-hover:text-emerald-900 transition">
                                    {type.name}
                                  </h5>
                                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 pt-2 border-t border-stone-100">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailingRoom(type);
                                      }}
                                      className="text-stone-450 hover:text-emerald-850 transition duration-200 font-extrabold flex items-center gap-0.5 cursor-pointer hover:underline"
                                    >
                                      <Info className="w-3 h-3" /> Details
                                    </button>
                                    <span className="text-stone-650 bg-stone-50 px-2 py-0.5 rounded text-[10px] font-bold">{type.maxOccupancy} Guests</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Experience Package (Board Type) Selector */}
                  <div className="relative w-full px-1">
                    <label className="text-xs uppercase font-extrabold tracking-widest text-stone-400 mb-2 px-0.5 block flex items-center justify-between">
                      <span>Select Experience Package (Board Type)</span>
                      {room.boardType && (
                        <span className="text-xs font-bold text-emerald-850 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded-md normal-case tracking-normal">
                          Active: {room.boardType}
                        </span>
                      )}
                    </label>
                    <div className="relative w-full">
                      {/* Grid track wrapper with premium border, background, and spacing */}
                      <div className="w-full rounded-2xl border-3 border-stone-200/70 bg-white/40 p-3 shadow-3xs">
                        <div className="flex gap-4 pb-1 pt-1 items-stretch overflow-x-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                          {packages.map((pkg) => {
                            const isSelected = room.boardType === pkg.name;
                            const IconComponent = pkg.icon;
                            return (
                              <div
                                key={pkg.id}
                                onClick={() => handleBoardTypeChange(room.id, pkg.name)}
                                className={`min-w-[195px] w-[195px] bg-white rounded-xl border-2 p-3.5 transition-all duration-350 cursor-pointer overflow-hidden flex flex-col justify-between group relative active:scale-98 ${isSelected
                                  ? "border-emerald-600 ring-4 ring-emerald-500/15 scale-[1.03] shadow-[0_12px_24px_rgba(6,95,70,0.12)] z-10"
                                  : "border-stone-200/80 hover:border-emerald-600/40 hover:scale-[1.01] hover:shadow-2xs"
                                  }`}
                              >
                                <div className={`h-1.5 bg-gradient-to-r ${pkg.color} absolute top-0 left-0 right-0`} />
                                <div className="flex justify-between items-center pt-2">
                                  <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <IconComponent className="w-4 h-4 text-emerald-800" />
                                  </div>
                                  {isSelected ? (
                                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md border border-white/20">
                                      <Check className="w-3.5 h-3.5" />
                                    </span>
                                  ) : (
                                    <span className="w-6 h-6 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center shadow-3xs group-hover:border-stone-300">
                                      <Plus className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3.5">
                                  <h6 className="text-stone-850 font-black text-xs tracking-tight">{pkg.name}</h6>
                                  <p className="text-[11px] text-stone-400 leading-tight mt-1 font-semibold">{pkg.tagline}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Additional Guest Services Section */}
      <div className="space-y-5 pt-6 border-t border-stone-100">
        <div>
          <h3 className="text-stone-800 font-bold text-lg tracking-wide flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-800" /> 3. Additional Guest Services
          </h3>
          <p className="text-sm text-stone-500">Elevate your stay with premium resort services and special requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Premium Airport Pickup */}
          <div
            className={`border rounded-2xl p-6 transition-all duration-350 shadow-3xs flex flex-col justify-between ${airportPickupEnabled
                ? "border-emerald-600 bg-emerald-50/5 ring-4 ring-emerald-500/5"
                : "border-stone-200 bg-stone-50/30 hover:border-emerald-600/30"
              }`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${airportPickupEnabled ? "bg-emerald-100 border-emerald-250 text-emerald-800" : "bg-white border-stone-200 text-stone-500"}`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-850 text-sm sm:text-base leading-tight">Sanctuary Airport Shuttle</h4>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5">Private transfer from airport to resort</p>
                  </div>
                </div>

                {/* Surcharge Badge */}
                <span className="text-xs font-black text-emerald-850 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                  +$50.00 / trip
                </span>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-medium mb-4">
                A private chauffeur will meet you at the terminal arrivals lobby with a custom name board and drive you directly to BlueBird Hotels.
              </p>

              {/* Shuttle Schedule Inputs */}
              {airportPickupEnabled && (
                <div className="bg-white border border-stone-200/80 p-4 rounded-xl space-y-3.5 shadow-3xs animate-fadeIn mb-4">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-850 block border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Transfer Schedule
                  </span>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Shuttle Date</span>
                      <div className="border text-xs rounded-lg px-3 py-2 bg-stone-50 text-stone-600 font-bold border-stone-250 cursor-not-allowed select-none">
                        {format(dateRange[0].startDate, "dd MMM yyyy")}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Arrival Time</span>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="border text-xs rounded-lg px-3 py-2 bg-white text-stone-700 font-bold border-stone-200 hover:border-stone-300 focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold italic">
                    * The pickup date matches your check-in date. Please update check-in date above if needed.
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between border-t border-stone-150/40 pt-4 mt-auto">
              <span className="text-xs font-extrabold text-stone-600">Request Airport Pickup</span>
              <button
                type="button"
                onClick={() => setAirportPickupEnabled(!airportPickupEnabled)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer relative ${airportPickupEnabled ? "bg-emerald-800" : "bg-stone-200"
                  }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${airportPickupEnabled ? "translate-x-5.5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Card B: Personal & Special Requests */}
          <div
            className={`border rounded-2xl p-6 transition-all duration-350 shadow-3xs flex flex-col justify-between ${personalRequest.trim().length > 0
                ? "border-emerald-600 bg-emerald-50/5 ring-4 ring-emerald-500/5"
                : "border-stone-200 bg-stone-50/30 hover:border-emerald-600/30"
              }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl border ${personalRequest.trim().length > 0 ? "bg-emerald-100 border-emerald-250 text-emerald-800" : "bg-white border-stone-200 text-stone-500"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-850 text-sm sm:text-base leading-tight">Special & Personal Requests</h4>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5">Let us personalize your sanctuary stay</p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed font-medium mb-4">
                  Do you have dietary preferences, allergies, require specific bedding configs, or celebrating a special occasion? Let us know below.
                </p>
              </div>

              <div className="space-y-1.5 mt-auto">
                <textarea
                  value={personalRequest}
                  onChange={(e) => setPersonalRequest(e.target.value)}
                  placeholder="e.g., Allergen-free feather pillows, celebrating our wedding anniversary, arrival cake setup, extra child bed option..."
                  maxLength={500}
                  rows={4}
                  className="w-full text-xs font-semibold text-stone-750 bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition placeholder-stone-400 outline-hidden resize-none shadow-3xs"
                />
                <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold px-1">
                  <span>We do our best to accommodate all guest desires.</span>
                  <span>{personalRequest.length} / 500 chars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Luxury Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-stone-100 gap-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
          <p className="text-stone-500 text-xs leading-relaxed max-w-md">
            Cancellation is free up to 48 hours prior to arrival. All categories are fully customizable for different room classes and guest occupancies.
          </p>
        </div>

        {/* Dynamic Estimated Total Nightly Rate */}
        {!hasUnconfiguredRoom && totalNightlyRate > 0 && (
          <div className="flex items-center gap-3.5 flex-wrap justify-end sm:justify-start">
            <div className="flex flex-col items-end sm:items-start text-right sm:text-left bg-stone-50 border border-stone-200/50 px-4.5 py-2.5 rounded-2xl shadow-3xs animate-fadeIn shrink-0">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-stone-400 mb-0.5">Est. Total Nightly Rate</span>
              <span className="text-emerald-900 font-black text-lg sm:text-xl tracking-tight">
                ${totalNightlyRate} <span className="text-xs font-bold text-stone-450">/ night</span>
              </span>
            </div>
            {airportPickupEnabled && (
              <div className="flex flex-col items-end sm:items-start text-right sm:text-left bg-emerald-50/40 border border-emerald-200/60 px-4.5 py-2.5 rounded-2xl shadow-3xs animate-fadeIn shrink-0">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-800 mb-0.5">Shuttle Surcharge</span>
                <span className="text-emerald-950 font-black text-lg sm:text-xl tracking-tight">
                  +$50.00 <span className="text-xs font-bold text-stone-450">one-time</span>
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleFinalBookingSubmit}
          disabled={hasUnconfiguredRoom}
          className={`font-extrabold uppercase text-xs tracking-widest px-8 py-4 rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-2 border group ${hasUnconfiguredRoom
            ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed scale-100 shadow-none"
            : "bg-emerald-800 hover:bg-emerald-950 text-white border-emerald-900/10 cursor-pointer active:scale-98 hover:shadow-[0_10px_20px_rgba(6,95,70,0.15)]"
            }`}
        >
          {hasUnconfiguredRoom ? "Configure All Rooms" : "Confirm Luxury Stay"}
          <ArrowRight className={`w-4 h-4 transition-transform ${hasUnconfiguredRoom ? "text-stone-300 animate-pulse" : "text-emerald-200 group-hover:translate-x-1"}`} />
        </button>
      </div>

      <RoomDetailsModal
        selectedRoom={detailingRoom}
        onClose={() => setDetailingRoom(null)}
      />
    </div>
  );
};

export default RoomSelector;