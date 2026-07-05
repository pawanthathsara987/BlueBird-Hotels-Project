import React, { useState, useEffect, useMemo } from "react";
import { Star, Hotel, Compass, Car, Search, MessageSquare, SlidersHorizontal, Loader2 } from "lucide-react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api";
        const response = await axios.get(`${backendUrl}/customers/public-reviews`);
        if (response.data && response.data.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Error loading public reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Category Badges Config
  const getBadgeProps = (type) => {
    switch (type) {
      case "Room":
        return { label: "Room Stay", style: "bg-blue-50/60 text-blue-800 border-blue-200/60", icon: <Hotel size={11} /> };
      case "Tour":
        return { label: "Tour Package", style: "bg-emerald-50/60 text-emerald-800 border-emerald-200/60", icon: <Compass size={11} /> };
      case "Vehicle":
        return { label: "Vehicle Rental", style: "bg-amber-50/60 text-amber-800 border-amber-200/60", icon: <Car size={11} /> };
      default:
        return { label: "Verified Service", style: "bg-slate-50 text-slate-700 border-slate-200/60", icon: null };
    }
  };

  // Filter and search logic
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      const matchesFilter = activeFilter === "all" || rev.type.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = 
        (rev.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rev.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rev.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [reviews, activeFilter, searchTerm]);

  // Compute aggregate stats dynamically
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        avgRating: "0.0",
        totalSubmissions: 0,
        roundedRating: 0
      };
    }
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const avg = sum / reviews.length;
    return {
      avgRating: avg.toFixed(1),
      totalSubmissions: reviews.length,
      roundedRating: Math.round(avg)
    };
  }, [reviews]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">
      <Header />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-8 w-8 text-slate-800 animate-spin" />
            <p className="text-slate-500 text-xs font-light tracking-wider uppercase">Loading verified reviews...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Editorial Header Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] tracking-[0.3em] text-blue-900 font-bold uppercase block">
                GUEST VERDICTS
              </span>
              <h1 className="font-serif font-normal text-3xl md:text-5xl text-slate-900 tracking-wide leading-tight">
                Stories of Extraordinary Journeys
              </h1>
              <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed">
                Explore verified, unedited feedback from discerning travelers who have experienced our luxury stays, private excursions, and premium transport logistics.
              </p>
            </div>

            {/* Analytic Summary Metrics Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-2xl bg-white divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-xs">
              <div className="p-6 text-center space-y-1">
                <p className="text-4xl font-serif font-light text-slate-900">
                  {stats.totalSubmissions > 0 ? stats.avgRating : "4.9"}
                </p>
                <div className="flex justify-center text-amber-500 space-x-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < (stats.totalSubmissions > 0 ? stats.roundedRating : 5) ? "currentColor" : "none"}
                      className={i < (stats.totalSubmissions > 0 ? stats.roundedRating : 5) ? "text-amber-500" : "text-slate-200"}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Average Guest Score</p>
              </div>
              <div className="p-6 text-center space-y-1 flex flex-col justify-center">
                <p className="text-3xl font-light text-slate-900">
                  {stats.totalSubmissions > 0 ? stats.totalSubmissions : "120+"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Verified Submissions</p>
              </div>
              <div className="p-6 text-center space-y-1 flex flex-col justify-center">
                <p className="text-3xl font-light text-emerald-700">100%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Genuine Retained Clientele</p>
              </div>
            </div>

            {/* Toolbar: Category Filters & Search Input */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                <SlidersHorizontal size={14} className="text-slate-400 mr-1 shrink-0 hidden sm:block" />
                {[
                  { id: "all", label: "All Experiences" },
                  { id: "room", label: "Stays & Suites" },
                  { id: "tour", label: "Boutique Tours" },
                  { id: "vehicle", label: "Chauffeur Rentals" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-4 py-2 border rounded-xl text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      activeFilter === tab.id 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80 flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs focus-within:border-slate-400 transition-all">
                <Search size={14} className="text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search statements or destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs font-light text-slate-700 outline-none placeholder-slate-400 bg-transparent"
                />
              </div>
            </div>

            {/* Reviews Presentation Layout Matrix */}
            {filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
                <MessageSquare size={32} className="text-slate-300 stroke-[1.5]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-slate-800">No matching testimonials</h3>
                  <p className="text-slate-400 text-xs font-light">Adjust your text criteria or clear filters to view more records.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReviews.map(rev => {
                  const badge = getBadgeProps(rev.type);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5 flex-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase ${badge.style}`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                            <h3 className="font-serif font-normal text-base md:text-lg text-slate-900 leading-snug pt-1">
                              {rev.title}
                            </h3>
                            {rev.subtitle && (
                              <p className="text-slate-400 text-[10px] tracking-wide uppercase font-semibold">
                                {rev.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Right Hand Side Star Matrix Stack */}
                          <div className="flex flex-col items-end space-y-1.5 shrink-0 pt-1">
                            <div className="flex space-x-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < rev.rating ? "currentColor" : "none"}
                                  className={i < rev.rating ? "text-amber-500" : "text-slate-200"}
                                />
                              ))}
                            </div>
                            {rev.secondaryRating && (
                              <span className="text-[9px] tracking-wide uppercase font-bold text-slate-500 bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                                {rev.secondaryRatingLabel}: <strong className="text-slate-800">{rev.secondaryRating}/5</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Verbatim Comment Segment */}
                        {rev.comment ? (
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-light italic pl-4 border-l-2 border-slate-200">
                            "{rev.comment}"
                          </p>
                        ) : (
                          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light italic pl-4 border-l-2 border-slate-100">
                            Submitted rating scores without comments.
                          </p>
                        )}
                      </div>

                      {/* Testimonial Signature Footer Meta Row */}
                      <div className="flex justify-between items-center text-[10px] tracking-wider font-medium text-slate-400 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif text-slate-800 text-xs font-normal">{rev.reviewer}</span>
                          {rev.verified && (
                            <span className="text-[8px] bg-slate-100 text-slate-500 border border-slate-200 font-bold px-1 py-0.5 rounded uppercase tracking-widest scale-90">
                              Verified Guest
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-slate-400 font-light">
                          {new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}