import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/bluebird logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey, FaArrowLeft } from "react-icons/fa";

function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/users/send-otp",
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
      toast.error("Please enter the OTP.");
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/users/reset-password",
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

      // Redirect to receptionist, manager, or admin login portal based on user's registered role
      const userRole = response?.data?.role;
      if (userRole === "manager") {
        navigate("/managerLogin");
      } else if (userRole === "admin") {
        navigate("/adminLogin");
      } else {
        navigate("/receptionistLogin");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-slate-50/50 p-4">
      {/* Elegant Ambient Background Light Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Back Button (Top Left) */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-30 flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-full shadow-sm transition-all duration-300 cursor-pointer group hover:-translate-x-1"
        title="Go to previous page"
      >
        <FaArrowLeft className="text-[10px] md:text-xs text-slate-400 group-hover:text-slate-600 transition-transform group-hover:-translate-x-0.5" />
        <span>Back</span>
      </button>

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-20 w-full max-w-[460px] bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(59,130,246,0.06)] p-8 md:p-10 flex flex-col items-center">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3.5 mb-8 w-full">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white p-3 rounded-full border border-slate-100 shadow-sm flex items-center justify-center w-20 h-20 mx-auto">
              <img src={Logo} alt="Logo" className="w-12 h-12 object-contain transition hover:scale-105 duration-300" />
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full tracking-wider uppercase">
              Staff Portal
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight pt-1">
              {otpSent ? "Verify Security Code" : "Reset Your Password"}
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-[280px] mx-auto leading-relaxed">
              {otpSent 
                ? "Enter the code sent to your email to set a new password." 
                : "Enter your registered email address to receive a one-time password."}
            </p>
          </div>
        </div>

        {/* Custom Visual Stepper */}
        <div className="flex items-center justify-center gap-4 w-full mb-8 border-b border-slate-100 pb-6 select-none">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${!otpSent ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
              {!otpSent ? "1" : "✓"}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${!otpSent ? "text-blue-600" : "text-emerald-600"}`}>Email</span>
          </div>
          <div className="w-8 h-[2px] bg-slate-100 rounded relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 transition-transform duration-500 ${otpSent ? "translate-x-0" : "-translate-x-full"}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${otpSent ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
              2
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${otpSent ? "text-blue-600" : "text-slate-400"}`}>Reset</span>
          </div>
        </div>

        {/* Main Content Form */}
        <div className="w-full space-y-5">
          {otpSent ? (
            <>
              {/* OTP Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">
                  Verification Code (OTP)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <FaKey className="text-slate-400 group-focus-within:text-blue-500 transition-colors text-sm" />
                  </span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">
                  New Password
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400 group-focus-within:text-blue-500 transition-colors text-sm" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a secure password"
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                  </button>
                </div>

                {/* Password strength guidelines */}
                <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] tracking-wide mt-3 select-none">
                  <p className="text-slate-400 font-extrabold uppercase tracking-wider mb-2.5 text-[9px]">Password Guidelines</p>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold transition-all duration-300 ${/[A-Z]/.test(newPassword) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                        </div>
                        <span className={`transition-colors duration-300 ${/[A-Z]/.test(newPassword) ? "text-emerald-600/90 font-medium" : "text-slate-500"}`}>1 Uppercase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold transition-all duration-300 ${/[a-z]/.test(newPassword) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          {/[a-z]/.test(newPassword) ? "✓" : "○"}
                        </div>
                        <span className={`transition-colors duration-300 ${/[a-z]/.test(newPassword) ? "text-emerald-600/90 font-medium" : "text-slate-500"}`}>1 Lowercase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold transition-all duration-300 ${/\d/.test(newPassword) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          {/\d/.test(newPassword) ? "✓" : "○"}
                        </div>
                        <span className={`transition-colors duration-300 ${/\d/.test(newPassword) ? "text-emerald-600/90 font-medium" : "text-slate-500"}`}>1 Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold transition-all duration-300 ${/[@$!%*?&]/.test(newPassword) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          {/[@$!%*?&]/.test(newPassword) ? "✓" : "○"}
                        </div>
                        <span className={`transition-colors duration-300 ${/[@$!%*?&]/.test(newPassword) ? "text-emerald-600/90 font-medium" : "text-slate-500"}`}>1 Special Char</span>
                      </div>
                    </div>
                    <div className="h-[1px] bg-slate-100 w-full" />
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold transition-all duration-300 ${newPassword.length >= 8 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                        {newPassword.length >= 8 ? "✓" : "○"}
                      </div>
                      <span className={`transition-colors duration-300 ${newPassword.length >= 8 ? "text-emerald-600/90 font-medium" : "text-slate-500"}`}>At least 8 characters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Password Action */}
              <button
                onClick={handleResetPassword}
                disabled={!validatePassword(newPassword) || loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-6"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Resetting...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* Secondary Navigation */}
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  disabled={loading}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
                >
                  Change Email / Resend OTP
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <FaEnvelope className="text-slate-400 group-focus-within:text-blue-500 transition-colors text-sm" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="receptionist@bluebird.com"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Send OTP Action */}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition duration-200 shadow-md shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer mt-6"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Security Code (OTP)"
                )}
              </button>

            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default PasswordResetPage;