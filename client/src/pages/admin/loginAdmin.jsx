import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginAdmin() {

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
                { email: email.trim() }
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
                password: password
            });

            toast.success(res?.data?.message || "Login successful.");
            navigate("/");
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

        <div className="w-full h-screen flex flex-col items-center gap-6">

            <div>
                <img src={Logo} alt="Logo" className="w-32 object-contain" />
            </div>

            <div className="w-[450px] h-fit mb-10 shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">

                <h1 className="text-[30px] font-bold pt-5">Admin Login</h1>

                <div className="w-[350px] mt-10">
                    <p>Email</p>
                    <input
                        type="text"
                        value={email}
                        disabled={emailVerified}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        className="w-full h-[50px] p-3 rounded-lg border border-black/20"
                    />
                </div>

                {!emailVerified && !shouldRegister && (

                    <div className="w-[350px] mt-10">

                        <button
                            onClick={handleVerifyEmail}
                            disabled={isVerifying}
                            className="w-full h-[50px] mb-5 bg-blue-500 text-white font-bold rounded-lg hover:cursor-pointer disabled:opacity-60"
                        >
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </button>

                    </div>

                )}

                {verifyMessage && (

                    <p
                        className={`w-[350px] text-[13px] mt-3 ${emailVerified ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {verifyMessage}
                    </p>

                )}

                {shouldRegister && !emailVerified && (

                    <div className="w-[350px] ">
                        <div className="w-full mt-7">
                            <p>Password</p>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full h-[50px] p-3 rounded-lg border border-black/20" />
                        </div>
                        <div className="w-full mt-7">
                            <p>Confirm Password</p>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="w-full h-[50px] p-3 rounded-lg border border-black/20" />
                        </div>
                        <button onClick={register} 
                            className="w-full h-[50px] mb-5 mt-7 bg-green-500 text-white font-bold rounded-lg hover:cursor-pointer">
                            Register
                        </button>
                    </div>
                )}

                {emailVerified && (
                    <>
                        <div className="w-[350px] mt-8">
                            <p>Password</p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full h-[50px] p-3 rounded-lg border border-black/20"
                            />
                            <p className="text-right text-[13px] text-blue-600">

                                Forgot password?{" "}
                                <Link to="/reset-password" className="font-semibold">
                                    Reset here
                                </Link>
                            </p>
                        </div>

                        <div className="w-[350px] mt-8 mb-5">
                            <button
                                className="w-full h-[50px] bg-blue-500 text-white font-bold rounded-lg hover:cursor-pointer"
                                onClick={handleLogin}
                            >
                                Login
                            </button>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}