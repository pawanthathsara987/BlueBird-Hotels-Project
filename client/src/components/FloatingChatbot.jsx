import { useState } from "react";

const initialMessages = [
    {
        id: 1,
        from: "bot",
        text: "Hi, I am BlueBird Assistant. How can I help you today?",
    },
];

const quickReplies = [
    "Check room availability",
    "View tour options",
    "Contact support",
];

export default function FloatingChatbot() {
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);

    const pushMessage = (from, text) => {
        setMessages((prev) => [...prev, { id: Date.now() + Math.random(), from, text }]);
    };

    const submitMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        pushMessage("user", trimmed);

        setIsSending(true);

        try {
            const response = await fetch(`${backendBaseUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: trimmed }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Chat request failed");
            }

            const botReply = typeof data?.reply === "string" ? data.reply : "I could not generate a response.";
            pushMessage("bot", botReply);
        } catch (error) {
            pushMessage(
                "bot",
                "Sorry, I could not reach the assistant service right now. Please try again in a moment."
            );
            console.error("Chatbot error:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleSend = async (event) => {
        event.preventDefault();
        const messageToSend = inputValue;
        setInputValue("");
        await submitMessage(messageToSend);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="w-[320px] max-w-[90vw] overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl">
                    <div className="bg-linear-to-r from-cyan-600 to-sky-500 px-4 py-3 text-white">
                        <p className="text-sm font-semibold">BlueBird Chatbot</p>
                        <p className="text-xs opacity-90">Online now</p>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                        message.from === "user"
                                            ? "bg-cyan-600 text-white"
                                            : "bg-white text-slate-700 shadow-sm"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                                    BlueBird Assistant is typing...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 bg-white px-3 py-2">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {quickReplies.map((reply) => (
                                <button
                                    key={reply}
                                    type="button"
                                    className="rounded-full border border-cyan-200 px-2.5 py-1 text-[11px] text-cyan-700 transition hover:bg-cyan-50"
                                    onClick={() => submitMessage(reply)}
                                    disabled={isSending}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        <form className="flex items-center gap-2" onSubmit={handleSend}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(event) => setInputValue(event.target.value)}
                                placeholder="Type your message"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                                disabled={isSending}
                            >
                                {isSending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-cyan-600 to-sky-500 text-2xl text-white shadow-xl transition hover:scale-105"
                aria-label="Toggle chatbot"
            >
                {isOpen ? "x" : "?"}
            </button>
        </div>
    );
}