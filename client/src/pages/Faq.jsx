import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { 
    Search, 
    ChevronDown, 
    HelpCircle, 
    CreditCard, 
    BedDouble, 
    MapPin, 
    Globe, 
    Gift,
    MessageSquare,
    ArrowRight
} from "lucide-react";

export default function FaqPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [openIndex, setOpenIndex] = useState(null);

    const categories = [
        { id: "all", label: "All Questions", icon: HelpCircle },
        { id: "general", label: "General", icon: HelpCircle },
        { id: "booking", label: "Booking & Payment", icon: CreditCard },
        { id: "rooms", label: "Rooms & Facilities", icon: BedDouble },
        { id: "transport", label: "Location & Transport", icon: MapPin },
        { id: "foreign", label: "Foreign Guests 🌍", icon: Globe },
        { id: "local", label: "Local Guests 🇱🇰", icon: Gift }
    ];

    const faqs = [
        // General Questions
        {
            id: 1,
            category: "general",
            question: "What are the check-in and check-out times?",
            answer: "Check-in is available from 2:00 PM to 11:59 PM. Check-out is from 12:00 AM (midnight) to 12:00 PM (noon)."
        },
        {
            id: 2,
            category: "general",
            question: "Do you offer early check-in or late check-out?",
            answer: "Yes, subject to availability. Extra charges may apply. Please notify us of your request prior to arrival."
        },
        {
            id: 3,
            category: "general",
            question: "Is the hotel suitable for families?",
            answer: "Yes, we provide family-friendly rooms, services, and special amenities for kids to ensure a comfortable stay."
        },
        // Booking & Payment
        {
            id: 4,
            category: "booking",
            question: "How can I make a reservation?",
            answer: "You can book directly through our website or contact our reservations desk via email or phone."
        },
        {
            id: 5,
            category: "booking",
            question: "What payment methods do you accept?",
            answer: "We accept cash (LKR, USD, EUR), major credit/debit cards (Visa, MasterCard), and online payment bank transfers."
        },
        {
            id: 6,
            category: "booking",
            question: "Can I cancel my booking?",
            answer: "Yes, cancellations are allowed based on our booking policies. Please check your reservation details for specific terms."
        },
        // Rooms & Facilities
        {
            id: 7,
            category: "rooms",
            question: "Do you provide free Wi-Fi?",
            answer: "Yes, complimentary high-speed Wi-Fi is available in all guest rooms, lobby areas, and public spaces."
        },
        {
            id: 8,
            category: "rooms",
            question: "Is breakfast included?",
            answer: "Yes, a delicious breakfast is included with most of our standard room packages."
        },
        {
            id: 9,
            category: "rooms",
            question: "Do rooms have air conditioning?",
            answer: "Yes, all our luxury rooms are fully equipped with individual climate control air conditioning systems."
        },
        // Location & Transport
        {
            id: 10,
            category: "transport",
            question: "Do you provide airport pickup?",
            answer: "Yes, airport pickup and drop-off transfers can be arranged on request. Please contact us with your flight details."
        },
        {
            id: 11,
            category: "transport",
            question: "Is parking available?",
            answer: "Yes, free secure parking is available for all registered hotel guests."
        },
        // Foreign Guests
        {
            id: 12,
            category: "foreign",
            question: "Do you accept international guests?",
            answer: "Absolutely! We welcome travelers from all corners of the globe and strive to make your stay memorable."
        },
        {
            id: 13,
            category: "foreign",
            question: "Do staff speak English?",
            answer: "Yes, our frontline reception, hospitality, and dining staff communicate fluently in English."
        },
        {
            id: 14,
            category: "foreign",
            question: "Can you help with tours or travel plans?",
            answer: "Yes, our dedicated travel desk can assist you in arranging local excursions, day trips, and custom Sri Lankan tours."
        },
        // Local Guests
        {
            id: 15,
            category: "local",
            question: "Do you offer special discounts for locals?",
            answer: "Yes, we regularly offer seasonal discounts, card promotions, and special rates for local residents."
        },
        {
            id: 16,
            category: "local",
            question: "Can we book rooms for events or day use?",
            answer: "Yes, we cater to day-use bookings, corporate gatherings, and private family events. Please contact us for custom rates."
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div 
            className="min-h-screen font-serif flex flex-col justify-between"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f7f3ee" }}
        >
            <Header />

            {/* ── HERO BANNER ── */}
            <div className="relative h-60 md:h-72 overflow-hidden">
                <img
                    src="https://bluebirdhotels.lk/wp-content/uploads/2023/03/hotel.jpg"
                    alt="Blue Bird Hotel Lobby"
                    className="w-full h-full object-cover object-center"
                    style={{ filter: "brightness(0.5)" }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(135deg, rgba(14,62,100,0.7) 0%, rgba(7,35,58,0.5) 100%)",
                    }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                    <p className="text-sky-300 tracking-[0.3em] text-xs uppercase mb-2">
                        Answers &amp; Guest Guide
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg font-serif">
                        Frequently Asked Questions
                    </h1>
                    <div className="mt-3 w-16 h-0.5 bg-sky-400 mx-auto rounded" />
                </div>
            </div>

            {/* ── SEARCH & FILTER SECTION ── */}
            <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 w-full flex-grow">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search for answers (e.g. check-in, breakfast, Wi-Fi...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 bg-white text-stone-850 text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition duration-200"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                    {/* Sidebar Categories */}
                    <div className="space-y-2 lg:sticky lg:top-24 h-fit">
                        <h3 className="text-stone-400 uppercase tracking-widest text-[10px] font-bold px-3 mb-3">Categories</h3>
                        <div className="flex flex-wrap lg:flex-col gap-2">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setOpenIndex(null);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                                            isActive 
                                                ? "bg-sky-700 text-white shadow-md shadow-sky-700/10" 
                                                : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-sky-700"}`} />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Accordion Q&A Area */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-stone-800 border-b border-stone-200/80 pb-3 mb-6 font-serif">
                            {categories.find(c => c.id === activeCategory)?.label}
                        </h2>

                        {filteredFaqs.length > 0 ? (
                            <div className="space-y-3">
                                {filteredFaqs.map((faq, index) => {
                                    const isOpen = openIndex === index;
                                    return (
                                        <div 
                                            key={faq.id} 
                                            className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => toggleFaq(index)}
                                                className="w-full flex items-center justify-between p-5 text-left font-bold text-stone-800 hover:text-sky-800 transition-colors duration-200 cursor-pointer"
                                            >
                                                <span className="text-sm md:text-base font-serif pr-4 leading-normal">{faq.question}</span>
                                                <ChevronDown 
                                                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 shrink-0 ${
                                                        isOpen ? "rotate-180 text-sky-700" : ""
                                                    }`} 
                                                />
                                            </button>
                                            
                                            <div 
                                                className={`transition-all duration-300 ease-in-out ${
                                                    isOpen ? "max-h-40 border-t border-stone-50 bg-stone-50/40" : "max-h-0"
                                                } overflow-hidden`}
                                            >
                                                <p className="p-5 text-xs md:text-sm text-stone-600 leading-relaxed font-sans font-medium">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
                                <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-600 font-bold text-sm font-serif">No questions found matching your search</p>
                                <p className="text-stone-400 text-xs mt-1">Try refining your keyword or select a different category</p>
                            </div>
                        )}

                        {/* ── CONTACT CTA CARD ── */}
                        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1.5 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400">
                                    <MessageSquare size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Still have questions?</span>
                                </div>
                                <h3 className="text-base md:text-lg font-bold font-serif">We're here to help guide your stay</h3>
                                <p className="text-[11px] md:text-xs text-stone-400 leading-normal">Our customer service representatives are available 24/7 to assist you.</p>
                            </div>
                            <Link 
                                to="/contact" 
                                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition duration-200 shadow-md shadow-sky-600/10 cursor-pointer whitespace-nowrap"
                            >
                                <span>Get in Touch</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
