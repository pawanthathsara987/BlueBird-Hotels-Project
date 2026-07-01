import { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import RoomTypeCard from "./RoomTypeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Custom Prev Arrow Component
function PrevArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:shadow-lg text-slate-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Previous slide"
        >
            <ChevronLeft size={24} />
        </button>
    );
}

// Custom Next Arrow Component
function NextArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:shadow-lg text-slate-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Next slide"
        >
            <ChevronRight size={24} />
        </button>
    );
}

export default function RoomTypeCarousel() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [roomPrices, setRoomPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCarouselData = async () => {
            try {
                setIsLoading(true);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const [typesRes, pricesRes] = await Promise.all([
                    axios.get(`${backendUrl}/admin/room-types`),
                    axios.get(`${backendUrl}/admin/room-prices`)
                ]);

                if (typesRes.data && typesRes.data.success) {
                    setRoomTypes(typesRes.data.data || []);
                }
                if (pricesRes.data && pricesRes.data.success) {
                    setRoomPrices(pricesRes.data.data || []);
                }
            } catch (error) {
                console.error("Error loading room type carousel data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCarouselData();
    }, []);

    // Helper to calculate starting price for each room type
    const getStartingPrice = (roomTypeId) => {
        const pricesForType = roomPrices.filter(
            (p) => String(p.roomTypeId || p.roomType?.id || "") === String(roomTypeId)
        );
        if (pricesForType.length === 0) return null;
        const minPrice = Math.min(...pricesForType.map((p) => parseFloat(p.price)));
        return isNaN(minPrice) ? null : minPrice;
    };

    const settings = {
        dots: true,
        infinite: roomTypes.length > 1,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        dotsClass: "slick-dots custom-dots mt-8",
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    arrows: false, // Hide arrows on mobile for better touch experience
                },
            },
        ],
    };

    if (isLoading) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Room Types...</p>
            </div>
        );
    }

    if (roomTypes.length === 0) {
        return null; // Don't render anything if there are no room types
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            {/* Header section with rich aesthetics */}
            <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
                    Accommodations
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Our Luxurious Room Categories
                </h2>
                <p className="mt-4 text-slate-500 text-base sm:text-lg leading-relaxed">
                    Choose from our collection of thoughtfully designed rooms and suites. Experience a blend of ultimate comfort, modern style, and premium amenities.
                </p>
            </div>

            {/* Slider Wrapper */}
            <div className="relative px-2 sm:px-6">
                <Slider {...settings}>
                    {roomTypes.map((rt) => (
                        <div key={rt.id} className="px-3 pb-6">
                            <RoomTypeCard
                                id={rt.id}
                                name={rt.type}
                                image={rt.image_url}
                                price={getStartingPrice(rt.id)}
                                occupancyType={rt.occupancyType}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
