import { useState } from "react";
import Logo from "../assets/bluebird logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { AppleIcon } from "lucide-react";

export default function CustomerLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const googleLogin = useGoogleLogin(
        {
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
        }
    );


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
        <div className="w-full h-screen flex flex-col items-center gap-6">
            <div>
                <img src={Logo} className="w-32 object-contain" />
            </div>
            <div className="w-150 h-fit shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">
                <h1 className="text-[30px] font-bold pt-5">Login Account</h1>

                <div className="w-112.5 mt-7">
                    <p>Email</p>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full h-12.5 border border-black/20 p-3 rounded-lg" />
                </div>

                <div className="w-112.5 mt-7">
                    <p>Password</p>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg pr-20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="w-112.5 flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        Remember me
                    </label>
                    <button
                        type="button"
                        onClick={() => navigate("/customer-reset-password")}
                        className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
                    >
                        Forgot password?
                    </button>
                </div>

                <div className="w-112.5 mt-7 pb-5">
                    <button
                        disabled={loading}
                        onClick={handleLogin}
                        className="w-full h-12.5 bg-blue-500 font-bold text-white rounded-lg 
               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="my-4 flex items-center gap-3 text-sm text-gray-400">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span>or</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => googleLogin()}
                        className="w-full h-12.5 border border-black/20 rounded-lg flex items-center justify-center gap-3 font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <FcGoogle className="text-xl" />
                        Continue with Google
                    </button>
                </div>
                <div className="pb-6 text-sm text-gray-600 flex items-center gap-2">
                    <span>Not a member?</span>
                    <button type="button" onClick={() => navigate("/registerCustomer")} className="font-semibold text-blue-600 hover:underline hover:cursor-pointer">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}