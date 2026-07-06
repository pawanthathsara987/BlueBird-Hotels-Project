import React from "react";
import { Star, Hotel, Compass, Car, MessageSquareOff } from "lucide-react";

export default function ReviewsTab({
  reviews = [],
  isEmptyState = false,
  setIsAddReviewOpen
}) {
  
  // Dynamic custom badge resolver using review type properties
  const getServiceBadgeProps = (type) => {
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

  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-200 rounded-3xl text-center space-y-5 shadow-xs">
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400 shrink-0">
        {iconComponent}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-serif font-medium text-slate-900">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed font-light">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 ease-out font-sans">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">My Feedback History</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-light">Your official platform reviews published to verified guests globally.</p>
        </div>
      </div>

      {isEmptyState || reviews.length === 0 ? (
        renderEmptyState(
          "No Published Reviews Found",
          "You haven't submitted any feedback history records for your stays, tours, or vehicle rentals yet.",
          <MessageSquareOff size={24} className="stroke-[1.5]" />
        )
      ) : (
        /* Explicitly Bordered Reviews Grid Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map(rev => {
            const badge = getServiceBadgeProps(rev.type);
            return (
              <div
                key={rev.id}
                className="bg-white border border-slate-400 rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Service Category Identification Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase ${badge.style}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <h3 className="font-serif font-normal text-base md:text-lg text-slate-900 leading-snug">
                        {rev.title}
                      </h3>
                      {rev.subtitle && (
                        <p className="text-slate-400 text-[10px] tracking-wide uppercase font-semibold">
                          {rev.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Quality Ratings Block */}
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
                      
                      {/* Sub-itemized Ratings Display */}
                      {rev.secondaryRating && (
                        <span className="text-[9px] tracking-wide uppercase font-bold text-slate-500 bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                          {rev.secondaryRatingLabel}: <strong className="text-slate-800 font-extrabold">{rev.secondaryRating}/5</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Text Comment Presentation Element */}
                  <div className="pt-1">
                    {rev.comment ? (
                      <p className="text-slate-600 text-xs leading-relaxed font-light italic pl-3 border-l-2 border-slate-200">
                        "{rev.comment}"
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs font-light italic pl-3 border-l-2 border-slate-100">
                        Submitted metric evaluation scores without text comments.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Segment */}
                <div className="flex justify-between items-center text-[9px] tracking-widest font-bold text-slate-400 pt-3 border-t border-slate-100">
                  <span>PUBLISHED RECORD</span>
                  <span className="font-sans text-slate-500">
                    {new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
