import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/bluebird logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

// Import local background assets from slider Images folder
import bgFront from "../../assets/slider Images/front-2048x1014.jpg";
import bgSlider2 from "../../assets/slider Images/home-slider2-2048x1014.jpg";
import bgSlider3 from "../../assets/slider Images/home-slider3-2048x1014.jpg";
import bgSlider4 from "../../assets/slider Images/home-slider4-2048x1014.jpg";
import bgRestaurant from "../../assets/slider Images/restaurent-2048x1014.jpg";

function CustomerPasswordResetPage() {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Slideshow images array
    const sliderImages = [bgFront, bgSlider2, bgSlider3, bgSlider4, bgRestaurant];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Rotate background every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    function validatePassword(password) {
        return (
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[@$!%*?&]/.test(password) &&
            password.length >= 8
        );
    }

    async function handleSendOtp() {
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/customers/send-otp",
                { email: email.trim() }
            );

            toast.success("OTP sent to your email.");
            setOtpSent(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!otp.trim()) {
            toast.error("Please enter the OTP");
            return;
        }
        if (!validatePassword(newPassword)) {
            toast.error("Password does not meet all requirements");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/customers/reset-password",
                {
                    email: email.trim(),
                    otp: otp.trim(),
                    newPassword: newPassword,
                }
            );

            toast.success("Password reset successful!");

            setOtpSent(false);
            setEmail("");
            setOtp("");
            setNewPassword("");

            navigate("/customerLogin");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-slate-950 p-4">
            
            {/* 1. Cinematic Slideshow Background (Full Screen) */}
            <div className="absolute inset-0 z-0">
                {sliderImages.map((image, index) => (
                    <div
                        key={index}
                        style={{ backgroundImage: `url(${image})` }}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
                            index === currentImageIndex 
                                ? "opacity-40 scale-100" 
                                : "opacity-0 scale-105"
                        }`}
                    />
                ))}
                {/* Immersive overlay gradients for visual depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
            </div>

            {/* 2. Floating Ambient Glow Radial (Behind Card) */}
            <div className="absolute z-10 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-500 to-amber-500 blur-3xl opacity-15 animate-pulse" />

            {/* 3. Floating Glassmorphic Reset Card */}
            <div className="relative z-20 w-full max-w-[460px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] p-8 md:p-10 flex flex-col items-center">
                
                {/* Elegant Brand Header */}
                <div className="flex flex-col items-center gap-3.5 mb-8 text-center">
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                        <img src={Logo} alt="BlueBird Logo" className="w-14 h-14 object-contain" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-extrabold text-white tracking-wider uppercase">BlueBird</h1>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.25em]">Hotels & Resorts</p>
                    </div>
                </div>

                {otpSent ? (
                    <div className="w-full flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Verify & Reset</h2>
                        <p className="text-xs text-slate-300 text-center mb-6 max-w-[280px]">
                            Please enter the OTP sent to your email and choose a secure new password.
                        </p>

                        {/* OTP Field */}
                        <div className="w-full space-y-2 mb-4">
                            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                One-Time Password (OTP)
                            </label>
                            <div className="relative group">
                                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm group-focus-within:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    disabled={loading}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-sm text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* New Password Field */}
                        <div className="w-full space-y-2 mb-4">
                            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm group-focus-within:scale-110 transition-transform" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    className="w-full pl-11 pr-16 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-sm text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                                </button>
                            </div>
                        </div>

                        {/* Password strength guidelines */}
                        <div className="w-full bg-white/5 p-3.5 rounded-2xl border border-white/5 text-[10px] tracking-wide mb-6">
                            <p className="text-slate-400 font-bold uppercase tracking-wider mb-2 text-[9px]">Password Guidelines</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px] leading-none">•</span> One uppercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px] leading-none">•</span> One lowercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 ${/\d/.test(newPassword) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px] leading-none">•</span> One number
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[@$!%*?&]/.test(newPassword) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px] leading-none">•</span> One special character
                                </div>
                                <div className={`flex items-center gap-1.5 col-span-2 ${newPassword.length >= 8 ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px] leading-none">•</span> At least 8 characters
                                </div>
                            </div>
                        </div>

                        {/* Reset password button */}
                        <button
                            disabled={!validatePassword(newPassword) || loading}
                            onClick={handleResetPassword}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer uppercase tracking-wider mb-6"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <div className="flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                disabled={loading}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                            >
                                Change Email / Resend OTP
                            </button>

                            <div className="text-xs text-slate-300 flex items-center gap-1.5 pl-1">
                                <span>Or return to</span>
                                <button
                                    type="button"
                                    onClick={() => navigate("/customerLogin")}
                                    disabled={loading}
                                    className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Reset Password</h2>
                        <p className="text-xs text-slate-300 text-center mb-6 max-w-[280px]">
                            Enter your registered email address to receive a one-time verification code.
                        </p>

                        {/* Email Field */}
                        <div className="w-full space-y-2 mb-6">
                            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm group-focus-within:scale-110 transition-transform" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your registered email"
                                    disabled={loading}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-sm text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Send OTP button */}
                        <button
                            disabled={loading}
                            onClick={handleSendOtp}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer uppercase tracking-wider mb-6"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <div className="text-xs text-slate-300 flex items-center gap-1.5 pl-1">
                            <span>Remembered your password?</span>
                            <button
                                type="button"
                                onClick={() => navigate("/customerLogin")}
                                disabled={loading}
                                className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Tiny Bottom Page Indicators (Slideshow Progress) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {sliderImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            index === currentImageIndex ? "w-8 bg-amber-500" : "w-1.5 bg-white/20 hover:bg-white/50"
                        }`}
                    />
                ))}
            </div>

        </div>
    );
}

export default CustomerPasswordResetPage;