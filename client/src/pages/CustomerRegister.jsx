import { useMemo, useState } from "react";
import { getCountries, getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import Logo from "../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";



export default function CustomerRegister() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneCountry, setPhoneCountry] = useState("LK");
    const [country, setCountry] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const countryCodeOptions = useMemo(() => {
        const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

        return getCountries()
            .map((countryCode) => {
                const dialingCode = `+${getCountryCallingCode(countryCode)}`;
                const countryName = displayNames.of(countryCode) || countryCode;

                return {
                    value: countryCode,
                    countryName,
                    dialingCode
                };
            })
            .sort((a, b) => a.countryName.localeCompare(b.countryName));
    }, []);

    const selectedCountryData = useMemo(() => {
        return countryCodeOptions.find((option) => option.value === phoneCountry) || countryCodeOptions[0];
    }, [countryCodeOptions, phoneCountry]);

    const handlePhoneCountryChange = (newCountryCode) => {
        setPhoneCountry(newCountryCode);
    };

    const selectedDialingCode = useMemo(() => {
        return selectedCountryData?.dialingCode || "+94";
    }, [selectedCountryData]);



    async function handleRegister() {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !country.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (!isValidPhoneNumber(phoneNumber.trim(), phoneCountry)) {
            toast.error(`Invalid phone number for ${selectedCountryData.countryName}. Please check the number.`);
            return;
        }

        if (!passwordRegex.test(password)) {
            toast.error(
                "Password must be 8+ chars and include uppercase, lowercase, number, and special character"
            );
            return;
        }

        if (!emailRegex.test(email)) {
            toast.error("Invalid email address");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/customers/register",
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phoneNumber: `${selectedDialingCode}${phoneNumber.trim()}`,
                    country: country.trim(),
                    password: password.trim(),
                    confirmPassword: confirmPassword.trim()
                }
            );
            toast.success("Registration successful! Please log in.");
            navigate("/customerLogin");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="w-full h-screen flex flex-col items-center gap-6">
            <div>
                <img src={Logo} className="w-32 object-contain" />
            </div>
            <div className="w-150 h-fit shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">
                <h1 className="text-[30px] font-bold pt-5">Create Account</h1>
                <div className="w-112.5 mt-7 flex gap-4">
                    <div className="flex-1">
                        <p>First Name</p>
                        <input
                            type="text"
                            placeholder="Your First Name"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <p>Last Name</p>
                        <input
                            type="text"
                            placeholder="Your Last Name"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-112.5 mt-7">
                    <p>Email</p>
                    <input
                        type="email"
                        placeholder="Your email"
                        className="w-full h-12.5 border border-black/20 p-3 rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="w-112.5 mt-7">
                    <p>Country</p>
                    <select
                        placeholder="Your country"
                        className="w-full h-12.5 border border-black/20 p-3 rounded-lg"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        <option value=""> Select Your Country</option>
                        {countryCodeOptions.map((item) => (
                            <option key={item.value} value={item.countryName}>
                                {item.countryName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-112.5 mt-7">
                    <p>Phone Number</p>
                    <div className="flex gap-3">
                        <select
                            className="w-58 h-12.5 border border-black/20 rounded-lg px-3 bg-white"
                            value={phoneCountry}
                            onChange={(e) => handlePhoneCountryChange(e.target.value)}
                        >
                            {countryCodeOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.countryName} ({item.dialingCode})
                                </option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            placeholder="Your phone number"
                            className="flex-1 h-12.5 border border-black/20 p-3 rounded-lg"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-112.5 mt-7">
                    <p>Password</p>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Your password"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg pr-20"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <ul className="text-sm mt-2">
                        <li className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                            • One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                            • One lowercase letter
                        </li>
                        <li className={/\d/.test(password) ? "text-green-500" : "text-gray-400"}>
                            • One number
                        </li>
                        <li className={/[@$!%*?&]/.test(password) ? "text-green-500" : "text-gray-400"}>
                            • One special character
                        </li>
                        <li className={password.length >= 8 ? "text-green-500" : "text-gray-400"}>
                            • At least 8 characters
                        </li>
                    </ul>
                </div>
                <div className="w-112.5 mt-7">
                    {confirmPassword && (
                        <p className={password === confirmPassword ? "text-green-500" : "text-red-500"}>
                            {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                        </p>
                    )}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg pr-20"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((current) => !current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <div className="w-112.5 mt-7 pb-5">
                    <button
                        disabled={loading}
                        className="w-full h-12.5 bg-blue-500 font-bold text-white rounded-lg border-black/20 hover:cursor-pointer transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleRegister}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </div>
                <div className="pb-6 text-sm text-gray-600 flex items-center gap-2">
                    <span>Already a member?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/customerLogin")}
                        className="font-semibold text-blue-600 hover:underline hover:cursor-pointer"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}