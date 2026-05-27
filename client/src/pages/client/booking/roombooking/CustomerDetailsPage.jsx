import { useMemo, useState, useEffect } from "react";
import { getCountries, getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import Logo from "../../../../assets/bluebird logo.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaGlobe, FaPhone, FaLock, FaEye, FaEyeSlash, 
  FaIdCard, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaCalendar, 
  FaUsers, FaClock, FaCheck, FaInfoCircle 
} from "react-icons/fa";
import { validateSriLankanNIC, validatePassport } from "../../../../utils/validation";

export default function CustomerDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Preserve checkout state passed from BookingSummary
    const bookingData = location.state?.bookingData || {};
    const selectedRooms = location.state?.selectedRooms || [];

    const userNationality = bookingData.nationality || "";
    const isSriLankan = userNationality === "Sri Lankan";

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
    const [idType, setIdType] = useState(isSriLankan ? "NIC" : "PASSPORT"); // 'NIC' or 'PASSPORT'
    const [idNumber, setIdNumber] = useState("");
    const [idError, setIdError] = useState(false);

    // Address Construction Fields
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState(isSriLankan ? "Sri Lanka" : "");

    const {
        checkInDate,
        checkOutDate,
        nights = 0,
        totalPrice = 0,
    } = bookingData;

    const checkIn = checkInDate ? new Date(checkInDate) : null;
    const checkOut = checkOutDate ? new Date(checkOutDate) : null;

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

    // Aggregate adults and kids for summary
    const totalAdults = selectedRooms.reduce((sum, r) => sum + (r.adults || 0), 0);
    const totalKids = selectedRooms.reduce((sum, r) => sum + (r.kids || 0), 0);

    const handleGoBack = () => {
        navigate("/booking-summary", {
            state: {
                bookingData,
                selectedRooms,
            }
        });
    };

    async function handleRegisterAndPayment() {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim() || !confirmPassword.trim() || !addressLine1.trim() || !city.trim() || !country.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!isValidPhoneNumber(phoneNumber.trim(), phoneCountry)) {
            toast.error(`Invalid phone number for ${selectedCountryData.countryName}. Please check the number.`);
            return;
        }

        // ID Validation (Mandatory based on nationality type)
        if (!idNumber.trim()) {
            toast.error(idType === "NIC" ? "Please enter your NIC Number." : "Please enter your Passport Number.");
            return;
        }
        if (idType === "NIC" && !validateSriLankanNIC(idNumber.trim())) {
            toast.error("Invalid NIC format. Must be 9 digits with V/X or 12 digits.");
            return;
        }
        if (idType === "PASSPORT" && !validatePassport(idNumber.trim())) {
            toast.error("Invalid Passport format. Must be 6 to 15 alphanumeric characters.");
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

        // Construct 3-part address string to store in DB address field
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
            
            // 1. Call Register Endpoint
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

            // 2. Automatically Log in the newly registered guest in the background!
            const loginRes = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/customers/login",
                {
                    email: email.trim(),
                    password: password.trim()
                }
            );

            // 3. Save the JWT Token
            const token = loginRes.data.token;
            localStorage.setItem("customerToken", token);

            toast.success("Details saved successfully! Redirecting to payment...");

            // 4. Forward directly to payment screen with checkout state intact!
            navigate("/payment", {
                state: {
                    bookingData,
                    selectedRooms
                }
            });

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to register details. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-20 font-sans">
            
            {/* Header matches BookingSummary & RoomPayment exactly */}
            <div className="bg-white border-b border-stone-200 shadow-3xs">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-14">
                    <button
                        onClick={handleGoBack}
                        className="mb-3 flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-extrabold text-sm tracking-wide transition cursor-pointer"
                    >
                        <FaArrowLeft className="h-3.5 w-3.5" />
                        Back to Summary
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Guest Registration Details</h1>
                            <p className="mt-1 text-sm text-stone-500 font-semibold">Enter your checkout details to register your resort account</p>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-4 py-2 rounded-2xl self-start sm:self-center">
                            <img src={Logo} alt="BlueBird logo" className="w-8 h-8 object-contain" />
                            <div className="leading-tight">
                                <p className="text-[10px] font-black text-stone-850 uppercase tracking-widest leading-none">BlueBird</p>
                                <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest leading-none mt-1">Hotels & Resorts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page content - fits to full width max-w-7xl */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-14">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    
                    {/* Left Column: Form Details (lg:col-span-2) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)] space-y-7">
                            
                            {/* SECTION I: Personal Details */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-emerald-850 uppercase tracking-widest pb-1.5 border-b border-stone-150">I. Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            First Name <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Last Name <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="Last Name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Address */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Email Address <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="email"
                                                placeholder="Your Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Phone Number <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative w-28 shrink-0">
                                                <select
                                                    value={phoneCountry}
                                                    onChange={(e) => handlePhoneCountryChange(e.target.value)}
                                                    disabled={loading}
                                                    className="w-full pl-3 pr-7 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 appearance-none cursor-pointer"
                                                >
                                                    {countryCodeOptions.map((item) => (
                                                        <option key={item.value} value={item.value} className="bg-white text-stone-800">
                                                            {item.value} ({item.dialingCode})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</div>
                                            </div>
                                            <div className="relative flex-1">
                                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    disabled={loading}
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION II: Identity Verification */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-emerald-850 uppercase tracking-widest pb-1.5 border-b border-stone-150">II. Verification Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Identification Type */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Identification Type <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs z-10" />
                                            <select
                                                value={idType}
                                                onChange={(e) => {
                                                    setIdType(e.target.value);
                                                    setIdNumber("");
                                                }}
                                                disabled={loading || !isSriLankan}
                                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 appearance-none cursor-pointer disabled:opacity-80"
                                            >
                                                {isSriLankan && (
                                                    <option value="NIC" className="bg-white text-stone-800">National Identity Card (NIC)</option>
                                                )}
                                                <option value="PASSPORT" className="bg-white text-stone-800">Passport</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</div>
                                        </div>
                                    </div>

                                    {/* ID / Passport Number */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            {idType === "NIC" ? "NIC Number" : "Passport Number"} <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaIdCard className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                                                idNumber === "" ? "text-emerald-850" : idError ? "text-rose-600" : "text-emerald-600"
                                            }`} />
                                            <input
                                                type="text"
                                                placeholder={idType === "NIC" ? "e.g. 199912345678" : "e.g. N1234567"}
                                                value={idNumber}
                                                onChange={(e) => setIdNumber(e.target.value)}
                                                disabled={loading}
                                                className={`w-full pl-10 pr-3 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-4 transition text-xs text-stone-800 placeholder-stone-400 ${
                                                    idNumber === ""
                                                        ? "border-stone-200 focus:ring-emerald-500/10 focus:border-emerald-600"
                                                        : idError
                                                            ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500"
                                                            : "border-emerald-400 focus:ring-emerald-500/10 focus:border-emerald-500"
                                                }`}
                                            />
                                        </div>
                                        {idNumber !== "" && idError && (
                                            <p className="text-[10px] text-rose-600 font-semibold pl-1 animate-pulse">
                                                {idType === "NIC" 
                                                    ? "Format invalid (use 9 digits + V/X or 12 digits)." 
                                                    : "Passport invalid (6-15 alphanumeric characters only)."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION III: Address & Location */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-emerald-850 uppercase tracking-widest pb-1.5 border-b border-stone-150">III. Address & Location</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Address Line 1 */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Address Line 1 <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="Street Address, P.O. Box, or Company Name"
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Line 2 */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Address Line 2 <span className="text-stone-400 text-[8px]">(Optional)</span>
                                        </label>
                                        <div className="relative group">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="Apartment, Suite, Unit, Building, or Floor"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            City <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="City Name"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* ZIP / Postal Code */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            ZIP / Postal Code <span className="text-stone-400 text-[8px]">(Optional)</span>
                                        </label>
                                        <div className="relative group">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type="text"
                                                placeholder="ZIP / Postal Code"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Country <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs z-10" />
                                            <select
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                disabled={loading || isSriLankan}
                                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 appearance-none cursor-pointer disabled:opacity-80"
                                            >
                                                <option value="" className="bg-white text-stone-400">Select Country</option>
                                                {countryCodeOptions
                                                    .filter(item => !(!isSriLankan && item.value === "LK"))
                                                    .map((item) => (
                                                        <option key={item.value} value={item.countryName} className="bg-white text-stone-800">
                                                            {item.countryName}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION IV: Password Security */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-emerald-850 uppercase tracking-widest pb-1.5 border-b border-stone-150">IV. Security Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Password <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-12 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((curr) => !curr)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-800/85 hover:text-emerald-600 transition cursor-pointer"
                                            >
                                                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-stone-550 uppercase tracking-widest pl-1">
                                            Confirm Password <span className="text-emerald-700">*</span>
                                        </label>
                                        <div className="relative group">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800 text-xs" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-12 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition text-xs text-stone-800 placeholder-stone-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((curr) => !curr)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-800/85 hover:text-emerald-600 transition cursor-pointer"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Password guidelines */}
                                <div className="w-full bg-stone-50 p-3.5 rounded-2xl border border-stone-200/65 text-[10px] tracking-wide mt-4">
                                    <p className="text-stone-500 font-bold uppercase tracking-wider mb-2 text-[9px]">Password Guidelines</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                                        <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-700 font-bold" : "text-stone-450"}`}>
                                            <span className="text-[20px]">•</span> One uppercase letter
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? "text-emerald-700 font-bold" : "text-stone-450"}`}>
                                            <span className="text-[20px]">•</span> One lowercase letter
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? "text-emerald-700 font-bold" : "text-stone-450"}`}>
                                            <span className="text-[20px]">•</span> One number
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${/[@$!%*?&]/.test(password) ? "text-emerald-700 font-bold" : "text-stone-450"}`}>
                                            <span className="text-[20px]">•</span> One special char
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-700 font-bold" : "text-stone-450"}`}>
                                            <span className="text-[20px]">•</span> 8+ characters
                                        </div>
                                        {confirmPassword && (
                                            <div className={`flex items-center gap-1.5 col-span-2 sm:col-span-1 ${password === confirmPassword ? "text-emerald-700 font-bold" : "text-rose-600 font-semibold"}`}>
                                                <span className="text-[20px]">•</span> {password === confirmPassword ? "Passwords match" : "Match failed"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Checkout Summary (lg:col-span-1) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg space-y-6">
                            <h3 className="text-lg font-black text-stone-900 tracking-tight pb-3.5 border-b border-stone-200">Reservation Summary</h3>
                            
                            {/* Summary specs */}
                            <div className="space-y-3 pb-4 border-b border-stone-200 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-stone-500 font-semibold">Check-in Date:</span>
                                    <span className="font-bold text-stone-800">{checkIn ? checkIn.toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500 font-semibold">Check-out Date:</span>
                                    <span className="font-bold text-stone-800">{checkOut ? checkOut.toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500 font-semibold">Stay Duration:</span>
                                    <span className="font-bold text-stone-800">{nights} {nights === 1 ? "Night" : "Nights"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500 font-semibold">Total Guests:</span>
                                    <span className="font-bold text-emerald-850 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-xs">
                                        {totalAdults} Adults {totalKids > 0 ? `, ${totalKids} Kids` : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Rooms checklist list */}
                            <div className="space-y-3 pb-4 border-b border-stone-200">
                                <span className="text-xs uppercase font-extrabold tracking-widest text-stone-400 block pl-0.5">Configured Rooms</span>
                                {selectedRooms.map((room, index) => (
                                    <div key={room.frontendRoomId || index} className="flex justify-between text-xs py-1.5 px-3 bg-stone-50 border border-stone-200/50 rounded-xl font-medium">
                                        <span className="text-stone-700 font-semibold">Room {index + 1}: {room.packageName}</span>
                                        <span className="font-bold text-stone-900">${(room.pricePerNight * nights).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center bg-emerald-800 text-white p-4 rounded-2xl shadow-3xs">
                                    <span className="font-extrabold text-sm tracking-wide">Stay Total Cost:</span>
                                    <span className="text-2xl font-black">${Number(totalPrice || 0).toFixed(2)}</span>
                                </div>
                                
                                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex gap-2.5">
                                    <FaCheck className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                                    <div className="text-[11px] leading-tight text-emerald-800 font-semibold">
                                        You pay 50% advance (${(Number(totalPrice || 0) * 0.5).toFixed(2)}) on the next payment page to secure your luxury booking.
                                    </div>
                                </div>
                            </div>

                            {/* Confirmation CTA button inside sidebar */}
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleRegisterAndPayment}
                                className="w-full h-12 bg-emerald-800 hover:bg-emerald-950 text-white shadow-[0_4px_15px_rgba(6,95,70,0.12)] hover:shadow-[0_4px_22px_rgba(6,95,70,0.22)] rounded-xl font-extrabold text-xs tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer gap-2 group border border-emerald-900/10"
                            >
                                {loading ? "Registering..." : "Confirm & Proceed to Payment"}
                                {!loading && <FaArrowRight className="w-3.5 h-3.5 text-emerald-250 group-hover:translate-x-0.5 transition-transform" />}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
