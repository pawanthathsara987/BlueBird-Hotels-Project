import { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import TourPackageCard from "./TourPackageCard";
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

export default function TourPackageCarousel() {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                setIsLoading(true);
                const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
                const res = await axios.get(`${backendBaseUrl}/manager/tours`);
                
                if (res.data && res.data.success) {
                    // Only show active tours
                    const activeTours = (res.data.data || []).filter(
                        (tour) => tour.status === "active"
                    );
                    setTours(activeTours);
                }
            } catch (error) {
                console.error("Error loading tour packages for carousel:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTours();
    }, []);

    const settings = {
        dots: true,
        infinite: tours.length > 1,
        speed: 600,
        slidesToShow: Math.min(3, tours.length),
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
                    slidesToShow: Math.min(3, tours.length),
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, tours.length),
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
            <div className="w-full py-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-3 text-slate-500 font-medium animate-pulse text-sm">Loading Tour Packages...</p>
            </div>
        );
    }

    if (tours.length === 0) {
        return null; // Don't render anything if there are no tours
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Header section with rich aesthetics */}
            <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
                    Travel Packages
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Featured Tour Packages
                </h3>
                <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                    Explore Sri Lanka's beautiful destinations with our specially curated tour experiences.
                </p>
            </div>

            {/* Slider Wrapper */}
            <div className="relative px-2 sm:px-6">
                <Slider {...settings}>
                    {tours.map((tour) => (
                        <div key={tour.id} className="px-3 pb-6">
                            <TourPackageCard tour={tour} />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
