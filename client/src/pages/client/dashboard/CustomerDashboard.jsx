import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Compass,
  Car,
  User,
  Sliders,
  Activity
} from "lucide-react";
import { toast } from "react-hot-toast";

// Modularized Dashboard Components
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import OverviewTab from "./OverviewTab";
import BookingsTab from "./BookingsTab";
import ToursTab from "./ToursTab";
import RentalsTab from "./RentalsTab";
import PaymentsTab from "./PaymentsTab";
import ReviewsTab from "./ReviewsTab";
import ProfileTab from "./ProfileTab";
import NotificationsTab from "./NotificationsTab";
import DashboardModals from "./DashboardModals";

// ==========================================
// DUMMY DATA DEFINITIONS
// ==========================================

const INITIAL_PROFILE = {
  name: "Pawanthathsara Thathsara",
  email: "pawanthathsara987@gmail.com",
  phone: "+1 (555) 019-4829",
  address: "742 Evergreen Terrace, Beverly Hills, CA 90210",
  currency: "USD ($)",
  language: "English (US)",
  emergencyContact: "Anjana Thathsara (+1 555-019-9031)",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
};

const INITIAL_BOOKINGS = [
  {
    id: "BB-2026-8942",
    hotelName: "The Azure Velvet Sands Resort & Spa",
    location: "Grand Baie, Mauritius",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
    checkIn: "2026-10-14",
    checkOut: "2026-10-20",
    nights: 6,
    rooms: [
      { type: "Royal Ocean Overwater Suite", guests: "2 Adults" },
      { type: "Deluxe Beachfront Twin Room", guests: "1 Adult, 1 Child" }
    ],
    guestsSummary: "3 Adults, 1 Child",
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 3850.00,
    airportTransfer: "Requested - Flight EK 701 (14:30)",
    amenities: ["Private Infinity Pool Access", "24/7 Butler Service", "Complimentary Spa Ritual"]
  },
  {
    id: "BB-2026-1104",
    hotelName: "Grand blue Alpine Chalet",
    location: "Zermatt, Switzerland",
    image: "https://images.unsplash.com/photo-1518019382147-37c065706598?auto=format&fit=crop&w=600&q=80",
    checkIn: "2026-12-22",
    checkOut: "2026-12-28",
    nights: 6,
    rooms: [
      { type: "Matterhorn Panoramic Penthouse", guests: "2 Adults" }
    ],
    guestsSummary: "2 Adults",
    status: "Confirmed",
    paymentStatus: "Deposit Paid",
    amount: 7200.00,
    airportTransfer: "Not Requested",
    amenities: ["Ski-in/Ski-out Access", "Private Sauna & Hot Tub", "Heated Ski Gear Locker"]
  }
];

const INITIAL_TOURS = [
  {
    id: "BB-TOUR-4029",
    destination: "Helicopter Vineyard Tour & Gourmet Tasting",
    location: "Stellenbosch Valley & Coastal Range, South Africa",
    requestedDate: "2026-10-16",
    groupSize: "4 Adults",
    status: "Approved",
    price: 1850.00,
    conciergeNotes: "Dear Mr. Thathsara, we have secured a private Airbus H125 helicopter for your group on October 16th. The estate sommelier at Delaire Graff has confirmed your vintage pairings and reserve library access. We await your final payment signature.",
    lastUpdated: "2026-05-20"
  },
  {
    id: "BB-TOUR-8032",
    destination: "Private Sunset Yacht Charter & Deep Sea Angling",
    location: "Maldivian Atoll Coastline, Maldives",
    requestedDate: "2026-11-08",
    groupSize: "2 Adults",
    status: "Pending Review",
    price: 3400.00,
    conciergeNotes: "We are currently negotiating exclusive slip clearance at the private marina for the 78ft Benetti Yacht. We will notify you immediately once the Captain provides the marine path clearance.",
    lastUpdated: "2026-05-22"
  }
];

const INITIAL_VEHICLES = [
  {
    id: "BB-CAR-0492",
    model: "Porsche 911 Carrera 4S Cabriolet",
    type: "Sports Convertible",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
    pickupLocation: "Munich Airport Terminal 2",
    dropoffLocation: "Zurich International Airport",
    startDate: "2026-09-04",
    endDate: "2026-09-11",
    status: "Ready for Pickup",
    price: 1820.00,
    unlimitedMileage: true
  },
  {
    id: "BB-CAR-9031",
    model: "Range Rover Autobiography LWB",
    type: "Luxury SUV",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&w=600&q=80",
    pickupLocation: "Zurich International Airport",
    dropoffLocation: "Zurich International Airport",
    startDate: "2026-12-22",
    endDate: "2026-12-28",
    status: "Confirmed",
    price: 2450.00,
    unlimitedMileage: true
  }
];

