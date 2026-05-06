import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/bluebird logo.png";

function CustomerPasswordResetPage() {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
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
        <div className="w-full h-screen flex flex-col items-center justify-center gap-6">
            <div>
                <img src={Logo} className="w-32 object-contain" />
            </div>
            {otpSent ? (
                <div className="w-112.5 flex flex-col justify-center items-center rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl mb-6 font-bold">
                        Enter OTP & New Password
                    </h1>

                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <ul className="text-sm mt-2 w-full">
                        <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                            • One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                            • One lowercase letter
                        </li>
                        <li className={/\d/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                            • One number
                        </li>
                        <li className={/[@$!%*?&]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                            • One special character
                        </li>
                        <li className={newPassword.length >= 8 ? "text-green-500" : "text-gray-400"}>
                            • At least 8 characters
                        </li>
                    </ul>
                    <button
                        onClick={handleResetPassword}
                        disabled={!validatePassword(newPassword) || loading}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </div>
            ) : (
                <div className="w-112.5 flex flex-col justify-center items-center rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl mb-6 font-bold">
                        Reset Your Password
                    </h1>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default CustomerPasswordResetPage;