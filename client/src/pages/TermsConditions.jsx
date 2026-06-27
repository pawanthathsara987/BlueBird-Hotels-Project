import { useState, useEffect } from "react";

export default function TermsConditions() {
    const [activeSection, setActiveSection] = useState("introduction");

    const sections = [
        {
            id: "introduction",
            title: "1. Introduction & Acceptance",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            content: (
                <>
                    <p className="mb-4">
                        Welcome to <strong>JLeaf by Blue Bird Hotels &amp; Tours</strong>. These Terms &amp; Conditions govern your use of our website, reservation platform, and the services provided at our physical hotel and tour offerings in Negombo, Sri Lanka.
                    </p>
                    <p className="mb-4">
                        By accessing our website, making a reservation, or checking into our hotel, you acknowledge that you have read, understood, and agreed to be bound by these terms. If you do not agree to these terms, please do not use our services.
                    </p>
                    <p>
                        We reserve the right to amend these terms at any time. Any changes will be posted on this page and will take effect immediately upon publishing.
                    </p>
                </>
            )
        },
        {
            id: "reservations",
            title: "2. Booking & Reservations",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            content: (
                <>
                    <p className="mb-4">
                        All reservations must be made using accurate guest information. A valid credit card, deposit, or online pre-payment is required to confirm all room bookings and custom tour requests.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Rates:</strong> All prices listed are in US Dollars (USD) or Sri Lankan Rupees (LKR) and may exclude local government taxes, service charges, or VAT unless stated otherwise.</li>
                        <li><strong>Age Limit:</strong> The primary guest registering must be at least 18 years of age and possess a valid government-issued ID (Passport for foreign citizens or National Identity Card for residents).</li>
                        <li><strong>Occupancy:</strong> Total occupancy must not exceed the maximum limits specified for each room type. Extra beds are subject to availability and surcharge.</li>
                    </ul>
                    <p>
                        Special promo codes or deals are valid only for the designated period and cannot be combined with other promotional offers.
                    </p>
                </>
            )
        },
        {
            id: "checkinout",
            title: "3. Check-In & Check-Out",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            ),
            content: (
                <>
                    <p className="mb-4">
                        Please adhere to our standard operational hours to ensure a smooth transition for all arriving and departing travelers:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
                            <h4 className="font-semibold text-sky-900 mb-1 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Check-In (From 14:00)
                            </h4>
                            <p className="text-xs text-stone-600">
                                Standard check-in starts at 2:00 PM. Early check-in is subject to availability and may incur a surcharge.
                            </p>
                        </div>
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                            <h4 className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Check-Out (Until 12:00)
                            </h4>
                            <p className="text-xs text-stone-600">
                                Check-out is strictly until 12:00 PM (Noon). Late check-out requests must be made in advance and are subject to room availability.
                            </p>
                        </div>
                    </div>
                    <p>
                        Upon check-in, foreign passport holders must present a valid Sri Lankan entry visa. A security deposit (in cash or credit pre-authorization) may be requested for incidental charges during your stay.
                    </p>
                </>
            )
        },
        {
            id: "guest-rules",
            title: "4. Guest Behavior & Restrictions",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            content: (
                <>
                    <p className="mb-4">
                        To maintain a serene and luxurious atmosphere at Blue Bird Hotels, all guests are required to respect our house policies:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Smoke-Free Rooms:</strong> JLeaf is dedicated to offering clean, smoke-free indoor spaces. Smoking is strictly prohibited inside the rooms or suites. Designated outdoor smoking areas are available. Violators will face a cleaning fee of USD 150.</li>
                        <li><strong>No Pets Policy:</strong> Pets are not permitted in guest rooms or common spaces out of consideration for allergy-sensitive travelers.</li>
                        <li><strong>Damage & Incidents:</strong> Guests will be held responsible for any damage caused to hotel property, furniture, or equipment by themselves or their visitors, and will be charged full repair/replacement costs.</li>
                        <li><strong>Quiet Hours:</strong> Between 10:00 PM and 7:00 AM, quiet hours are observed to ensure all guests enjoy peaceful rest.</li>
                    </ul>
                    <p>
                        Illegal actions, loud disturbances, and disrespectful behavior towards staff or other guests will result in immediate eviction from the property without refund.
                    </p>
                </>
            )
        },
        {
            id: "liability",
            title: "5. Liability & Indemnity",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            content: (
                <>
                    <p className="mb-4">
                        JLeaf by Blue Bird Hotels provides secure electronic safes in every room. The hotel accepts no responsibility for the loss, theft, or damage of jewelry, electronics, cash, or other personal belongings kept in rooms or parked vehicles.
                    </p>
                    <p className="mb-4">
                        While we take pride in organizing reliable Negombo excursions and Sri Lankan tours, travel activities are undertaken at the guest's own risk. The hotel is not liable for personal injury, illness, delayed flights, or missed connections due to local traffic conditions, weather events, or external tour operations.
                    </p>
                    <p>
                        We advise all travelers to purchase comprehensive travel insurance covering medical expenses, trip cancellations, and loss of personal baggage before their arrival.
                    </p>
                </>
            )
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const offsets = sections.map(sec => {
                const el = document.getElementById(sec.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    return { id: sec.id, top: Math.abs(rect.top - 120) };
                }
                return { id: sec.id, top: Infinity };
            });
            const closest = offsets.reduce((prev, curr) => (prev.top < curr.top ? prev : curr), { id: "introduction", top: Infinity });
            setActiveSection(closest.id);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveSection(id);
        }
    };

    return (
        <div 
            className="min-h-screen font-serif text-stone-850 bg-stone-100/40"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f7f3ee" }}
        >
            {/* ── HERO BANNER ── */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                    src="https://bluebirdhotels.lk/wp-content/uploads/2023/03/hotel.jpg"
                    alt="Blue Bird Hotel"
                    className="w-full h-full object-cover object-center scale-105"
                    style={{ filter: "brightness(0.55)" }}
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(14,62,100,0.72) 0%, rgba(7,35,58,0.55) 100%)",
                    }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                    <p className="text-sky-300 tracking-[0.3em] text-xs uppercase mb-2">
                        JLeaf by Blue Bird Hotels
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                        Terms &amp; Conditions
                    </h1>
                    <div className="mt-3 w-16 h-0.5 bg-sky-400 mx-auto rounded" />
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Left Sticky Sidebar Index */}
                    <div className="w-full lg:w-1/4">
                        <div className="sticky top-28 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-stone-200/60 shadow-sm space-y-4">
                            <h3 className="text-sky-950 font-bold text-lg border-b border-stone-200 pb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Documents
                            </h3>
                            <nav className="flex flex-col space-y-1.5 text-sm">
                                {sections.map((sec) => (
                                    <button
                                        key={sec.id}
                                        onClick={() => scrollToSection(sec.id)}
                                        className={`text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium cursor-pointer ${
                                            activeSection === sec.id
                                                ? "bg-sky-50 text-sky-700 border-l-3 border-sky-600 pl-4 shadow-3xs"
                                                : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                                        }`}
                                    >
                                        <span className={`${activeSection === sec.id ? "text-sky-600" : "text-stone-400"}`}>
                                            {sec.icon}
                                        </span>
                                        <span className="truncate">{sec.title.substring(3)}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Right Policy Details */}
                    <div className="w-full lg:w-3/4 space-y-8">
                        <div className="bg-white rounded-2xl shadow-xs border border-stone-100 p-8 md:p-10 leading-relaxed text-stone-700 text-[15px] space-y-12">
                            
                            <div>
                                <p className="text-stone-400 text-xs uppercase tracking-widest mb-1.5">Last Updated: May 2026</p>
                                <h2 className="text-3xl font-bold text-sky-950 mb-4 font-serif">Website &amp; Guest Agreement</h2>
                                <p className="text-stone-500 italic">
                                    Please read this contract carefully. It establishes the rules, obligations, and legal boundaries for your booking and stay at JLeaf Negombo.
                                </p>
                                <div className="mt-8 border-b border-stone-200"></div>
                            </div>

                            {sections.map((sec) => (
                                <section 
                                    key={sec.id} 
                                    id={sec.id} 
                                    className="space-y-4 pt-4 first:pt-0 scroll-mt-28"
                                >
                                    <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                                        <span className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0 shadow-3xs">
                                            {sec.icon}
                                        </span>
                                        <h3 className="text-xl font-bold text-sky-950 font-serif">
                                            {sec.title}
                                        </h3>
                                    </div>
                                    <div className="text-stone-600 pl-0 md:pl-2">
                                        {sec.content}
                                    </div>
                                </section>
                            ))}

                        </div>
                        
                        {/* Help Desk Footer Card */}
                        <div className="bg-sky-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="space-y-1 text-center md:text-left">
                                <h4 className="font-bold text-lg tracking-wide">Have any questions about our terms?</h4>
                                <p className="text-xs text-sky-200">Our customer relations desk is available 24/7 to clarify details.</p>
                            </div>
                            <a 
                                href="/contact" 
                                className="px-5 py-2.5 bg-white text-sky-900 font-semibold text-xs rounded-xl tracking-wider hover:bg-sky-50 active:scale-95 transition-all shadow-md"
                            >
                                CONTACT HELPDESK
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
