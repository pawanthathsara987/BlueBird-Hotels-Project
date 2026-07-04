import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
    ArrowLeft, 
    Wifi, 
    Tv, 
    Coffee, 
    Utensils, 
    Wind, 
    Shield, 
    Users, 
    Lock, 
    Car, 
    Sparkles, 
    Snowflake, 
    CheckCircle2,
    Calendar
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import FloatingChatbot from "../../components/FloatingChatbot";

// Helper to map amenity names to Lucide icons
const getAmenityIcon = (name) => {
    const norm = name.toLowerCase();
    if (norm.includes("wifi") || norm.includes("internet")) return <Wifi className="w-5 h-5 text-blue-600" />;
    if (norm.includes("tv") || norm.includes("television")) return <Tv className="w-5 h-5 text-blue-600" />;
    if (norm.includes("coffee") || norm.includes("tea") || norm.includes("kettle")) return <Coffee className="w-5 h-5 text-blue-600" />;
    if (norm.includes("breakfast") || norm.includes("dining") || norm.includes("food")) return <Utensils className="w-5 h-5 text-blue-600" />;
    if (norm.includes("ac") || norm.includes("air condition") || norm.includes("cooler")) return <Wind className="w-5 h-5 text-blue-600" />;
    if (norm.includes("safe") || norm.includes("security") || norm.includes("deposit")) return <Lock className="w-5 h-5 text-blue-600" />;
    if (norm.includes("parking")) return <Car className="w-5 h-5 text-blue-600" />;
    if (norm.includes("minibar") || norm.includes("bar") || norm.includes("drink")) return <Utensils className="w-5 h-5 text-blue-600" />;
    if (norm.includes("pool") || norm.includes("jacuzzi") || norm.includes("spa")) return <Sparkles className="w-5 h-5 text-blue-600" />;
    if (norm.includes("fridge") || norm.includes("refrigerator")) return <Snowflake className="w-5 h-5 text-blue-600" />;
    return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
};

// Helper to map tagline and description based on room type name
const getRoomDescription = (typeName) => {
    const norm = (typeName || "").toLowerCase();
    if (norm.includes("presidential") || norm.includes("grand")) {
        return {
            tagline: "Unrivaled coastal majesty, supreme comfort, and elite butler service.",
            description: "The peak of opulent resort living. Our Grand Presidential Suite features a private fitness studio, absolute ocean frontage, and a private butler."
        };
    }
    if (norm.includes("villa") || norm.includes("beach")) {
        return {
            tagline: "Your private beachfront sanctuary with an infinity plunge pool.",
            description: "Step directly onto powdery white sands from your private Beach Villa. Features a plunge pool and open-air rain shower."
        };
    }
    if (norm.includes("suite") || norm.includes("ocean")) {
        return {
            tagline: "Captivating ocean vistas meets sophisticated beach luxury.",
            description: "Gaze upon Indian Ocean panoramas from our Suite. Complete with plush bedding and sun-drenched balcony."
        };
    }
    return {
        tagline: "Refined sanctuary with hand-selected designer touches.",
        description: "Savor elegant coastal living in our Deluxe Room. Featuring custom-crafted furniture and a private sanctuary terrace."
    };
};

