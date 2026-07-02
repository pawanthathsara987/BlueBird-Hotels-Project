import React, { useState } from "react";
import { Compass, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ToursTab({
  tours,
  setTours,
  isEmptyState,
  filterList
}) {
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const handlePayment = (tour) => {
    if (!tour.tourId) {
      toast.error("Cannot find the tour package details.");
      return;
    }
    // Navigate to the tour details page with inquiry info
    navigate(`/booking/tour-details?tourId=${tour.tourId}`, {
      state: { inquiry: tour }
    });
  };

  const handleCancelInquiry = async (tourId) => {
    if (!window.confirm("Are you sure you want to cancel this inquiry? If you have already paid, our team will process your refund shortly.")) {
      return;
    }
    try {
      setProcessingId(tourId);
      const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');
      
      const response = await axios.put(`${backendBaseUrl}/tour-inquiry/${tourId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success("Inquiry canceled successfully.");
        // Update the state locally to reflect the cancellation
        setTours(prevTours => prevTours.map(t => t.id === tourId ? { ...t, status: "Canceled", rawStatus: "canceled" } : t));
      } else {
        toast.error("Failed to cancel inquiry.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred while canceling.");
    } finally {
      setProcessingId(null);
    }
  };

  // Local Empty State Renderer
  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
      <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">
        {iconComponent}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-blue-950">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-cyan-700 hover:from-blue-800 hover:to-cyan-600 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  const filteredTours = filterList(tours, "destination");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Excursion Inquiries</h2>
          <p className="text-slate-500 text-xs mt-0.5">Special helicopter flightpaths, reserve sommelier wine tastings, and deep-sea yacht charters.</p>
        </div>
      </div>

      {isEmptyState || filteredTours.length === 0 ? (
        renderEmptyState(
          "No Custom Tours Planned",
          "Elevate your itinerary with off-site excursions curated specifically by our concierge department.",
          <Compass size={36} />,
          "Book Custom Excursion",
          () => toast.success("Tour planner opened...")
        )
      ) : (
        <div className="space-y-6">
          {filteredTours.map(tour => (
            <div
              key={tour.id}
              className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase">CURATED EXPERIENCES</span>
                  <h3 className="font-serif font-semibold text-lg text-blue-950">{tour.destination}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    {tour.location}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${tour.rawStatus === "accepted" ? "bg-blue-5 border-blue-100 text-blue-900" : tour.rawStatus === "progress" ? "bg-emerald-5 border-emerald-100 text-emerald-900" : "bg-amber-5 border-amber-100 text-amber-900"}`}>
                  {tour.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">INQUIRY REF</span>
                  <span className="font-semibold text-blue-950">{tour.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">REQUESTED DATE</span>
                  <span className="font-semibold text-blue-950">
                    {new Date(tour.requestedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">GROUP CONFIGURATION</span>
                  <span className="font-semibold text-blue-950">{tour.groupSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">ESTIMATED RATE</span>
                  <span className="font-serif font-semibold text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {tour.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Concierge Response Chat Bubble */}
              <div className="bg-blue-50/40 border border-blue-100/40 rounded-2xl p-4 flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Elena"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-950">Elena (Elena - Luxury Concierge Coordinator)</span>
                    <span className="text-[9px] text-slate-400">Last updated: {tour.lastUpdated}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed italic">
                    "{tour.conciergeNotes}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2.5 pt-2">
                {tour.rawStatus === "progress" ? (
                  <button
                    onClick={() => handlePayment(tour)}
                    disabled={processingId === tour.id}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {processingId === tour.id ? "Processing..." : "Pay 50% Advance"}
                  </button>
                ) : tour.rawStatus === "pending" ? (
                  <button
                    disabled
                    className="px-5 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed border border-slate-200"
                  >
                    Awaiting Manager Approval for Payment
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    toast.success("Modification request submitted. Our coordinator will contact you.", {
                      style: { borderRadius: '8px', background: '#1e3a8a', color: '#fff' }
                    });
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Modify Excursion Details
                </button>
                {["pending", "progress", "accepted"].includes(tour.rawStatus) && (
                  <button
                    onClick={() => handleCancelInquiry(tour.id)}
                    disabled={processingId === tour.id}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
