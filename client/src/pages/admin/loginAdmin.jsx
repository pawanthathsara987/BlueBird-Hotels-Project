import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/bluebird logo.png";
import axios from "axios";

export default function LoginAdmin() {

    const [emailVerified, setEmailVerified] = useState(false);
    const [shouldRegister, setShouldRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();

    async function handleVerifyEmail() {

        if (!email.trim()) {
            setVerifyMessage("Please enter your email first.");
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
                setVerifyMessage("Email verified. Please enter your password.");
            }
            else if (showRegister) {
                setVerifyMessage("Staff email detected. Please complete registration.");
            }
            else {
                setVerifyMessage("Email is not authorized.");
            }

        } catch (error) {

            setVerifyMessage(
                error?.response?.data?.message || "Failed to verify email"
            );

        } finally {
            setIsVerifying(false);
        }
    }

    

    return (

        <div className="w-full h-screen flex flex-col items-center gap-6">

            <div>
                <img src={Logo} alt="Logo" className="w-32 object-contain" />
            </div>

            <div className="w-[450px] h-[500px] mb-10 shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">

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
                            className="w-full h-[50px] bg-blue-500 text-white font-bold rounded-lg hover:cursor-pointer disabled:opacity-60"
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

                    <div className="w-[350px] mt-6">
                        <button
                            onClick={() => navigate("/userRegister")}
                            className="w-full h-[45px] bg-black text-white rounded-lg hover:cursor-pointer"
                        >
                            Go to Registration Form
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

                        <div className="w-[350px] mt-8">
                            <button
                                onClick={handleLogin}
                                className="w-full h-[50px] bg-blue-500 text-white font-bold rounded-lg hover:cursor-pointer"
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