export default function RoomTypeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currencyType = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

    const [roomType, setRoomType] = useState(null);
    const [prices, setPrices] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [activeImage, setActiveImage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Scroll to the top of the page on route/id navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [id]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                
                // Fetch room type details, prices, and policies in parallel
                const [typeRes, pricesRes, policyRes] = await Promise.all([
                    axios.get(`${backendUrl}/admin/room-type/${id}`),
                    axios.get(`${backendUrl}/admin/room-prices`),
                    axios.get(`${backendUrl}/roombook/policy`)
                ]);

                if (typeRes.data && typeRes.data.success) {
                    const data = typeRes.data.data;
                    setRoomType(data);
                    
                    // Set cover image as initial active image, fallback to first gallery image
                    setActiveImage(data.image_url || (data.images && data.images[0]) || "");
                } else {
                    setError("Failed to load room type details.");
                }

                if (pricesRes.data && pricesRes.data.success) {
                    // Filter prices configured for this room type
                    const filteredPrices = (pricesRes.data.data || []).filter(
                        (p) => String(p.roomTypeId || p.roomType?.id || "") === String(id)
                    );
                    setPrices(filteredPrices);
                }

                if (policyRes.data && policyRes.data.success) {
                    setPolicy(policyRes.data.data);
                }
            } catch (err) {
                console.error("Error loading room type details:", err);
                setError("Something went wrong while fetching room details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const getStartingPrice = () => {
        if (prices.length === 0) return null;
        const minPrice = Math.min(...prices.map((p) => parseFloat(p.price)));
        return isNaN(minPrice) ? null : minPrice;
    };

    const handleBookNow = () => {
        if (!roomType) return;
        const minPrice = getStartingPrice();

        // Pass the pre-selected room configuration in react-router state
        navigate("/booking", {
            state: {
                selectedRooms: [
                    {
                        frontendRoomId: Date.now(),
                        roomType: roomType.type,
                        adults: roomType.occupancyType?.capacity || 2,
                        kids: 0,
                        kidAges: [],
                        boardType: prices[0]?.boardType?.type || "Room Only",
                        pricePerNight: minPrice || 10000,
                        isConfigured: true,
                        categoryIndex: 0,
                        packageIndex: 0
                    }
                ]
            }
        });
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-between">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="w-14 h-14 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="mt-4 text-slate-500 font-semibold animate-pulse">Loading Room Details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !roomType) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-between">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Failed to Load Room Type</h2>
                        <p className="text-sm mb-4">{error || "The requested room category does not exist."}</p>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">
                            <ArrowLeft size={16} /> Return to Homepage
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Prepare gallery image list. Ensure cover image is included if not already in gallery
    const galleryImages = roomType.images || [];
    const allImages = [...new Set([roomType.image_url, ...galleryImages])].filter(Boolean);
    const minPrice = getStartingPrice();

    // Resolve occupancy type and capacity dynamically from prices list if not set in roomType
    const resolvedOccupancy = roomType.occupancyType || (prices.length > 0 ? prices[0].occupancyType : null);
    const descriptionInfo = getRoomDescription(roomType.type);

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-between">
            <Header />
            
            <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-sm mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </Link>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Title, Images, Description, Amenities, pricing packages */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                                {roomType.type}
                            </h1>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Users size={14} />
                                    <span className="capitalize">{resolvedOccupancy?.type || "Standard"} Occupancy</span>
                                </span>
                                <span className="text-slate-400 text-sm">•</span>
                                <span className="text-slate-600 text-sm">Max {resolvedOccupancy?.capacity || 2} Guests</span>
                            </div>

                            {/* Dynamic Description & Tagline */}
                            <div className="space-y-3 mt-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-lg font-bold text-blue-600 italic leading-snug">
                                    "{descriptionInfo.tagline}"
                                </p>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {descriptionInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                                {activeImage ? (
                                    <img 
                                        src={activeImage} 
                                        alt={roomType.type} 
                                        className="w-full h-full object-cover transition-all duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Images Uploaded
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Row */}
                            {allImages.length > 1 && (
                                <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-hide">
                                    {allImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative w-24 sm:w-28 aspect-[16/10] shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                activeImage === img ? "border-blue-600 scale-95 shadow-md" : "border-transparent opacity-75 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img} alt={`${roomType.type} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Room Amenities */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="text-blue-600" />
                                <span>Room Amenities</span>
                            </h3>
                            
                            {roomType.amenities && roomType.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {roomType.amenities.map((amenity) => (
                                        <div key={amenity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="p-2 bg-white rounded-xl shadow-xs">
                                                {getAmenityIcon(amenity.name)}
                                            </div>
                                            <span className="text-slate-700 text-sm font-semibold">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm">No special amenities configured for this room type.</p>
                            )}
                        </div>

                        {/* Dynamic pricing list by package/board type */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="text-blue-600" />
                                <span>Available Packages & Pricing</span>
                            </h3>

                            {prices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {prices.map((p) => (
                                        <div key={p.id} className="p-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between gap-3 shadow-xs">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                    {p.boardType?.type || "Standard"}
                                                </span>
                                                <h4 className="text-lg font-bold text-slate-800 mt-3">
                                                    {p.boardType?.type} Option
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Includes accommodation and configured meals.
                                                </p>
                                            </div>
                                            <div className="flex items-baseline gap-1 mt-2">
                                                <span className="text-2xl font-extrabold text-slate-900">
                                                    {currencyType} {Number(p.price).toLocaleString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">/ night</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">Standard rates are currently being updated.</p>
                                    <p className="text-xs text-slate-400 mt-1">Contact our desk directly for real-time prices.</p>
                                </div>
                            )}
                        </div>

                        {/* Policies & Guidelines Section */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Shield className="text-blue-600 animate-pulse" />
                                <span>Hotel Policies & Guidelines</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30">
                                    <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Check-In & Check-Out</h4>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Check-In Time: <span className="font-semibold text-slate-700">{policy?.check_in_time || "2:00 PM"}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Check-Out Time: <span className="font-semibold text-slate-700">{policy?.check_out_time || "12:00 PM"}</span>
                                    </p>
                                </div>
                                <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30">
                                    <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Cancellation Policy</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                                        {policy?.cancellation_policy || "Free cancellation up to 48 hours prior to arrival."}
                                    </p>
                                </div>
                                <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30">
                                    <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Refund Handling Time</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                                        Refunds are handled within {policy?.refund_handle_business_days || 15} business days after approval.
                                    </p>
                                </div>
                                <div className="md:col-span-2 space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30">
                                    <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Payment Policy</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                                        {policy?.payment_policy || "Secure booking without deposit."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Pricing Card & Booking Button */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg space-y-6">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                Starting Rate
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-extrabold text-blue-600">
                                    {minPrice !== null ? (
                                        `${currencyType} ${Number(minPrice).toLocaleString()}`
                                    ) : (
                                        "LKR 10,000"
                                    )}
                                </span>
                                <span className="text-sm text-slate-400 font-medium">/ night</span>
                            </div>
                        </div>

                        {/* Room Specifications Quick Summary */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Occupancy Type</span>
                                <span className="font-semibold text-slate-800 capitalize">
                                    {resolvedOccupancy?.type || "Standard"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Max Capacity</span>
                                <span className="font-semibold text-slate-800">
                                    {resolvedOccupancy?.capacity || 2} Persons
                                </span>
                            </div>
                        </div>

                        {/* Action CTA Button */}
                        <button
                            onClick={handleBookNow}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer text-base"
                        >
                            <Calendar size={18} />
                            <span>Book This Room</span>
                        </button>
                    </div>
                </div>
            </main>

            <FloatingChatbot />
            <Footer />
        </div>
    );
}
