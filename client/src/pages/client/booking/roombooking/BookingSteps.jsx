import React from "react";
import { Check, Calendar, ClipboardList, UserCheck, CreditCard, Sparkles } from "lucide-react";

export default function BookingSteps({ activeStep }) {
  const steps = [
    { number: 1, label: "Choose Rooms", icon: <Calendar size={14} /> },
    { number: 2, label: "Review Summary", icon: <ClipboardList size={14} /> },
    { number: 3, label: "Guest Info", icon: <UserCheck size={14} /> },
    { number: 4, label: "Prepayment", icon: <CreditCard size={14} /> },
    { number: 5, label: "Confirmation", icon: <Sparkles size={14} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 bg-white/70 backdrop-blur-md border border-stone-200/40 rounded-3xl p-5 md:p-6 shadow-xs font-sans">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-2">
        {steps.map((s, idx) => {
          const isCompleted = activeStep > s.number;
          const isActive = activeStep === s.number;
          return (
            <React.Fragment key={s.number}>
              <div className="flex items-center gap-3.5 flex-1 justify-center md:justify-start">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 ${isCompleted
                      ? "bg-emerald-800 text-white"
                      : isActive
                        ? "bg-stone-900 text-white ring-4 ring-stone-900/10 scale-105"
                        : "bg-stone-100 text-stone-400 border border-stone-200"
                    }`}
                >
                  {isCompleted ? <Check size={14} className="stroke-[3]" /> : s.icon}
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-stone-400">Step 0{s.number}</p>
                  <p className={`text-xs font-extrabold leading-tight ${isActive ? "text-stone-900" : isCompleted ? "text-emerald-800" : "text-stone-500"}`}>
                    {s.label}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-0.5 max-w-[60px] bg-stone-200 rounded-full mx-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-emerald-800 ${isCompleted ? "w-full" : "w-0"
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
