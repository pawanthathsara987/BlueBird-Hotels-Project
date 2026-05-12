import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RiRobot3Fill, RiRobot3Line } from "react-icons/ri";


const initialMessages = [
    {
        id: 1,
        from: "bot",
        text: "Hi, I am BlueBird Assistant. How can I help you today?",
        packages: [],
    },
];

const quickReplies = [
    "Check package availability",
    "Cheap rooms for 2 adults",
    "Available rooms today",
    "Available rooms tomorrow",
];

export default function FloatingChatbot() {
    
    const navigate = useNavigate();
    const [isOpen, setIsOpen] =
        useState(false);

    const [messages, setMessages] =
        useState(initialMessages);

    const [inputValue, setInputValue] =
        useState("");

    const [isSending, setIsSending] =
        useState(false);

    // PUSH MESSAGE
    const pushMessage = (
        from,
        text,
        packages = []
    ) => {
        setMessages((prev) => [
            ...prev,
            {
                id:
                    Date.now() +
                    Math.random(),
                from,
                text,
                packages,
            },
        ]);
    };

    // SEND MESSAGE
    const submitMessage = async (text) => {
        const trimmed = text.trim();

        if (!trimmed || isSending) return;

        // USER MESSAGE
        pushMessage("user", trimmed);

        setIsSending(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
                message: trimmed
            })

            const data = response?.data;

            if (!data || data.length == 0) {
                throw new Error(
                    data?.error ||
                        "Chat request failed"
                );
            }

            pushMessage(
                "bot",
                data?.reply ||
                    "Here are the available packages.",
                Array.isArray(
                    data?.packages
                )
                    ? data.packages
                    : []
            );
        } catch (error) {
            console.error(
                "Chatbot error:",
                error
            );

            pushMessage(
                "bot",
                "Sorry, assistant service is unavailable right now."
            );
        } finally {
            setIsSending(false);
        }
    };

    // SEND HANDLER
    const handleSend = async (event) => {
        event.preventDefault();

        const messageToSend =
            inputValue;

        setInputValue("");

        await submitMessage(
            messageToSend
        );
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="w-[370px] max-w-[95vw] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-cyan-600 to-sky-500 px-4 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">
                                    BlueBird
                                    Assistant
                                </p>

                                <p className="text-xs opacity-90">
                                    Online now
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">
                                🤖
                            </div>
                        </div>
                    </div>

                    {/* CHAT BODY */}
                    <div className="max-h-[500px] overflow-y-auto bg-slate-50 px-3 py-4">
                        <div className="space-y-4">
                            {messages.map(
                                (
                                    message
                                ) => (
                                    <div
                                        key={
                                            message.id
                                        }
                                        className={`flex ${
                                            message.from ===
                                            "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
                                                message.from ===
                                                "user"
                                                    ? "bg-cyan-600 text-white"
                                                    : "bg-white text-slate-700 shadow-sm"
                                            }`}
                                        >
                                            {/* TEXT */}
                                            <p className="whitespace-pre-line">
                                                {
                                                    message.text
                                                }
                                            </p>

                                            {/* PACKAGE CARDS */}
                                            {message
                                                .packages
                                                ?.length >
                                                0 && (
                                                <div className="mt-4 space-y-4">
                                                    {message.packages.map(
                                                        (
                                                            pkg
                                                        ) => (
                                                            <div
                                                                key={
                                                                    pkg.id
                                                                }
                                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                                            >
                                                                {/* IMAGE */}
                                                                {pkg.image && (
                                                                    <img
                                                                        src={`${pkg.image}`}
                                                                        alt={
                                                                            pkg.name
                                                                        }
                                                                        className="h-44 w-full object-cover"
                                                                    />
                                                                )}

                                                                {/* CONTENT */}
                                                                <div className="p-4">
                                                                    {/* TITLE */}
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <h3 className="text-sm font-bold text-slate-800">
                                                                            {
                                                                                pkg.name
                                                                            }
                                                                        </h3>

                                                                        <div className="rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-700">
                                                                            {
                                                                                pkg.price
                                                                            }$
                                                                        </div>
                                                                    </div>

                                                                    {/* DESCRIPTION */}
                                                                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                                                        {pkg.description ||
                                                                            "No description available"}
                                                                    </p>

                                                                    {/* BADGES */}
                                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                                                                            👨{" "}
                                                                            {
                                                                                pkg.maxAdults
                                                                            }{" "}
                                                                            Adults
                                                                        </span>

                                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                                                                            👶{" "}
                                                                            {
                                                                                pkg.maxKids
                                                                            }{" "}
                                                                            Kids
                                                                        </span>

                                                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                                                            🛏{" "}
                                                                            {
                                                                                pkg.availableRooms
                                                                            }{" "}
                                                                            Available
                                                                        </span>
                                                                    </div>

                                                                    
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                    {/* BUTTON */}
                                                    <button className="mt-4 w-full rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700" onClick={() => {navigate("/booking")}}>
                                                        Review Package Details
                                                     </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* TYPING */}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                                        BlueBird
                                        Assistant
                                        is typing...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-slate-200 bg-white px-3 py-3">
                        {/* QUICK REPLIES */}
                        <div className="mb-3 flex flex-wrap gap-2">
                            {quickReplies.map(
                                (
                                    reply
                                ) => (
                                    <button
                                        key={
                                            reply
                                        }
                                        type="button"
                                        disabled={
                                            isSending
                                        }
                                        onClick={() =>
                                            submitMessage(
                                                reply
                                            )
                                        }
                                        className="rounded-full border border-cyan-200 px-3 py-1 text-[11px] text-cyan-700 transition hover:bg-cyan-50"
                                    >
                                        {
                                            reply
                                        }
                                    </button>
                                )
                            )}
                        </div>

                        {/* INPUT */}
                        <form
                            onSubmit={
                                handleSend
                            }
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={
                                    inputValue
                                }
                                onChange={(
                                    e
                                ) =>
                                    setInputValue(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Ask about rooms, prices, availability..."
                                disabled={
                                    isSending
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                            />

                            <button
                                type="submit"
                                disabled={
                                    isSending
                                }
                                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                            >
                                {isSending
                                    ? "..."
                                    : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (prev) => !prev
                    )
                }
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white border-4 border-cyan-400 text-2xl text-black shadow-xl transition hover:scale-105"
            >
                {isOpen
                    ? <RiRobot3Line />
                    : <RiRobot3Fill  />}
            </button>
        </div>
    );
}