import React from "react";
import { Star, Plus, MapPin } from "lucide-react";

export default function ReviewsTab({
  reviews,
  isEmptyState,
  setIsAddReviewOpen
}) {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Property Feedback</h2>
          <p className="text-slate-500 text-xs mt-0.5">Your official reviews published to other verified guests globally.</p>
        </div>
        <button
          onClick={() => setIsAddReviewOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={14} />
          Write Luxury Review
        </button>
      </div>

      {isEmptyState || reviews.length === 0 ? (
        renderEmptyState(
          "No Published Reviews",
          "Help other travelers choose premium suites by sharing your verified luxury stays experiences.",
          <Star size={36} />,
          "Publish First Review",
          () => setIsAddReviewOpen(true)
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h3 className="font-serif font-semibold text-base text-blue-950 leading-tight">{rev.propertyName}</h3>
                    <p className="text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin size={10} />
                      {rev.location}
                    </p>
                  </div>
                  {/* Star Visualizer */}
                  <div className="flex space-x-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rev.rating ? "currentColor" : "none"}
                        className={i < rev.rating ? "" : "text-slate-200"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-light italic">
                  "{rev.comment}"
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-50">
                <span>PUBLISHED RECORD</span>
                <span>{new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
