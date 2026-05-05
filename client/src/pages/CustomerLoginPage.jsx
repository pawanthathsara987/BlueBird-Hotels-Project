import { useState } from "react";
import Logo from "../assets/bluebird logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CustomerLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();


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
            toast.success("Login successful!.");
            setLoading(false);
            navigate("/");
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
                    <button type="button" className="text-sm text-blue-600 hover:underline hover:cursor-pointer">
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