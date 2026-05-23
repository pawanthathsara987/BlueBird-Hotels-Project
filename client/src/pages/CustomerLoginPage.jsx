import { useState, useEffect } from "react";
import Logo from "../assets/bluebird logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Import local background assets from slider Images folder
import bgFront from "../assets/slider Images/front-2048x1014.jpg";
import bgSlider2 from "../assets/slider Images/home-slider2-2048x1014.jpg";
import bgSlider3 from "../assets/slider Images/home-slider3-2048x1014.jpg";
import bgSlider4 from "../assets/slider Images/home-slider4-2048x1014.jpg";
import bgRestaurant from "../assets/slider Images/restaurent-2048x1014.jpg";

export default function CustomerLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const googleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                setLoading(true);

                const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/customers/google-login", {
                    token: response.access_token
                });

                if (rememberMe) {
                    localStorage.setItem("customerToken", res.data.token);
                } else {
                    sessionStorage.setItem("customerToken", res.data.token);
                }

                const from = location.state?.from || "/";
                toast.success("Google login successful!");
                navigate(from);

            } catch (error) {
                console.error("Google login error:", error);
                toast.error("Google login failed");
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error("Google login error:", error);
            toast.error("Google login failed");
        }
    });

    async function handleLogin() {
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/customers/login", {
                email,
                password
            });

            const token = res.data.token;

            if (rememberMe) {
                localStorage.setItem("customerToken", token);
            } else {
                sessionStorage.setItem("customerToken", token);
            }

            const from = location.state?.from || "/";
            toast.success("Login successful!");
            setLoading(false);
            navigate(from);
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "Login failed");
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

            {/* 3. Floating Glassmorphic Login Card */}
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

                {/* Email Field */}
                <div className="w-full space-y-2 mb-5">
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

                {/* Password Field */}
                <div className="w-full space-y-2 mb-4">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                        Password
                    </label>
                    <div className="relative group">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm group-focus-within:scale-110 transition-transform" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your account password"
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

                {/* Keep Signed In & Forgot Password */}
                <div className="w-full flex items-center justify-between text-xs font-semibold mb-7 pl-1">
                    <label className="flex items-center gap-2.5 text-slate-300 hover:text-white cursor-pointer select-none transition-colors">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-amber-500 text-amber-500 focus:ring-amber-500/30"
                        />
                        Remember me
                    </label>
                    <button
                        type="button"
                        onClick={() => navigate("/customer-reset-password")}
                        disabled={loading}
                        className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4">
                    <button
                        disabled={loading}
                        onClick={handleLogin}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer uppercase tracking-wider"
                    >
                        {loading ? "Verifying..." : "Login"}
                    </button>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] my-5">
                        <div className="h-[1px] flex-1 bg-white/10" />
                        <span>or</span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => googleLogin()}
                        className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        <FcGoogle className="text-xl" />
                        Continue with Google
                    </button>
                </div>

                {/* Registration Footer */}
                <div className="mt-8 text-xs text-slate-300 flex items-center gap-1.5 pl-1">
                    <span>Not a member yet?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/registerCustomer")}
                        disabled={loading}
                        className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                    >
                        Register Now
                    </button>
                </div>
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