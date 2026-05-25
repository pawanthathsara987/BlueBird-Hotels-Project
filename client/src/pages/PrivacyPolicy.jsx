export default function PrivacyPolicy() {
    
    const policyCards = [
        {
            title: "Data Collection & Gathering",
            icon: (
                <svg className="w-6 h-6 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            description: "We gather essential details to complete hotel bookings and customize room preferences. This includes your name, phone number, email address, nationality, arrival dates, and specialized request notes."
        },
        {
            title: "Google OAuth Integration",
            icon: (
                <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            description: "To make access simple, JLeaf allows you to sign in using Google. We request basic user profile details (Google ID, Full Name, Avatar Image, and Verified Email). We do not read your search history, store passwords, or share your profile details with other commercial providers."
        },
        {
            title: "Reservation & Room Analytics",
            icon: (
                <svg className="w-6 h-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            ),
            description: "We preserve details of your stay history (e.g. booked packages, travels planned, tour feedback). We use this metadata solely to curate personalized offers, welcome treats, and recommend specific local Sri Lankan excursions on your next vacation."
        },
        {
            title: "Data Safeguards & Cryptography",
            icon: (
                <svg className="w-6 h-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            description: "Your trust is very important. All data transmission across the client application and backend databases is secured using modern TLS/SSL encryptions. Access is strictly confined to security-cleared hotel managers, reception desk clerks, and technical administrators."
        }
    ];

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
                        Blue Bird Hotel Security
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                        Privacy Policy
                    </h1>
                    <div className="mt-3 w-16 h-0.5 bg-sky-400 mx-auto rounded" />
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-14 space-y-12">
                
                {/* Intro statement */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-8 md:p-10 text-center max-w-3xl mx-auto space-y-4">
                    <p className="text-sky-600 text-xs uppercase tracking-widest font-bold">Your Privacy Matters</p>
                    <h2 className="text-3xl font-bold text-sky-950 font-serif">Safeguarding Guest Information</h2>
                    <p className="text-stone-600 text-[15px] leading-relaxed">
                        Blue Bird Hotels is committed to safeguarding the privacy and security of our guests' personal data. This privacy document details what details we collect, how they are protected, and your statutory rights under privacy regulations.
                    </p>
                </div>

                {/* Styled Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policyCards.map((card) => (
                        <div 
                            key={card.title}
                            className="bg-white rounded-2xl border border-stone-200/50 p-6 md:p-8 space-y-4 hover:shadow-md hover:border-sky-350 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-3xs">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold text-sky-950 font-serif">
                                {card.title}
                            </h3>
                            <p className="text-xs md:text-sm text-stone-650 leading-relaxed font-sans">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Additional Detailed Sections */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-8 md:p-10 space-y-8 leading-relaxed text-[15px] text-stone-700">
                    
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-sky-950 font-serif">Cookies &amp; Tracker Usage</h3>
                        <p className="text-stone-600">
                            Our website employs analytical and operational cookies to speed up page loads and remember user sessions. Standard cookies are utilized to memorize package choices during multi-step room reservations. You may customize your browser cookie preferences, though disabling them completely may affect reservation functionality.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-sky-950 font-serif">Third-Party Payment Providers</h3>
                        <p className="text-stone-600">
                            Credit card entries are routed instantly to PCI-DSS certified gateway banks using encrypted tokens. JLeaf database layers never store raw security numbers, CVV keys, or complete credit card digits.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-sky-950 font-serif">Your Legal Rights</h3>
                        <p className="text-stone-600">
                            You possess complete authority over your personal information. Under local and international data protection laws, guests may request:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-stone-600 mt-2">
                            <li>An exported summary report of all stored profile records we maintain.</li>
                            <li>Prompt corrections or updates to invalid contact numbers or misspelled names.</li>
                            <li>The permanent removal and purging of your reservation history and guest profile (Right to be Forgotten).</li>
                        </ul>
                    </div>

                    <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4 md:p-6 text-stone-650 text-xs md:text-sm font-sans flex items-start gap-3">
                        <span className="text-sky-600 mt-0.5">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <div>
                            <strong className="text-sky-950 block mb-1">Privacy Officer Contact</strong>
                            For data retrieval requests or to ask for permanent account removal, please reach out to us at <strong>privacy@bluebirdhotels.lk</strong>. We address all statutory requests within 14 business days.
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
