import React from "react";
import { Bell, Award, Calendar, Sliders } from "lucide-react";
import { toast } from "react-hot-toast";

export default function NotificationsTab({
  notifications,
  setNotifications,
  handleMarkAllRead,
  isEmptyState
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
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Notification Center</h2>
          <p className="text-slate-500 text-xs mt-0.5">Exclusive upgrade opportunities, itinerary checkins, and personalized updates.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isEmptyState || notifications.length === 0 ? (
        renderEmptyState(
          "All caught up!",
          "You have zero unread alerts from your concierge coordinators.",
          <Bell size={36} />,
          null,
          null
        )
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className={`p-2.5 rounded-xl shrink-0 ${!n.read ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                  {n.type === "upgrade" ? <Award size={18} /> : n.type === "booking" ? <Calendar size={18} /> : <Sliders size={18} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-blue-950 leading-tight">{n.title}</h4>
                    {!n.read && <span className="bg-cyan-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded uppercase">NEW</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-semibold shrink-0">
                <span className="text-[10px] text-slate-400">{n.time}</span>
                {!n.read && (
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                      toast.success("Alert marked read");
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-[10px]"
                  >
                    Mark Read
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
