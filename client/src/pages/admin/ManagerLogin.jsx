import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ManagerLogin() {

    const [emailVerified, setEmailVerified] = useState(false);
    const [shouldRegister, setShouldRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

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
                { email: email.trim(), role: "manager" }
            );

            const showLogin = res?.data?.showLogin;
            const showRegister = res?.data?.showRegister;

            setEmailVerified(showLogin);
            setShouldRegister(showRegister);

            if (showLogin) {
                toast.success("Email verified. Please enter your password.");
            }
            else if (showRegister) {
                toast.success("Staff email detected. Please complete registration.");
            }
            else {
                toast.error("Email is not authorized.");
            }

        } catch (error) {
            setVerifyMessage(
                error?.response?.data?.message || "Failed to verify email"
            );
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
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/login", {
                email: email,
                password: password,
                role: "manager"
            });

            toast.success(res?.data?.message || "Login successful.");
            navigate("/manager");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed.");
        }
    }

    async function register() {

        try {

            if (!email.trim() || !password || !confirmPassword) {
                toast.error("Please fill in all fields.");
                return;
            }

            if (password !== confirmPassword){
                toast.error("Passwords do not match.");
                return;
            }

            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/registerStaffMember", {
                email: email.trim(),
                password: password,
                confirmPassword: confirmPassword
            });

            toast.success(res?.data?.message || "Registration successful. You can now log in.");
            setShouldRegister(false);
            setEmailVerified(true);

        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        }
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-8 space-y-6">
                
                {/* Logo & Header */}
                <div className="text-center space-y-4">
                    <img src={Logo} alt="Logo" className="w-28 mx-auto object-contain transition hover:scale-105 duration-300" />
                    
                    <div className="space-y-1">
                        <span className="inline-block px-3 py-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 rounded-full tracking-wider uppercase">
                            Management Portal
                        </span>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight pt-1">
                            Manager Login
                        </h2>
                        <p className="text-slate-400 text-xs font-medium">
                            Verify your credentials to access the manager console
                        </p>
                    </div>
                </div>

                {/* Main Form Fields */}
                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Email Address
                        </label>
                        <input
                            type="text"
                            value={email}
                            disabled={emailVerified}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username@bluebird.com"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Email Verification Action */}
                    {!emailVerified && !shouldRegister && (
                        <button
                            onClick={handleVerifyEmail}
                            disabled={isVerifying}
                            className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-violet-500/10 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-2"
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

                    {/* Error / Success Status Feedback Messages */}
                    {verifyMessage && (
                        <p className={`text-center text-xs font-bold px-3 py-2 rounded-xl border ${
                            emailVerified 
                                ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                                : "text-rose-700 bg-rose-50 border-rose-100"
                        }`}>
                            {verifyMessage}
                        </p>
                    )}

                    {/* Staff Registration Panel */}
                    {shouldRegister && !emailVerified && (
                        <div className="space-y-4 animate-fadeIn pt-2 border-t border-slate-100 mt-2">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create password"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200"
                                />
                            </div>
                            <button
                                onClick={register}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-emerald-500/10 hover:scale-[1.01] flex items-center justify-center cursor-pointer mt-2"
                            >
                                Register staff member
                            </button>
                        </div>
                    )}

                    {/* Sign-in / Password Verification Panel */}
                    {emailVerified && (
                        <div className="space-y-4 animate-fadeIn pt-2 border-t border-slate-100 mt-2">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                                    <Link to="/reset-password" className="text-xs font-bold text-violet-600 hover:text-violet-800 transition">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50/50 placeholder-slate-400 font-medium transition duration-200"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-violet-500/10 hover:scale-[1.01] flex items-center justify-center cursor-pointer mt-2"
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
