import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { 
    Award, 
    Compass, 
    Heart, 
    Target, 
    Eye, 
    Star, 
    ShieldCheck, 
    MapPin, 
    Coffee, 
    Sparkles 
} from "lucide-react";

// Import images from assets folder
import frontImage from "../assets/slider Images/front-2048x1014.jpg";
import roomImage from "../assets/slider Images/home-slider2-2048x1014.jpg";
import diningImage from "../assets/slider Images/restaurent-2048x1014.jpg";
import travelImage from "../assets/slider Images/home-slider4-2048x1014.jpg";
import carImage from "../assets/slider Images/luxury_car.png";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
            <Header />

            {/* ── HERO BANNER ── */}
            <section className="relative w-full h-[380px] md:h-[450px] flex items-center justify-center overflow-hidden bg-stone-900">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={frontImage} 
                        alt="BlueBird Hotels Luxury Resort" 
                        className="w-full h-full object-cover object-center opacity-40 scale-105 hover:scale-100 transition-transform duration-10000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400">Discover BlueBird</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white font-serif tracking-tight">Our Legacy & Passion</h1>
                    <div className="w-16 h-[2px] bg-sky-500 mx-auto my-2" />
                    <p className="text-sm md:text-lg text-stone-200 leading-relaxed font-light font-serif">
                        Crafting exceptional sanctuary and island adventure experiences in the heart of Negombo.
                    </p>
                </div>
            </section>

            {/* ── LEGACY & STATS SECTION ── */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 md:py-24 space-y-20">
                
                {/* Introduction Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sky-600 font-extrabold text-xs uppercase tracking-wider">
                            <Sparkles size={16} />
                            <span>Who We Are</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-stone-900 leading-tight">
                            Welcoming travelers from across the globe with warmth & luxury
                        </h2>
                        <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                            Established with the vision of offering a seamless blending of pristine beachside sanctuary and rich culture, 
                            Blue Bird Hotels has grown to become a cornerstone of hospitality in Negombo. We specialize in curating tailored stay 
                            experiences with deep access to Ayurvedic therapy, personalized island tours, airport transfers, and exceptional local cuisines.
                        </p>
                        <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                            From modern suite amenities and relaxing family rooms to lush wellness packages, every detail is engineered 
                            to offer convenience, leisure, and absolute tranquility.
                        </p>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                        <img 
                            src={roomImage} 
                            alt="Luxury hospitality" 
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-sky-950/10 mix-blend-multiply" />
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    {/* Stat card 1 */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-4xl font-extrabold text-stone-900 font-serif">24 Years</span>
                            <span className="block text-xs font-bold text-sky-600 uppercase tracking-wide mt-1">Excellence & Hospitality</span>
                        </div>
                        <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
                            A legacy of 24 years delivering premium luxury services, wellness retreats, and memorable stays for global travelers.
                        </p>
                    </div>

                    {/* Stat card 2 */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                            <Compass className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-4xl font-extrabold text-stone-900 font-serif">300+ Tours</span>
                            <span className="block text-xs font-bold text-sky-600 uppercase tracking-wide mt-1">Completed Adventures</span>
                        </div>
                        <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
                            Bespoke travels, historical excursions, and cultural tours successfully completed through our dedicated travel desks.
                        </p>
                    </div>

                    {/* Stat card 3 */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-4xl font-extrabold text-stone-900 font-serif">98% Satisfied</span>
                            <span className="block text-xs font-bold text-sky-600 uppercase tracking-wide mt-1">Client Satisfaction</span>
                        </div>
                        <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
                            Exceptional customer reviews highlighting our guest care, luxurious rooms, and personalized travel coordination.
                        </p>
                    </div>
                </div>

                {/* ── CORE SERVICES SECTION ── */}
                <div className="pt-8 space-y-8">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-600">What We Offer</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-900">Our Core Offerings</h2>
                        <p className="text-xs md:text-sm text-stone-500 max-w-xl mx-auto">
                            Providing a premium suite of hospitality, culinary, and travel services designed for an unforgettable Sri Lankan journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service Card 1 */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={roomImage} 
                                    alt="Luxury Rooms" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold font-serif text-stone-950">Luxury Accommodation</h3>
                                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                                        Relax in our beautifully designed suites and family rooms offering premium luxury, standard amenities, and absolute comfort.
                                    </p>
                                </div>
                                <Link to="/rooms" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Book a Room &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Service Card 2 */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={carImage} 
                                    alt="Vehicle Rentals" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold font-serif text-stone-950">Premium Vehicle Rental</h3>
                                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                                        Rent standard and luxury cars, vans, or SUVs for your personal excursions or business needs, available with or without drivers.
                                    </p>
                                </div>
                                <Link to="/vehicles" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Rent a Vehicle &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Service Card 3 */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={travelImage} 
                                    alt="Travels & Tours" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold font-serif text-stone-950">Travels & Excursions</h3>
                                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                                        Explore historic cities, wildlife safaris, and nature excursions in Sri Lanka with our curated tours and private vehicle rentals.
                                    </p>
                                </div>
                                <Link to="/booking/tour" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Explore Tours &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── VISION & MISSION ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8">
                    {/* Vision Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white p-8 shadow-xl border border-stone-800 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Eye size={120} className="text-white" />
                        </div>
                        <div className="flex items-center gap-3 text-sky-400">
                            <Eye size={22} />
                            <h3 className="text-xl font-bold font-serif uppercase tracking-wider">Our Vision</h3>
                        </div>
                        <div className="w-10 h-[1.5px] bg-sky-500 my-4" />
                        <p className="text-sm md:text-base text-stone-300 leading-relaxed font-serif">
                            To be recognized as the premier destination for authentic Sri Lankan hospitality, setting the standard for holistic wellness, 
                            luxury beachside accommodation, and curated island adventures that connect travelers with the rich heritage of Sri Lanka.
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900 to-sky-950 text-white p-8 shadow-xl border border-sky-800 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Target size={120} className="text-white" />
                        </div>
                        <div className="flex items-center gap-3 text-sky-300">
                            <Target size={22} />
                            <h3 className="text-xl font-bold font-serif uppercase tracking-wider">Our Mission</h3>
                        </div>
                        <div className="w-10 h-[1.5px] bg-sky-300 my-4" />
                        <p className="text-sm md:text-base text-sky-100 leading-relaxed font-serif">
                            To create personalized, authentic experiences for our guests by providing exceptional accommodation, rejuvenation through 
                            traditional Ayurveda, seamless island travel integration, and uncompromising services that prioritize guest delight and sustainable tourism.
                        </p>
                    </div>
                </div>

                {/* ── CORE VALUES ── */}
                <div className="pt-8 space-y-8 text-center">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-600">The Principles We Stand For</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-900">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {/* Value 1 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-xs flex gap-4">
                            <div className="text-sky-600 shrink-0 mt-0.5">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-stone-900 font-serif">Integrity & Excellence</h4>
                                <p className="text-xs text-stone-500 leading-normal">Uncompromising standards in every detail of room and guest services.</p>
                            </div>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-xs flex gap-4">
                            <div className="text-sky-600 shrink-0 mt-0.5">
                                <MapPin size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-stone-900 font-serif">Authentic Connections</h4>
                                <p className="text-xs text-stone-500 leading-normal">Deep pride in connecting guests to Negombo and Sri Lankan heritage.</p>
                            </div>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-xs flex gap-4">
                            <div className="text-sky-600 shrink-0 mt-0.5">
                                <Coffee size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-stone-900 font-serif">Bespoke Comfort</h4>
                                <p className="text-xs text-stone-500 leading-normal">Tailoring stays, airport pickups, and packages for individual needs.</p>
                            </div>
                        </div>

                        {/* Value 4 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-xs flex gap-4">
                            <div className="text-sky-600 shrink-0 mt-0.5">
                                <Star size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-stone-900 font-serif">Wellness & Rejuvenation</h4>
                                <p className="text-xs text-stone-500 leading-normal">Dedicated healing focus with traditional Sri Lankan Ayurvedic spa arts.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONTACT CALL-TO-ACTION CARD ── */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-xl border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <span className="text-[10px] text-sky-400 font-black uppercase tracking-wider">Start Your Story With Us</span>
                        <h3 className="text-xl md:text-2xl font-extrabold font-serif">Ready to experience the beauty of Negombo?</h3>
                        <p className="text-xs text-stone-400 leading-normal max-w-xl">
                            Plan your luxury accommodations, explore curated tours, and enjoy authentic hospitality tailored exactly for you.
                        </p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                        <Link 
                            to="/rooms" 
                            className="bg-white hover:bg-stone-100 active:scale-95 text-stone-900 font-bold px-6 py-3 rounded-xl text-xs transition duration-200 shadow-md whitespace-nowrap cursor-pointer"
                        >
                            Explore Rooms
                        </Link>
                        <Link 
                            to="/contact" 
                            className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-xs transition duration-200 shadow-md shadow-sky-600/10 whitespace-nowrap cursor-pointer"
                        >
                            Get In Touch
                        </Link>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
