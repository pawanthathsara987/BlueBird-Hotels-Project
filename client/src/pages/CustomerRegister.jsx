import { useMemo, useState, useEffect } from "react";
import { getCountries, getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import Logo from "../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaGlobe, FaPhone, FaLock, FaEye, FaEyeSlash, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
import { validateSriLankanNIC, validatePassport } from "../utils/validation";

// Import local background assets from slider Images folder
import bgFront from "../assets/slider Images/front-2048x1014.jpg";
import bgSlider2 from "../assets/slider Images/home-slider2-2048x1014.jpg";
import bgSlider3 from "../assets/slider Images/home-slider3-2048x1014.jpg";
import bgSlider4 from "../assets/slider Images/home-slider4-2048x1014.jpg";
import bgRestaurant from "../assets/slider Images/restaurent-2048x1014.jpg";

export default function CustomerRegister() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Core Customer Fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneCountry, setPhoneCountry] = useState("LK");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // ID Verification Fields
    const [idType, setIdType] = useState("NIC"); // 'NIC' or 'PASSPORT'
    const [idNumber, setIdNumber] = useState("");
    const [idError, setIdError] = useState(false);

    // Address Construction Fields
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");

    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // Live validation for ID Number
    useEffect(() => {
        if (idNumber === "") {
            setIdError(false);
        } else if (idType === "NIC") {
            setIdError(!validateSriLankanNIC(idNumber));
        } else if (idType === "PASSPORT") {
            setIdError(!validatePassport(idNumber));
        }
    }, [idNumber, idType]);

    async function handleRegister() {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim() || !confirmPassword.trim() || !addressLine1.trim() || !city.trim() || !country.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!isValidPhoneNumber(phoneNumber.trim(), phoneCountry)) {
            toast.error(`Invalid phone number for ${selectedCountryData.countryName}. Please check the number.`);
            return;
        }

        // ID Validation (Optional)
        if (idNumber.trim() !== "") {
            if (idType === "NIC" && !validateSriLankanNIC(idNumber)) {
                toast.error("Invalid NIC format. Must be 9 digits with V/X or 12 digits.");
                return;
            }
            if (idType === "PASSPORT" && !validatePassport(idNumber)) {
                toast.error("Invalid Passport format. Must be 6 to 15 alphanumeric characters.");
                return;
            }
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

        // Construct 3-part address string to store in DB address field:
        // Part 1: Address Lines combined, Part 2: City, Part 3: Zip/Postal Code (if available)
        const streetPart = addressLine2.trim() 
            ? `${addressLine1.trim()}, ${addressLine2.trim()}` 
            : addressLine1.trim();
            
        const fullAddress = [
            streetPart,
            city.trim(),
            zipCode.trim() ? zipCode.trim() : null
        ].filter(Boolean).join(", ");

        try {
            setLoading(true);
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/customers/register",
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phoneNumber: `${selectedDialingCode}${phoneNumber.trim()}`,
                    country: country.trim(),
                    password: password.trim(),
                    confirmPassword: confirmPassword.trim(),
                    idType: idType,
                    idNumber: idNumber.trim(),
                    address: fullAddress
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
        <div className="w-full min-h-screen relative flex items-center justify-center font-sans py-10 px-4 overflow-x-hidden">
            
            {/* 1. Cinematic Slideshow Background (Fixed to Viewport) */}
            <div className="fixed inset-0 z-0 bg-slate-950">
                {sliderImages.map((image, index) => (
                    <div
                        key={index}
                        style={{ backgroundImage: `url(${image})` }}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
                            index === currentImageIndex 
                                ? "opacity-30 scale-100" 
                                : "opacity-0 scale-105"
                        }`}
                    />
                ))}
                {/* Immersive overlay gradients for visual depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
            </div>

            {/* 2. Floating Ambient Glow Radial (Centered Behind Card) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-blue-500 to-amber-500 blur-3xl opacity-10 animate-pulse pointer-events-none" />

            {/* 3. Floating Glassmorphic Registration Card */}
            <div className="relative z-20 w-full max-w-[650px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] p-6 md:p-8 flex flex-col items-center">
                
                {/* Elegant Brand Header */}
                <div className="flex flex-col items-center gap-2 mb-6 text-center">
                    <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                        <img src={Logo} alt="BlueBird Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-extrabold text-white tracking-wider uppercase">Create Account</h1>
                        <p className="text-[9px] text-amber-400 font-bold uppercase tracking-[0.25em]">BlueBird Hotels & Resorts</p>
                    </div>
                </div>

                {/* Form Wrapper */}
                <div className="w-full space-y-5">
                    
                    {/* SECTION I: Personal Details */}
                    <div>
                        <h2 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 pb-1 border-b border-white/5">I. Personal Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Name */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    First Name <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs transition-transform" />
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Last Name <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs transition-transform" />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Email Address <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs transition-transform" />
                                    <input
                                        type="email"
                                        placeholder="Your Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Phone number row */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Phone Number <span className="text-amber-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative w-28">
                                        <select
                                            value={phoneCountry}
                                            onChange={(e) => handlePhoneCountryChange(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-3 pr-7 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white appearance-none cursor-pointer"
                                        >
                                            {countryCodeOptions.map((item) => (
                                                <option key={item.value} value={item.value} className="bg-slate-900 text-white">
                                                    {item.value} ({item.dialingCode})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">▼</div>
                                    </div>
                                    <div className="relative flex-1">
                                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION II: Identity Verification */}
                    <div>
                        <h2 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 pb-1 border-b border-white/5">II. Verification Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ID Type Dropdown */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Identification Type <span className="text-slate-400 text-[8px]">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs z-10" />
                                    <select
                                        value={idType}
                                        onChange={(e) => {
                                            setIdType(e.target.value);
                                            setIdNumber("");
                                        }}
                                        disabled={loading}
                                        className="w-full pl-10 pr-8 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white appearance-none cursor-pointer"
                                    >
                                        <option value="NIC" className="bg-slate-900 text-white">National Identity Card (NIC)</option>
                                        <option value="PASSPORT" className="bg-slate-900 text-white">Passport</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">▼</div>
                                </div>
                            </div>

                            {/* ID / Passport Number */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    {idType === "NIC" ? "NIC Number" : "Passport Number"} <span className="text-slate-400 text-[8px]">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <FaIdCard className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                                        idNumber === "" ? "text-amber-400" : idError ? "text-rose-400" : "text-emerald-400"
                                    }`} />
                                    <input
                                        type="text"
                                        placeholder={idType === "NIC" ? "e.g. 199912345678" : "e.g. N1234567"}
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        disabled={loading}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-xl focus:outline-none focus:ring-4 transition-all text-xs text-white placeholder-slate-400 ${
                                            idNumber === ""
                                                ? "border-white/10 focus:ring-amber-500/20 focus:border-amber-400/80"
                                                : idError
                                                    ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500"
                                                    : "border-emerald-400 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        }`}
                                    />
                                </div>
                                {idNumber !== "" && idError && (
                                    <p className="text-[10px] text-rose-500 font-semibold pl-1 animate-pulse">
                                        {idType === "NIC" 
                                            ? "Format invalid (use 9 digits + V/X or 12 digits)." 
                                            : "Passport invalid (6-15 alphanumeric characters only)."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION III: Address & Location */}
                    <div>
                        <h2 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 pb-1 border-b border-white/5">III. Address & Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Address Line 1 */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Address Line 1 <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Street Address, P.O. Box, or Company Name"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Address Line 2 */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Address Line 2 <span className="text-slate-400 text-[8px]">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Apartment, Suite, Unit, Building, or Floor"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* City */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    City <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="City Name"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* ZIP / Postal Code */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    ZIP / Postal Code <span className="text-slate-400 text-[8px]">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="ZIP / Postal Code"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Country (moved to address section) */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Country <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs z-10" />
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-8 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900 text-slate-400">Select Country</option>
                                        {countryCodeOptions.map((item) => (
                                            <option key={item.value} value={item.countryName} className="bg-slate-900 text-white">
                                                {item.countryName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">▼</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION IV: Password Security */}
                    <div>
                        <h2 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 pb-1 border-b border-white/5">IV. Security Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Password <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((curr) => !curr)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                    Confirm Password <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400/80 focus:bg-white/10 transition-all text-xs text-white placeholder-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((curr) => !curr)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password strength checklist */}
                        <div className="w-full bg-white/5 p-3 rounded-2xl border border-white/5 text-[10px] tracking-wide mt-4">
                            <p className="text-slate-400 font-bold uppercase tracking-wider mb-2 text-[9px]">Password Guidelines</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px]">•</span> One uppercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px]">•</span> One lowercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px]">•</span> One number
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[@$!%*?&]/.test(password) ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px]">•</span> One special character
                                </div>
                                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-400" : "text-slate-400"}`}>
                                    <span className="text-[20px]">•</span> 8+ characters
                                </div>
                                {confirmPassword && (
                                    <div className={`flex items-center gap-1.5 col-span-2 sm:col-span-1 ${password === confirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                                        <span className="text-[20px]">•</span> {password === confirmPassword ? "Passwords match" : "Match failed"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4 mt-6">
                    <button
                        disabled={loading}
                        onClick={handleRegister}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer uppercase tracking-wider"
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </div>

                {/* Login Redirect Footer */}
                <div className="mt-6 text-xs text-slate-300 flex items-center gap-1.5 pl-1">
                    <span>Already have an account?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/customerLogin")}
                        disabled={loading}
                        className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                    >
                        Login
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