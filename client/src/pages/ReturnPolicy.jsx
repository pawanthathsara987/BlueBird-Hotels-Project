import { useState } from "react";

export default function ReturnPolicy() {
    const [activeTab, setActiveTab] = useState("rooms");

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
                        Blue Bird Booking Services
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                        Return &amp; Cancellation
                    </h1>
                    <div className="mt-3 w-16 h-0.5 bg-sky-400 mx-auto rounded" />
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
                
                {/* Intro Card */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-8 md:p-10 mb-10 space-y-4">
                    <p className="text-stone-400 text-xs uppercase tracking-widest mb-0.5">Cancellation Policy</p>
                    <h2 className="text-3xl font-bold text-sky-950 font-serif">Refund &amp; Cancellation Policy</h2>
                    <p className="text-stone-600 text-[15px] leading-relaxed">
                        At JLeaf by Blue Bird Hotels, we value our guests and aim to provide a transparent cancellation policy. We understand that travel plans can change unexpectedly. Below you will find the explicit refund scales, thresholds, and administrative procedures for cancel requests.
                    </p>
                </div>

                {/* Tabs Selector */}
                <div className="flex bg-stone-200/50 p-1.5 rounded-2xl mb-8 border border-stone-250/20 max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className={`flex-1 text-center py-3 font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer ${
                            activeTab === "rooms"
                                ? "bg-white text-sky-900 shadow-sm"
                                : "text-stone-500 hover:text-stone-850"
                        }`}
                    >
                        🛏️ Room Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab("tours")}
                        className={`flex-1 text-center py-3 font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer ${
                            activeTab === "tours"
                                ? "bg-white text-sky-900 shadow-sm"
                                : "text-stone-500 hover:text-stone-850"
                        }`}
                    >
                        🗺️ Tour Excursions
                    </button>
                </div>

                {/* Content Panel */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-8 md:p-10 space-y-12">
                    
                    {activeTab === "rooms" ? (
                        <>
                            {/* Room Booking Timeline */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-sky-950 border-b border-stone-100 pb-3 font-serif flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    Room Cancellation Refund Scale
                                </h3>
                                
                                <div className="relative border-l-2 border-stone-200 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 py-2">
                                    
                                    {/* Timeline Item 1 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-emerald-700">
                                            100%
                                        </span>
                                        <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-emerald-950 text-sm md:text-base font-serif">30+ Days Prior to Arrival</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Cancellations made more than 30 days before your scheduled check-in date qualify for a **100% full refund** of the deposit amount. No cancellation fees apply.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-sky-100 border-2 border-sky-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-sky-700">
                                            50%
                                        </span>
                                        <div className="bg-sky-50/30 border border-sky-100/40 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-sky-950 text-sm md:text-base font-serif">14 to 30 Days Prior to Arrival</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Cancellations requested between 14 and 30 days before check-in qualify for a **50% refund** of the total reservation deposit.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline Item 3 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-rose-700">
                                            0%
                                        </span>
                                        <div className="bg-rose-50/30 border border-rose-100/40 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-rose-950 text-sm md:text-base font-serif">Less than 14 Days or No-Show</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Any cancellation made within 14 days of check-in, or failure to check in on the reserved date (no-show), is **non-refundable**. The full deposit is retained to cover room hold costs.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Additional Room Clauses */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-sky-950 border-b border-stone-100 pb-3 font-serif">Important Information</h3>
                                <ul className="list-disc pl-5 space-y-3.5 text-[14px] text-stone-600 leading-relaxed">
                                    <li><strong>Peak Season Bookings:</strong> Room reservations made during absolute peak seasons (December 15 – January 15 and August festival season) operate under a strict non-refundable policy unless cancelled 45 days prior.</li>
                                    <li><strong>Early Departures:</strong> In the event that a guest checks out of the hotel before their reserved check-out date, the hotel is unable to refund the unused nights.</li>
                                    <li><strong>Non-Refundable Promo Rates:</strong> Bookings made under promotional packages labeled "Non-Refundable" or "Advance Purchase" are exempt from standard refund rates and are 100% non-refundable under all circumstances.</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Tour Cancellation Refund Scale */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-sky-950 border-b border-stone-100 pb-3 font-serif flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </span>
                                    Tour &amp; Excursions Refund Scale
                                </h3>

                                <div className="relative border-l-2 border-stone-200 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 py-2">
                                    
                                    {/* Timeline Item 1 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-emerald-700">
                                            100%
                                        </span>
                                        <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-emerald-950 text-sm md:text-base font-serif">14+ Days Prior to Tour Date</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Cancellations for standard tours (e.g. Negombo lagoon safaris, day-trips to Sigiriya) requested 14 days or more before the scheduled date qualify for a **100% full refund**.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-sky-100 border-2 border-sky-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-sky-700">
                                            50%
                                        </span>
                                        <div className="bg-sky-50/30 border border-sky-100/40 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-sky-950 text-sm md:text-base font-serif">7 to 14 Days Prior to Tour Date</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Tours cancelled between 7 and 14 days prior to departure qualify for a **50% refund**.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline Item 3 */}
                                    <div className="relative">
                                        <span className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-rose-700">
                                            0%
                                        </span>
                                        <div className="bg-rose-50/30 border border-rose-100/40 rounded-xl p-4 md:p-5">
                                            <h4 className="font-bold text-rose-950 text-sm md:text-base font-serif">Less than 7 Days or No-Show</h4>
                                            <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
                                                Cancellations made within 7 days of the tour, or missing the tour departure time, are **completely non-refundable**.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Additional Tour Clauses */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-sky-950 border-b border-stone-100 pb-3 font-serif">Excursion Notes</h3>
                                <ul className="list-disc pl-5 space-y-3.5 text-[14px] text-stone-600 leading-relaxed">
                                    <li><strong>Weather Disruptions:</strong> Tours cancelled by JLeaf due to dangerous weather conditions, unsafe sea conditions, or force majeure will be rescheduled or **refunded 100%** with no administrative deductions.</li>
                                    <li><strong>Custom Tour Packages:</strong> Bespoke multiple-day Sri Lankan itinerary tours involving third-party resort reservations, helicopter charters, or specialized tour guides are subject to the specific refund parameters defined in your individual contract.</li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* How to Claim Cancellation Section */}
                    <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-5">
                        <h3 className="text-xl font-bold text-sky-950 font-serif flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-sky-100 text-sky-700">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </span>
                            How to Claim a Refund &amp; Cancel
                        </h3>
                        <p className="text-[14px] text-stone-600 leading-relaxed">
                            To request a room or tour cancellation, you must submit a written request outlining your booking details. We process all refunds within **7 to 10 working days** from formal authorization.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                            <div className="bg-white border border-stone-200 rounded-xl p-4 text-center space-y-1 hover:shadow-xs transition duration-300">
                                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center font-bold text-xs text-sky-700 mx-auto">1</div>
                                <h4 className="font-semibold text-stone-850 text-xs">Submit Request</h4>
                                <p className="text-[10px] text-stone-500 leading-normal">
                                    Email us at <strong>info@bluebirdhotels.lk</strong> with your Reservation ID.
                                </p>
                            </div>
                            <div className="bg-white border border-stone-200 rounded-xl p-4 text-center space-y-1 hover:shadow-xs transition duration-300">
                                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center font-bold text-xs text-sky-700 mx-auto">2</div>
                                <h4 className="font-semibold text-stone-850 text-xs">Verification</h4>
                                <p className="text-[10px] text-stone-500 leading-normal">
                                    Our audit team reviews the timestamp against the reservation parameters.
                                </p>
                            </div>
                            <div className="bg-white border border-stone-200 rounded-xl p-4 text-center space-y-1 hover:shadow-xs transition duration-300">
                                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center font-bold text-xs text-sky-700 mx-auto">3</div>
                                <h4 className="font-semibold text-stone-850 text-xs">Payout Process</h4>
                                <p className="text-[10px] text-stone-500 leading-normal">
                                    Approved amount is returned via the same transaction channel (Credit Card / Bank Transfer).
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