const INITIAL_PAYMENTS = [
  {
    id: "BB-PAY-8842",
    date: "2026-05-18",
    description: "Azure Velvet Sands Resort Deposit",
    method: "Visa ending in 4829",
    amount: 3850.00,
    status: "Succeeded"
  },
  {
    id: "BB-PAY-0492",
    date: "2026-04-12",
    description: "Porsche 911 Rental Full Prep",
    method: "Apple Pay (Gold Card)",
    amount: 1820.00,
    status: "Succeeded"
  },
  {
    id: "BB-PAY-1002",
    date: "2026-03-01",
    description: "Refund - Grand Tokyo Suite cancellation",
    method: "Visa ending in 4829",
    amount: -1200.00,
    status: "Refunded"
  }
];

const INITIAL_REVIEWS = [
  {
    id: "REV-101",
    propertyName: "The Kyoto Imperial Ryokan",
    location: "Kyoto, Japan",
    rating: 5,
    comment: "An absolutely breathtaking cultural sanctuary. The personal hot spring Onsen and kaiseki dinner service were beyond premium. Exemplary hospitality that reflects true gold-standard luxury.",
    date: "2026-05-02"
  },
  {
    id: "REV-102",
    propertyName: "Mandarin Oriental New York",
    location: "New York, USA",
    rating: 4,
    comment: "Stunning skyline views of Central Park and an exceptional thermal spa. Check-in had a minor delay, but the head concierge immediately resolved it and sent customized signature champagne to our suite.",
    date: "2026-02-18"
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-1",
    title: "Exclusive Complimentary Upgrade Offer",
    message: "Your upcoming stay at Azure Velvet Sands qualifies for an exclusive Royal Overwater Suite upgrade at 40% off or complimentary beachside dining credits. Check details with your butler.",
    time: "2 hours ago",
    read: false,
    type: "upgrade"
  },
  {
    id: "NOTIF-2",
    title: "Private Stellenbosch Helicopter Tour Approved",
    message: "Your Stellenbosch Helicopter Tour and vineyard tasting has been approved and locked. View tour details to finalize confirmation.",
    time: "1 day ago",
    read: false,
    type: "booking"
  }
];

// ==========================================
// CORE COMPONENT
// ==========================================

