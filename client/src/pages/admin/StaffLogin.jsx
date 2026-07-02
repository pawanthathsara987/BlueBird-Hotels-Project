import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaCheckCircle, FaEdit } from "react-icons/fa";

export default function StaffLogin() {
    const [emailVerified, setEmailVerified] = useState(false);
    const [shouldRegister, setShouldRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [role, setRole] = useState(null); // 'admin', 'manager', 'receptionist'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    // Dynamically switch styling themes based on detected role
    const getRoleTheme = () => {
        switch (role) {
            case "admin":
                return {
                    badgeText: "Admin Portal",
                    badgeClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
                    focusRing: "focus:ring-indigo-500/20 focus:border-indigo-500",
                    buttonClass: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10",
                    accentText: "text-indigo-600 hover:text-indigo-800"
                };
            case "manager":
                return {
                    badgeText: "Management Portal",
                    badgeClass: "text-violet-600 bg-violet-50 border-violet-100",
                    focusRing: "focus:ring-violet-500/20 focus:border-violet-500",
                    buttonClass: "bg-violet-600 hover:bg-violet-700 shadow-violet-500/10",
                    accentText: "text-violet-600 hover:text-violet-800"
                };
            case "receptionist":
                return {
                    badgeText: "Receptionist Portal",
                    badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500",
                    buttonClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10",
                    accentText: "text-emerald-600 hover:text-emerald-800"
                };
            default:
                return {
                    badgeText: "Staff Portal",
                    badgeClass: "text-slate-600 bg-slate-50 border-slate-100",
                    focusRing: "focus:ring-slate-500/20 focus:border-slate-500",
                    buttonClass: "bg-slate-700 hover:bg-slate-800 shadow-slate-500/10",
                    accentText: "text-slate-600 hover:text-slate-800"
                };
        }
    };

    const theme = getRoleTheme();

    async function handleVerifyEmail() {
        if (!email.trim()) {
            toast.error("Please enter your email first.");
            return;
        }

        try {
            setIsVerifying(true);
            setVerifyMessage("");

            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/users/verify-email",
                { email: email.trim() }
            );

            const showLogin = res?.data?.showLogin;
            const showRegister = res?.data?.showRegister;
            const detectedRole = res?.data?.role;

            setRole(detectedRole || null);
            setEmailVerified(showLogin);
            setShouldRegister(showRegister);

            if (showLogin) {
                toast.success("Email verified. Please enter your password.");
            } else if (showRegister) {
                toast.success(res?.data?.message || "Staff email detected. Please complete registration.");
            } else {
                toast.error(res?.data?.message || "Email is not authorized.");
            }
        } catch (error) {
            setVerifyMessage(
                error?.response?.data?.message || "Failed to verify email"
            );
            toast.error(error?.response?.data?.message || "Failed to verify email");
        } finally {
            setIsVerifying(false);
        }
    }

    async function handleLogin() {
        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        try {
            setIsLoggingIn(true);
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/login", {
                email: email.trim(),
                password: password,
                role: role
            });

            toast.success(res?.data?.message || "Login successful.");
            if (res.data && res.data.token) {
                localStorage.setItem("token", res.data.token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
            }
            
            // Save user details
            if (res.data.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }
            
            // Handle role-based settings and routing
            const userRole = res.data.user?.role || role;
            if (userRole === "admin") {
                localStorage.setItem("adminName", res?.data?.name || "Administrator");
                localStorage.setItem("adminEmail", res?.data?.email || email.trim());
                navigate("/admin");
            } else if (userRole === "manager") {
                navigate("/manager");
            } else if (userRole === "receptionist") {
                navigate("/reception");
            } else {
                navigate("/");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed.");
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function register() {
        try {
            if (!email.trim() || !password || !confirmPassword || !otp.trim()) {
                toast.error("Please fill in all fields including the verification code.");
                return;
            }

            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }

            setIsRegistering(true);
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/registerStaffMember", {
                email: email.trim(),
                password: password,
                confirmPassword: confirmPassword,
                otp: otp.trim(),
                role: role
            });

            toast.success(res?.data?.message || "Registration successful. You can now log in.");
            setShouldRegister(false);
            setEmailVerified(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally {
            setIsRegistering(false);
        }
    }

    function handleResetEmail() {
        setEmailVerified(false);
        setShouldRegister(false);
        setRole(null);
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setVerifyMessage("");
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden font-sans">
            {/* Elegant Ambient Background Light Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-8 space-y-6 relative z-10">
                
                {/* Logo & Header */}
                <div className="text-center space-y-4">
                    <img src={Logo} alt="Logo" className="w-28 mx-auto object-contain transition hover:scale-105 duration-300" />
                    
                    <div className="space-y-1">
                        <span className={`inline-block px-3 py-1 text-[10px] font-bold border rounded-full tracking-wider uppercase transition-all duration-300 ${theme.badgeClass}`}>
                            {theme.badgeText}
                        </span>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight pt-1">
                            Staff Portal Sign In
                        </h2>
                        <p className="text-slate-400 text-xs font-medium">
                            Verify your email to access your workspace
                        </p>
                    </div>
                </div>

                {/* Main Form Fields */}
                <div className="space-y-4 pt-2">
                    
                    {/* Email Field container */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Email Address
                        </label>
                        
                        {emailVerified || shouldRegister ? (
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 animate-fadeIn">
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                                    <span className="truncate max-w-[220px]">{email}</span>
                                </div>
                                <button
                                    onClick={handleResetEmail}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition cursor-pointer bg-transparent border-0 outline-none"
                                    title="Edit Email"
                                >
                                    <FaEdit />
                                    <span>Change</span>
                                </button>
                            </div>
                        ) : (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="username@bluebird.com"
                                className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 ${theme.focusRing}`}
                            />
                        )}
                    </div>

                    {/* Email Verification Action */}
                    {!emailVerified && !shouldRegister && (
                        <button
                            onClick={handleVerifyEmail}
                            disabled={isVerifying}
                            className={`w-full h-11 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-2 border-0 outline-none ${theme.buttonClass}`}
                        >
                            {isVerifying ? (
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                "Verify Email"
                            )}
                        </button>
                    )}

                    {/* Error Feedback message */}
                    {verifyMessage && !emailVerified && !shouldRegister && (
                        <p className="text-center text-xs font-bold px-3 py-2 rounded-xl border text-rose-700 bg-rose-50 border-rose-100 animate-fadeIn animate-none">
                            {verifyMessage}
                        </p>
                    )}

                    {/* Staff Registration Panel */}
                    {shouldRegister && !emailVerified && (
                        <div className="space-y-4 animate-fadeIn pt-2 border-t border-slate-100 mt-2">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        Verification Code (OTP)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleVerifyEmail}
                                        disabled={isVerifying}
                                        className={`text-xs font-bold transition disabled:opacity-50 cursor-pointer bg-transparent border-0 outline-none ${theme.accentText}`}
                                    >
                                        {isVerifying ? "Resending..." : "Resend Code"}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 ${theme.focusRing}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') register(); }}
                                        placeholder="Create password"
                                        className={`w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 ${theme.focusRing}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') register(); }}
                                        placeholder="Confirm password"
                                        className={`w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 ${theme.focusRing}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={register}
                                disabled={isRegistering}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-2 border-0 outline-none"
                            >
                                {isRegistering ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Registering...</span>
                                    </div>
                                ) : (
                                    "Register Staff Member"
                                )}
                            </button>
                        </div>
                    )}

                    {/* Sign-in / Password Panel */}
                    {emailVerified && (
                        <div className="space-y-4 animate-fadeIn pt-2 border-t border-slate-100 mt-2">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                                    <Link to="/reset-password" className={`text-xs font-bold transition bg-transparent border-0 outline-none ${theme.accentText}`}>
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                                        placeholder="Enter your password"
                                        className={`w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 ${theme.focusRing}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className={`w-full h-11 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-2 border-0 outline-none ${theme.buttonClass}`}
                            >
                                {isLoggingIn ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Signing In...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
