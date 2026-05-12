import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.name && form.email && form.message) setSubmitted(true);
    };

    return (
        <div
            className="min-h-screen font-serif"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f7f3ee" }}
        >
            <Header />
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
                        Blue Bird Hotels &amp; Tours · Negombo
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                        Contact Us
                    </h1>
                    <div className="mt-3 w-16 h-0.5 bg-sky-400 mx-auto rounded" />
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <main className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-2 gap-10">
                {/* ── LEFT: Info + Map ── */}
                <div className="space-y-8">
                    {/* Quick-contact cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                ),
                                label: "Email Us",
                                value: "info@bluebirdhotels.lk",
                                href: "mailto:info@bluebirdhotels.lk",
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 8.09a16 16 0 0 0 6.09 6.09l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                ),
                                label: "Call Us",
                                value: "(+94) 70 1950 195",
                                href: "tel:+94701950195",
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                ),
                                label: "Visit Us",
                                value: "No. 54 Cemetery Rd, Negombo 11500",
                                href: "https://goo.gl/maps/ByrxpAEn6Nvk961G8",
                            },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-start gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-stone-100 hover:shadow-md hover:border-sky-200 transition-all group"
                            >
                                <span className="mt-0.5 text-sky-700 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </span>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                    <p className="text-stone-800 font-medium text-sm">{item.value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Also available on */}
                    <div className="bg-white rounded-xl px-5 py-4 border border-stone-100 shadow-sm">
                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Also available on</p>
                        <div className="flex gap-3">
                            {["Viber", "WhatsApp"].map((app) => (
                                <span
                                    key={app}
                                    className="bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-sky-100"
                                >
                                    {app}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Google Map embed */}
                    <div className="rounded-2xl overflow-hidden shadow-md border border-stone-200">
                        <iframe
                            title="J Leaf by Hotel Blue Bird location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.0724299219423!2d79.8409877152943!3d7.23257941651896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2eff83ef1e7d5%3A0x9cf648d51b945136!2sJ%20Leaf%20by%20Hotel%20Blue%20Bird!5e0!3m2!1sen!2slk!4v1680175825638!5m2!1sen!2slk"
                            width="100%"
                            height="260"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                {/* ── RIGHT: Contact Form ── */}
                <div>
                    <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-8">
                        <h2
                            className="text-2xl font-bold text-sky-900 mb-1"
                            style={{ fontFamily: "'Georgia', serif" }}
                        >
                            How can we help?
                        </h2>
                        <p className="text-stone-400 text-sm mb-7">
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>

                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.5" className="w-7 h-7">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 className="text-sky-800 font-bold text-lg mb-1">Message Sent!</h3>
                                <p className="text-stone-500 text-sm">Thank you, {form.name}. We'll be in touch soon.</p>
                                <button
                                    onClick={() => { setForm({ name: "", email: "", message: "" }); setSubmitted(false); }}
                                    className="mt-6 text-sky-600 text-sm underline underline-offset-2 hover:text-sky-800 transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">
                                        First Name
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your first name"
                                        className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="you@email.com"
                                        className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">
                                        Your Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="How can we help you?"
                                        className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-sky-700 hover:bg-sky-800 active:scale-95 text-white font-semibold py-3 rounded-lg tracking-wide text-sm transition-all shadow-sm"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}