export default function CustomerDashboard() {
  const navigate = useNavigate();

  // Reactive Core State
  const [profile, setProfile] = useState({
    name: "Loading...",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneNumber: "",
    address: "",
    country: "",
    idType: "NIC",
    idNumber: "",
    currency: "USD ($)",
    language: "English (US)",
    emergencyContact: "Desk Agent (+1 555-019-9031)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  });
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({ totalPaid: 0, totalRefunded: 0, totalPending: 0, totalTransactions: 0 });
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Control UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showRealPII, setShowRealPII] = useState(false);

  // Modals & Dynamic Form States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneNumber: "",
    address: "",
    country: "",
    idType: "NIC",
    idNumber: "",
    currency: "USD ($)",
    language: "English (US)",
    emergencyContact: "Desk Agent (+1 555-019-9031)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  });
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    propertyName: "The Azure Velvet Sands Resort & Spa",
    rating: 5,
    comment: ""
  });

  // Cancel Booking State
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);

  // Load live data from the backend APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      let token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      if (token === "undefined" || token === "null") {
        sessionStorage.removeItem("customerToken");
        localStorage.removeItem("customerToken");
        token = null;
      }
      if (!token) {
        toast.error("Please login to access the dashboard", { id: "auth-toast" });
        navigate("/customerLogin");
        return;
      }

      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        // 1. Fetch Profile
        const profileRes = await axios.get(`${backendUrl}/customers/profile`, { headers });
        const pData = profileRes.data.data;
        const profileObj = {
          name: `${pData.firstName || ""} ${pData.lastName || ""}`.trim() || "Valued Guest",
          firstName: pData.firstName || "",
          lastName: pData.lastName || "",
          email: pData.email || "",
          phone: pData.phoneNumber || "Not Provided",
          phoneNumber: pData.phoneNumber || "Not Provided",
          address: pData.address || "Not Provided",
          country: pData.country || "Not Provided",
          idType: pData.idType || "NIC",
          idNumber: pData.idNumber || "",
          currency: "USD ($)",
          language: "English (US)",
          emergencyContact: "Desk Agent (+1 555-019-9031)",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
        };
        setProfile(profileObj);
        setEditProfileForm(profileObj);

        // 2. Fetch Bookings (Hotel stays)
        const bookingsRes = await axios.get(`${backendUrl}/customers/bookings`, { headers });
        const rawBookings = bookingsRes.data.data;
        const mappedBookings = rawBookings.map(b => {
          // Dates: pull from first booked room's checkIn/checkOut
          const firstRoom = b.bookedRooms?.[0];
          const checkIn = firstRoom?.checkIn || b.createdAt;
          let checkOut = firstRoom?.checkOut || checkIn;
          b.bookedRooms?.forEach(r => {
            if (new Date(r.checkOut) > new Date(checkOut)) {
              checkOut = r.checkOut;
            }
          });
          const msPerDay = 1000 * 60 * 60 * 24;
          const nights = Math.max(1, Math.round(Math.abs(new Date(checkOut) - new Date(checkIn)) / msPerDay));

          // Rooms: get room type name and guest count from each booked room
          const rooms = b.bookedRooms?.map(r => ({
            type: r.Room?.roomType?.type || r.Room?.RoomType?.type || "Deluxe Room",
            roomNumber: r.Room?.room_number ? `Room ${r.Room.room_number}` : "",
            guests: `${r.adults || 1} Adult${(r.adults || 1) > 1 ? 's' : ''}` + (r.kids > 0 ? `, ${r.kids} Child${r.kids > 1 ? 'ren' : ''}` : "")
          })) || [];

          let totalAdults = 0;
          let totalKids = 0;
          b.bookedRooms?.forEach(r => {
            totalAdults += r.adults || 0;
            totalKids += r.kids || 0;
          });
          const guestsSummary = `${totalAdults} Adult${totalAdults !== 1 ? 's' : ''}` + (totalKids > 0 ? `, ${totalKids} Child${totalKids > 1 ? 'ren' : ''}` : "");

          // Airport pickup
          const pickupMatch = bookingsRes.data.airportPickups?.find(p => p.booking_id === b.id || p.guest_id === b.customer_id);
          const airportTransfer = pickupMatch 
            ? `Requested - ${new Date(pickupMatch.pickup_date).toLocaleDateString()} at ${pickupMatch.pickup_time || ""}`
            : "Not Requested";

          // Room type image if available
          const firstRoomTypeImg = b.bookedRooms?.[0]?.Room?.roomType?.image_url;
          const fallbackImages = [
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1518019382147-37c065706598?auto=format&fit=crop&w=600&q=80"
          ];
          const imgUrl = firstRoomTypeImg || fallbackImages[b.id % fallbackImages.length];

          // Payment status from associated payments
          const paidPayment = b.payments?.find(p => p.status === "success" || p.status === "paid");
          let displayStatus = b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : "Pending";
          let paymentStatus = "Unpaid";
          if (paidPayment) {
            paymentStatus = "Paid";
          } else if (b.status === "confirmed" || b.status === "completed") {
            paymentStatus = "Paid";
          } else if (b.status === "cancelled") {
            paymentStatus = "Cancelled";
          }

          const totalAmount = parseFloat(b.total_price) || 0;

          return {
            id: `BB-BK-${b.id}`,
            realId: b.id,
            hotelName: "BlueBird Luxury Hotels & Resorts",
            location: "Galle Face, Colombo, Sri Lanka",
            image: imgUrl,
            checkIn,
            checkOut,
            nights,
            rooms,
            guestsSummary,
            status: displayStatus,
            paymentStatus,
            amount: totalAmount,
            airportTransfer,
            amenities: ["24/7 Concierge Service", "Infinity Pool Access", "Complimentary Breakfast"],
            note: b.note || "",
            tax: b.tax || 0,
            taxPercentage: b.tax_percentage || 0
          };
        });
        setBookings(mappedBookings);

        // 3. Fetch Rentals (Vehicles)
        const rentalsRes = await axios.get(`${backendUrl}/customers/rentals`, { headers });
        const rawRentals = rentalsRes.data.data;
        const mappedRentals = rawRentals.map(r => ({
          id: `BB-CAR-${r.id}`,
          realId: r.id,
          model: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : "Premium Fleet Vehicle",
          type: r.vehicle?.capacity ? `${r.vehicle.capacity} Seater` : "Luxury Car",
          image: r.vehicle?.image || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
          pickupLocation: r.pickupLocation || "Airport Terminal",
          dropoffLocation: r.dropoffLocation || "Airport Terminal",
          startDate: r.pickupDatetime,
          endDate: r.returnDatetime,
          status: r.status.replace("_", " ").toUpperCase(),
          price: parseFloat(r.totalPayable),
          unlimitedMileage: true
        }));
        setVehicles(mappedRentals);

        // 4. Fetch Tours
        const toursRes = await axios.get(`${backendUrl}/customers/tours`, { headers });
        const rawTours = toursRes.data.data;
        const mappedTours = rawTours.map(t => {
          const notes = t.specialRequests || "No special requests submitted.";
          const reply = t.status === "accepted" 
            ? "Your excursion request has been accepted. We have locked details in your itinerary." 
            : t.status === "rejected" 
              ? `We regret that we cannot fulfill this excursion: ${t.rejectionReason || "Slot unavailable"}`
              : "We are currently reviewing your custom excursion request with our ground guide team.";

          return {
            id: t.inquiryRef || `BB-TOUR-${t.id}`,
            realId: t.id,
            destination: t.Tour?.packageName || "Curated Excursion",
            location: t.Tour?.location || "Sri Lanka Coastline",
            requestedDate: t.startDate,
            groupSize: `${t.numberOfAdults} Adults` + (t.numberOfChildren > 0 ? `, ${t.numberOfChildren} Kids` : ""),
            status: t.status === "accepted" ? "Approved" : t.status === "rejected" ? "Declined" : "Pending Review",
            price: parseFloat(t.Tour?.price || 0),
            conciergeNotes: reply,
            lastUpdated: new Date(t.updatedAt).toLocaleDateString()
          };
        });
        setTours(mappedTours);

        // 5. Fetch Payments
        const paymentsRes = await axios.get(`${backendUrl}/customers/payments`, { headers });
        setPayments(paymentsRes.data.data || []);
        if (paymentsRes.data.summary) {
          setPaymentSummary(paymentsRes.data.summary);
        }

        // Update empty state flag if nothing exists
        if (mappedBookings.length === 0 && mappedRentals.length === 0 && mappedTours.length === 0) {
          setIsEmptyState(true);
        } else {
          setIsEmptyState(false);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          sessionStorage.removeItem("customerToken");
          localStorage.removeItem("customerToken");
          toast.error("Your session has expired. Please login again.", { id: "auth-toast" });
          navigate("/customerLogin");
        } else {
          toast.error("Failed to load dashboard data from database.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    const handleStorageChange = (e) => {
      if (!e.key || e.key === "customerToken") {
        const storedToken = localStorage.getItem("customerToken");
        if (!storedToken) {
          sessionStorage.removeItem("customerToken");
          toast.error("Session closed in another tab. Redirecting to home...", { id: "auth-toast" });
          navigate("/");
        } else if (e.newValue) {
          sessionStorage.setItem("customerToken", e.newValue);
          fetchDashboardData();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // Simulation helper to demonstrate skeleton state
  const handleTriggerSkeleton = () => {
    setIsLoading(true);
    toast.success("Simulating premium skeleton load...", {
      icon: "⏳",
      style: {
        borderRadius: '8px',
        background: '#172554',
        color: '#fff',
      }
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  // PII Masking Utilities
  const maskEmail = (email) => {
    if (showRealPII) return email;
    const [user, domain] = email.split("@");
    return `${user.substring(0, 3)}*********@${domain}`;
  };

  const maskPhone = (phone) => {
    if (showRealPII) return phone;
    return phone.replace(/(\d{3})-(\d{4})/, "***-$2");
  };

  const maskCard = (cardStr) => {
    if (showRealPII) return cardStr;
    return cardStr.replace(/ending in (\d+)/, "ending in •••• $1");
  };

  // Manage Review Addition
  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewForm.comment.trim()) {
      toast.error("Please fill in a comment");
      return;
    }
    const addedReview = {
      id: `REV-${Date.now()}`,
      propertyName: newReviewForm.propertyName,
      location: newReviewForm.propertyName.includes("Sands") ? "Grand Baie, Mauritius" : "Zermatt, Switzerland",
      rating: newReviewForm.rating,
      comment: newReviewForm.comment,
      date: new Date().toISOString().split("T")[0]
    };
    setReviews(prev => [addedReview, ...prev]);
    setIsAddReviewOpen(false);
    setNewReviewForm({
      propertyName: "The Azure Velvet Sands Resort & Spa",
      rating: 5,
      comment: ""
    });
    toast.success("Thank you! Your luxury review has been published.", {
      style: {
        borderRadius: '8px',
        background: '#1e3a8a',
        color: '#fff',
      }
    });
  };

  // Manage Profile Settings Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
    if (!token) {
      toast.error("Please login to update profile");
      return;
    }

    const nameParts = editProfileForm.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/customers/update-profile`, {
        firstName,
        lastName,
        phoneNumber: editProfileForm.phone,
        country: editProfileForm.country,
        idType: editProfileForm.idType,
        idNumber: editProfileForm.idNumber,
        address: editProfileForm.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.token) {
        if (localStorage.getItem("customerToken")) {
          localStorage.setItem("customerToken", res.data.token);
        }
        sessionStorage.setItem("customerToken", res.data.token);
      }

      const p = res.data.user;
      const updatedProfile = {
        name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Valued Guest",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        email: p.email || "",
        phone: p.phoneNumber || "Not Provided",
        phoneNumber: p.phoneNumber || "Not Provided",
        address: p.address || "Not Provided",
        country: p.country || "Not Provided",
        idType: p.idType || "NIC",
        idNumber: p.idNumber || "",
        currency: profile.currency,
        language: profile.language,
        emergencyContact: profile.emergencyContact,
        avatar: profile.avatar
      };

      setProfile(updatedProfile);
      setEditProfileForm(updatedProfile);
      setIsEditProfileOpen(false);
      toast.success("Luxury Profile details updated seamlessly.");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("customerToken");
        sessionStorage.removeItem("customerToken");
        toast.error("Your session has expired. Please login again.");
        navigate("/customerLogin");
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    }
  };

  // Cancel Booking Request Flow
  const handleInitiateCancel = (booking) => {
    setSelectedBookingForCancel(booking);
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
    if (!token) {
      toast.error("Please login to cancel bookings");
      return;
    }

    try {
      const bookingId = selectedBookingForCancel.realId;
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/customers/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(prev =>
        prev.map(b => b.id === selectedBookingForCancel.id ? { ...b, status: "Cancelled" } : b)
      );
      setIsCancelConfirmOpen(false);
      toast.success(`Booking ${selectedBookingForCancel.id} has been cancelled successfully.`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("customerToken");
        sessionStorage.removeItem("customerToken");
        toast.error("Your session has expired. Please login again.");
        navigate("/customerLogin");
      } else {
        toast.error(err.response?.data?.message || "Failed to cancel booking");
      }
    } finally {
      setSelectedBookingForCancel(null);
    }
  };

  // Notification Read Toggle
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  // Filter helper based on search query
  const filterList = (list, key) => {
    if (!searchQuery) return list;
    return list.filter(item => {
      const val = item[key] || "";
      return val.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // SKELETON RENDERER
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="h-28 bg-blue-900/5 rounded-2xl border border-blue-100/10 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-blue-900/10 rounded"></div>
              <div className="h-8 w-8 bg-blue-900/10 rounded-full"></div>
            </div>
            <div className="h-6 w-32 bg-blue-900/15 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        <div className="lg:col-span-2 h-96 bg-blue-900/5 rounded-2xl border border-blue-100/10 p-6 space-y-4">
          <div className="h-6 w-48 bg-blue-900/10 rounded"></div>
          <div className="h-48 bg-blue-900/5 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-900/10 rounded w-full"></div>
            <div className="h-4 bg-blue-900/10 rounded w-5/6"></div>
          </div>
        </div>
        <div className="h-96 bg-blue-900/5 rounded-2xl border border-blue-100/10 p-6 space-y-4 font-sans">
          <div className="h-6 w-32 bg-blue-900/10 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex space-x-3 items-center">
                <div className="h-10 w-10 bg-blue-900/10 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-blue-900/10 rounded w-1/2"></div>
                  <div className="h-3 bg-blue-900/10 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white antialiased">

      {/* STICKY TOP HEADER */}
      <DashboardHeader
        profile={profile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
        setNotifications={setNotifications}
        isProfileDropdownOpen={isProfileDropdownOpen}
        setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        isNotifDropdownOpen={isNotifDropdownOpen}
        setIsNotifDropdownOpen={setIsNotifDropdownOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        showRealPII={showRealPII}
        setShowRealPII={setShowRealPII}
        setActiveTab={setActiveTab}
        handleMarkAllRead={handleMarkAllRead}
        maskEmail={maskEmail}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex relative overflow-hidden min-h-0">

        {/* SIDEBAR NAVIGATION (Desktop & Mobile drawer inside) */}
        <DashboardSidebar
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
          bookings={bookings}
          tours={tours}
          isEmptyState={isEmptyState}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* MAIN CONTENT PANE */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">

          {/* SKELETON / LOADING ROUTER */}
          {isLoading ? renderSkeleton() : (
            <div className="space-y-8 max-w-7xl mx-auto">

              {/* TAB VIEW RENDERS */}

              {activeTab === "overview" && (
                <OverviewTab
                  profile={profile}
                  bookings={bookings}
                  tours={tours}
                  vehicles={vehicles}
                  isEmptyState={isEmptyState}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "bookings" && (
                <BookingsTab
                  bookings={bookings}
                  setBookings={setBookings}
                  isEmptyState={isEmptyState}
                  handleInitiateCancel={handleInitiateCancel}
                  filterList={filterList}
                />
              )}

              {activeTab === "tours" && (
                <ToursTab
                  tours={tours}
                  setTours={setTours}
                  isEmptyState={isEmptyState}
                  filterList={filterList}
                />
              )}

              {activeTab === "rentals" && (
                <RentalsTab
                  vehicles={vehicles}
                  isEmptyState={isEmptyState}
                  filterList={filterList}
                />
              )}

              {activeTab === "payments" && (
                <PaymentsTab
                  payments={payments}
                  paymentSummary={paymentSummary}
                  isEmptyState={isEmptyState}
                  maskCard={maskCard}
                />
              )}

              {activeTab === "reviews" && (
                <ReviewsTab
                  reviews={reviews}
                  isEmptyState={isEmptyState}
                  setIsAddReviewOpen={setIsAddReviewOpen}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab
                  profile={profile}
                  setEditProfileForm={setEditProfileForm}
                  setIsEditProfileOpen={setIsEditProfileOpen}
                  showRealPII={showRealPII}
                  setShowRealPII={setShowRealPII}
                  maskEmail={maskEmail}
                  maskPhone={maskPhone}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationsTab
                  notifications={notifications}
                  setNotifications={setNotifications}
                  handleMarkAllRead={handleMarkAllRead}
                  isEmptyState={isEmptyState}
                />
              )}

            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sticky bottom-0 z-30 md:hidden bg-blue-950 border-t border-blue-900 flex justify-around items-center py-2 px-1 text-white">
        {[
          { id: "overview", label: "Overview", icon: <Sliders size={18} /> },
          { id: "bookings", label: "Stays", icon: <Calendar size={18} /> },
          { id: "tours", label: "Tours", icon: <Compass size={18} /> },
          { id: "rentals", label: "Rentals", icon: <Car size={18} /> },
          { id: "profile", label: "Profile", icon: <User size={18} /> }
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => {
              setActiveTab(nav.id);
              setSearchQuery("");
            }}
            className={`flex flex-col items-center space-y-0.5 px-2.5 py-1.5 rounded-xl transition-all focus:outline-none ${activeTab === nav.id ? 'text-amber-400 scale-105' : 'text-blue-300/70 hover:text-white'}`}
          >
            {nav.icon}
            <span className="text-[9px] font-medium tracking-wider">{nav.label}</span>
          </button>
        ))}
      </nav>

      {/* CONSOLIDATED MODALS */}
      <DashboardModals
        isEditProfileOpen={isEditProfileOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
        editProfileForm={editProfileForm}
        setEditProfileForm={setEditProfileForm}
        handleSaveProfile={handleSaveProfile}

        isAddReviewOpen={isAddReviewOpen}
        setIsAddReviewOpen={setIsAddReviewOpen}
        newReviewForm={newReviewForm}
        setNewReviewForm={setNewReviewForm}
        handleAddReviewSubmit={handleAddReviewSubmit}

        isCancelConfirmOpen={isCancelConfirmOpen}
        setIsCancelConfirmOpen={setIsCancelConfirmOpen}
        selectedBookingForCancel={selectedBookingForCancel}
        handleConfirmCancel={handleConfirmCancel}
      />

    </div>
  );
}
