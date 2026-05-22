import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Send, Bot, Sparkles, X, ArrowRight } from "lucide-react";
import logo from "../assets/bluebird logo.png";

const initialMessages = [
  {
    id: 1,
    from: "bot",
    text: "Hi 👋 I am BlueBird Assistant. How can I help you today?",
    packages: [],
    tours: [],
  },
];

const quickReplies = [
  "Check package availability",
  "Cheap rooms for 2 adults",
  "Available rooms today",
  "Available tours",
  "Cheap tour packages",
  "Safari tours",
];

export default function FloatingChatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  /* ======================================================
       PUSH MESSAGE
     ====================================================== */
  const pushMessage = (from, text, packages = [], tours = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        from,
        text,
        packages,
        tours,
      },
    ]);
  };

  /* ======================================================
       SEND MESSAGE
     ====================================================== */
  const submitMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed || isSending) {
      return;
    }

    // USER MESSAGE
    pushMessage("user", trimmed);
    setIsSending(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        {
          message: trimmed,
        },
      );

      const data = response?.data;

      pushMessage(
        "bot",
        data?.reply || "Here are the results.",
        Array.isArray(data?.packages) ? data.packages : [],
        Array.isArray(data?.tours) ? data.tours : [],
      );
    } catch (error) {
      console.error("Chatbot error:", error);
      pushMessage("bot", "Sorry, assistant service is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  };

  /* ======================================================
       HANDLE SEND
     ====================================================== */
  const handleSend = async (event) => {
    event.preventDefault();
    const messageToSend = inputValue;
    setInputValue("");
    await submitMessage(messageToSend);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans selection:bg-emerald-500/20">
      {/* Dynamic style tag for breathing scale animation */}
      <style>{`
        @keyframes breatheScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        .animate-breathe {
          animation: breatheScale 2.5s ease-in-out infinite;
        }
        .animate-breathe:hover {
          animation: none;
        }
      `}</style>

      {/* ======================================================
          CHAT WINDOW
          ====================================================== */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[75vh] max-h-[560px] sm:h-[520px] overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(28,25,23,0.18)] transition-all duration-300 animate-fadeIn flex flex-col">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-teal-900 px-5 py-4 text-white border-b border-white/5 relative shrink-0">
            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-white/20 shadow-inner">
                    <img
                      src={logo}
                      alt="BlueBird Logo"
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-extrabold tracking-tight">BlueBird Assistant</p>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse animate-duration-1000" />
                  </div>
                  <p className="text-[9px] text-emerald-200/70 font-black uppercase tracking-widest leading-none">Active & Ready</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-white/5 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4 text-stone-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* ======================================================
              CHAT BODY
              ====================================================== */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-stone-50/50 px-4 py-5 scrollbar-thin scrollbar-thumb-stone-200 relative">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from === "user" ? "justify-end" : "justify-start"
                    } animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs relative ${message.from === "user"
                        ? "bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-tr-none shadow-[0_4px_12px_rgba(6,95,70,0.12)] border border-emerald-905"
                        : "bg-white text-stone-800 border border-stone-200/50 rounded-tl-none"
                      }`}
                  >
                    {/* MESSAGE TEXT */}
                    <p className="whitespace-pre-line font-semibold">{message.text}</p>

                    {/* ======================================================
                        ROOM PACKAGES
                        ====================================================== */}
                    {message.packages?.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {message.packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 hover:scale-[1.02] text-stone-800"
                          >
                            {/* IMAGE */}
                            {pkg.image && (
                              <div className="relative h-32 w-full overflow-hidden shrink-0">
                                <img
                                  src={pkg.image}
                                  alt={pkg.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute top-2.5 right-2.5 rounded-full bg-emerald-800 text-white px-3 py-0.5 text-[9px] font-black tracking-wider shadow-md">
                                  ${pkg.price}
                                </div>
                              </div>
                            )}

                            {/* CONTENT */}
                            <div className="p-3.5 space-y-2">
                              <h3 className="text-xs font-black text-stone-900 tracking-tight leading-snug">
                                {pkg.name}
                              </h3>

                              <p className="text-[10px] leading-relaxed text-stone-500 font-semibold">
                                {pkg.description || "No description available"}
                              </p>

                              <div className="pt-1.5 flex flex-wrap gap-1.5 border-t border-stone-100">
                                <span className="rounded-lg bg-stone-55 border border-stone-200/50 px-2 py-0.5 text-[9px] font-bold text-stone-600 flex items-center gap-1">
                                  👨 {pkg.maxAdults} Adults
                                </span>

                                <span className="rounded-lg bg-stone-55 border border-stone-200/50 px-2 py-0.5 text-[9px] font-bold text-stone-600 flex items-center gap-1">
                                  👶 {pkg.maxKids} Kids
                                </span>

                                <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 flex items-center gap-1">
                                  🛏 {pkg.availableRooms} Available
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white transition cursor-pointer active:scale-[0.98] shadow-xs"
                          onClick={() => navigate("/booking")}
                        >
                          Review Package Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* ======================================================
                        TOUR PACKAGES
                        ====================================================== */}
                    {message.tours?.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {message.tours.map((tour) => (
                          <div
                            key={tour.id}
                            className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 hover:scale-[1.02] text-stone-800"
                          >
                            {/* IMAGE */}
                            {tour.image && (
                              <div className="relative h-32 w-full overflow-hidden shrink-0">
                                <img
                                  src={tour.image}
                                  alt={tour.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute top-2.5 right-2.5 rounded-full bg-orange-700 text-white px-3 py-0.5 text-[9px] font-black tracking-wider shadow-md">
                                  ${tour.price}
                                </div>
                              </div>
                            )}

                            {/* CONTENT */}
                            <div className="p-3.5 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-black text-stone-900 tracking-tight leading-snug">
                                  {tour.name}
                                </h3>
                                {tour.discount > 0 && (
                                  <span className="rounded bg-red-50 border border-red-100 px-1.5 py-0.2 text-[8px] font-black text-red-700 uppercase tracking-widest shrink-0 animate-pulse">
                                    {tour.discount}% OFF
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] leading-relaxed text-stone-500 font-semibold">
                                {tour.overview || "No overview available"}
                              </p>

                              <div className="pt-1.5 flex flex-wrap gap-1.5 border-t border-stone-100">
                                <span className="rounded-lg bg-stone-55 border border-stone-200/50 px-2 py-0.5 text-[9px] font-bold text-stone-600 flex items-center gap-1">
                                  📍 {tour.location}
                                </span>

                                <span className="rounded-lg bg-stone-55 border border-stone-200/50 px-2 py-0.5 text-[9px] font-bold text-stone-600 flex items-center gap-1">
                                  ⏳ {tour.duration} {tour.durationType}
                                </span>

                                <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 flex items-center gap-1">
                                  👥 {tour.groupSize} Guests
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-orange-700 hover:bg-orange-850 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white transition cursor-pointer active:scale-[0.98] shadow-xs"
                          onClick={() => navigate("/tourBooking")}
                        >
                          Explore Tour Packages
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* TYPING INDICATOR */}
              {isSending && (
                <div className="flex justify-start items-center gap-2">
                  <div className="bg-white border border-stone-200/50 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-3xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-850 animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-850 animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-850 animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Dummy element for scroll anchoring */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ======================================================
              FOOTER & CONTROLS
              ====================================================== */}
          <div className="border-t border-stone-200/80 bg-white p-3.5 space-y-3.5 shrink-0">
            {/* QUICK REPLIES */}
            <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto pb-0.5 scrollbar-none">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  disabled={isSending}
                  onClick={() => submitMessage(reply)}
                  className="rounded-full border border-emerald-250/50 bg-white px-3 py-1.5 text-[10px] font-black text-emerald-850 transition-all duration-200 hover:bg-emerald-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-3xs hover:border-emerald-300"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* INPUT INPUT-ROW */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <div className="flex-1 flex items-center border border-stone-200 hover:border-emerald-600 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 rounded-2xl bg-stone-50 px-3.5 py-1 transition-all duration-300">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about rooms, tours, prices..."
                  disabled={isSending}
                  className="w-full bg-transparent text-xs font-semibold text-stone-850 outline-none placeholder:text-stone-400 py-1.5"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-90 shadow-[0_4px_10px_rgba(6,95,70,0.15)] hover:shadow-[0_6px_14px_rgba(6,95,70,0.25)] shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          TOGGLE LAUNCHER BUTTON
          ====================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-white text-stone-850 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_45px_rgba(6,95,70,0.18)] border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative group overflow-hidden ${isOpen
            ? "border-emerald-600 ring-4 ring-emerald-500/10"
            : "border-blue-500 hover:border-emerald-600/50 hover:ring-4 hover:ring-emerald-500/10 animate-breathe"
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-0 group-hover:rotate-90 text-stone-700 hover:text-emerald-800" />
        ) : (
          <div className="relative flex items-center justify-center w-10.5 h-10.5">
            <img src={logo} alt="BlueBird Logo" className="w-full h-full object-contain transform transition-transform duration-350 group-hover:scale-110" />
          </div>
        )}
      </button>
    </div>
  );
}
