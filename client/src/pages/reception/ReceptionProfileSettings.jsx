import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FaUserCircle, FaUser, FaEnvelope, FaPhone, FaIdCard,
    FaMapMarkerAlt, FaLock, FaCamera, FaSpinner, FaShieldAlt,
    FaCheckCircle, FaEye, FaEyeSlash
} from "react-icons/fa";
import { MdBadge } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import { validateSriLankanNIC } from "../../utils/validation";
import Loader from "../../components/Loader";

export default function ReceptionProfileSettings() {
    const [userId, setUserId] = useState(null);
    const [staffId, setStaffId] = useState("");
    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nicNumber, setNicNumber] = useState("");
    const [address, setAddress] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [roleId, setRoleId] = useState(null);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Dynamic theme state synchronized with Dashboard customizer
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("saas_dashboard_theme");
            return saved ? JSON.parse(saved) : {
                mode: "light",
                accent: "indigo",
                cardStyle: "sleek",
                font: "sans"
            };
        } catch {
            return {
                mode: "light",
                accent: "indigo",
                cardStyle: "sleek",
                font: "sans"
            };
        }
    });

    useEffect(() => {
        const updateTheme = () => {
            const saved = localStorage.getItem("saas_dashboard_theme");
            if (saved) setTheme(JSON.parse(saved));
        };
        window.addEventListener("theme_changed", updateTheme);
        window.addEventListener("storage", updateTheme);
        return () => {
            window.removeEventListener("theme_changed", updateTheme);
            window.removeEventListener("storage", updateTheme);
        };
    }, []);

    const accentColors = {
        indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600 hover:bg-indigo-750", bgLight: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-100 dark:border-indigo-900/50", focusRing: "focus:ring-indigo-500/20 focus:border-indigo-500" },
        emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600 hover:bg-emerald-750", bgLight: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900/50", focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500" },
        violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-600 hover:bg-violet-750", bgLight: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-900/50", focusRing: "focus:ring-violet-500/20 focus:border-violet-500" },
        amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-600 hover:bg-amber-750", bgLight: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-900/50", focusRing: "focus:ring-amber-500/20 focus:border-amber-500" },
        rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600 hover:bg-rose-750", bgLight: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-900/50", focusRing: "focus:ring-rose-500/20 focus:border-rose-500" },
        slate: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-700 hover:bg-slate-800", bgLight: "bg-slate-100 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-800", focusRing: "focus:ring-slate-500/20 focus:border-slate-500" },
    };

    const currentAccent = accentColors[theme.accent] || accentColors.indigo;

    const getCardStyle = () => {
        let style = "p-6 transition-all duration-300 relative overflow-hidden ";
        if (theme.cardStyle === "sleek") {
            style += "shadow-xs border " + (theme.mode === "dark" ? "bg-slate-900 border-slate-800/80 text-slate-100" : "bg-white border-slate-100 text-slate-800") + " rounded-2xl ";
        } else if (theme.cardStyle === "bordered") {
            style += "border shadow-none " + (theme.mode === "dark" ? "bg-slate-900 border-slate-850 text-slate-100" : "bg-white border-slate-200/85 text-slate-800") + " rounded-xl ";
        } else if (theme.cardStyle === "glass") {
            style += "backdrop-blur-md shadow-lg border " + (theme.mode === "dark" ? "bg-slate-950/70 border-slate-800/40 text-slate-100" : "bg-white/70 border-white/20 text-slate-800") + " rounded-3xl ";
        }
        return style;
    };

    useEffect(() => {
        const fetchReceptionProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required");
                setLoading(false);
                return;
            }
            try {
                const decoded = jwtDecode(token);
                const currentUserId = decoded.id;
                setUserId(currentUserId);

                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getAll`);
                const receptionData = res.data.find((user) => user.userId === currentUserId);

                if (receptionData) {
                    setStaffId(receptionData.staffId || "");
                    setName(receptionData.name || "");
                    setUserName(receptionData.userName || "");
                    setEmail(receptionData.email || "");
                    setPhoneNumber(receptionData.phoneNumber || "");
                    setNicNumber(receptionData.nicNumber || "");
                    setAddress(receptionData.address || "");
                    setImageUrl(receptionData.imageUrl || "");
                    setImagePreview(receptionData.imageUrl || "");
                    setRoleId(receptionData.roleId);
                } else {
                    toast.error("Could not load profile details");
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to fetch reception profile");
            } finally {
                setLoading(false);
            }
        };
        fetchReceptionProfile();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!name.trim() || !userName.trim() || !email.trim() || !phoneNumber.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (nicNumber.trim() && !validateSriLankanNIC(nicNumber)) {
            toast.error("Please enter a valid Sri Lankan NIC number");
            return;
        }

        try {
            setSavingProfile(true);
            const formData = new FormData();
            formData.append("name", name);
            formData.append("userName", userName);
            formData.append("email", email);
            formData.append("phoneNumber", phoneNumber);
            formData.append("nicNumber", nicNumber);
            formData.append("address", address);
            formData.append("roleId", roleId);

            if (imageFile) {
                formData.append("image", imageFile);
            } else {
                formData.append("imageUrl", imageUrl);
            }

            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/users/update/${userId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Keep the reception page sidebar in sync by updating the local storage user object
            const updatedImageUrl = imageFile ? imagePreview : imageUrl;
            const storedUser = localStorage.getItem("user");
            const userObj = storedUser ? JSON.parse(storedUser) : {};
            userObj.name = name;
            userObj.email = email;
            if (updatedImageUrl) {
                userObj.imageUrl = updatedImageUrl;
            }
            localStorage.setItem("user", JSON.stringify(userObj));

            toast.success("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 800);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword === currentPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        try {
            setSavingPassword(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/change-password`, {
                email,
                currentPassword,
                newPassword
            });
            toast.success("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    const getInitials = (n) =>
        n ? n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "RP";

    if (loading) {
        return (
            <div className={`min-h-[80vh] flex items-center justify-center ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50/50 text-slate-900"}`}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={`w-full py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${theme.mode === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50/50 text-slate-900"}`}>
            <div className="max-w-5xl mx-auto px-4">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className={`text-2xl font-extrabold tracking-tight ${theme.mode === "dark" ? "text-slate-100" : "text-slate-800"}`}>Profile Settings</h1>
                    <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Manage your personal info, avatar, and security credentials.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ─── Left Column: Profile Card ─── */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Avatar Card */}
                        <div className={getCardStyle() + " flex flex-col items-center"}>
                            {/* Avatar */}
                            <div className="relative group cursor-pointer mb-4">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className={`w-28 h-28 rounded-full object-cover border-4 shadow-lg ${theme.mode === "dark" ? "border-slate-800 ring-2 ring-slate-800/40" : "border-white ring-2 ring-blue-50"}`}
                                    />
                                ) : (
                                    <div className={`w-28 h-28 rounded-full border-4 shadow-lg flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-tr from-blue-600 to-indigo-600 ${theme.mode === "dark" ? "border-slate-800 ring-2 ring-slate-800/40" : "border-white ring-2 ring-blue-50"}`}>
                                        {getInitials(name)}
                                    </div>
                                )}
                                <label className={`absolute bottom-1 right-1 p-2 text-white rounded-full cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all duration-200 ${currentAccent.bg}`}>
                                    <FaCamera className="text-xs" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <h2 className={`text-lg font-bold ${theme.mode === "dark" ? "text-slate-100" : "text-slate-800"}`}>{name || "Receptionist"}</h2>
                            <span className={`text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mt-1 ${theme.mode === "dark" ? "text-teal-400 bg-teal-500/10 border border-teal-500/20" : "text-emerald-700 bg-emerald-50 border border-emerald-100"}`}>
                                Receptionist
                            </span>

                            <div className={`w-full mt-5 pt-5 border-t space-y-3 ${theme.mode === "dark" ? "border-slate-800/60" : "border-slate-100"}`}>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.mode === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                        <MdBadge className={theme.mode === "dark" ? "text-slate-400" : "text-slate-500"} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-medium uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-550" : "text-slate-400"}`}>Staff ID</p>
                                        <p className={`text-xs font-bold font-mono ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>{staffId || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.mode === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                        <FaUser className={`text-xs ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-medium uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-550" : "text-slate-400"}`}>Username</p>
                                        <p className={`text-xs font-bold truncate ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>@{userName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.mode === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                        <FaEnvelope className={`text-xs ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-medium uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-550" : "text-slate-400"}`}>Email</p>
                                        <p className={`text-xs font-bold truncate ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>{email}</p>
                                    </div>
                                </div>
                                {phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.mode === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                            <FaPhone className={`text-xs ${theme.mode === "dark" ? "text-slate-400" : "text-slate-500"}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[10px] font-medium uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-550" : "text-slate-400"}`}>Phone</p>
                                            <p className={`text-xs font-bold ${theme.mode === "dark" ? "text-slate-300" : "text-slate-700"}`}>{phoneNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Column: Tabs + Forms ─── */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Tab Bar */}
                        <div className={`flex gap-2 p-1.5 border transition-colors ${theme.mode === "dark" ? "bg-slate-900 border-slate-800/80" : "bg-white border-slate-100"} rounded-2xl shadow-xs`}>
                            <button
                                id="tab-personal-details"
                                onClick={() => setActiveTab("profile")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    activeTab === "profile"
                                        ? `${currentAccent.bg} text-white shadow-md`
                                        : `${theme.mode === "dark" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" : "text-slate-550 hover:text-slate-700 hover:bg-slate-50"}`
                                }`}
                            >
                                <FaUser className="text-xs" />
                                <span>Personal Details</span>
                            </button>
                            <button
                                id="tab-security"
                                onClick={() => setActiveTab("security")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    activeTab === "security"
                                        ? `${currentAccent.bg} text-white shadow-md`
                                        : `${theme.mode === "dark" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" : "text-slate-550 hover:text-slate-700 hover:bg-slate-50"}`
                                }`}
                            >
                                <FaShieldAlt className="text-xs" />
                                <span>Security</span>
                            </button>
                        </div>

                        {/* ── Profile Form ── */}
                        {activeTab === "profile" && (
                            <div className={getCardStyle()}>
                                <h3 className={`text-base font-bold mb-5 pb-3 border-b ${theme.mode === "dark" ? "border-slate-800/60" : "border-slate-100"}`}>
                                    Personal Information
                                </h3>
                                <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-500"}`}>Full Name <span className="text-rose-450">*</span></label>
                                            <div className="relative">
                                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-full-name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Full name"
                                                    required
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-455" : "text-slate-500"}`}>Username</label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-xs font-bold">@</span>
                                                <input
                                                    id="input-username"
                                                    type="text"
                                                    value={userName}
                                                    disabled
                                                    placeholder="username"
                                                    className={`w-full pl-8 pr-4 py-3 border rounded-xl cursor-not-allowed opacity-70 text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-900/50 border-slate-850 text-slate-550"
                                                        : "bg-slate-100 border-slate-200 text-slate-500"
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>Email Address <span className="text-rose-455">*</span></label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="reception@bluebird.com"
                                                    required
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>Phone Number <span className="text-rose-455">*</span></label>
                                            <div className="relative">
                                                <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-phone"
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="07X XXX XXXX"
                                                    required
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* NIC */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>NIC Number</label>
                                            <div className="relative">
                                                <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-nic"
                                                    type="text"
                                                    value={nicNumber}
                                                    onChange={(e) => setNicNumber(e.target.value)}
                                                    placeholder="199912345678 or 991234567V"
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>Address</label>
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                                                <textarea
                                                    id="input-address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Full postal address"
                                                    rows="3"
                                                    className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm resize-none ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            id="btn-save-profile"
                                            type="submit"
                                            disabled={savingProfile}
                                            className={`inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${currentAccent.bg}`}
                                        >
                                            {savingProfile
                                                ? <FaSpinner className="animate-spin" />
                                                : <FaCheckCircle />
                                            }
                                            <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── Security / Password Form ── */}
                        {activeTab === "security" && (
                            <div className={getCardStyle()}>
                                <h3 className={`text-base font-bold mb-2 pb-3 border-b ${theme.mode === "dark" ? "border-slate-800/60" : "border-slate-100"}`}>
                                    Change Password
                                </h3>
                                <p className={`text-xs mb-5 ${theme.mode === "dark" ? "text-slate-450" : "text-slate-400"}`}>
                                    Choose a strong password with at least 6 characters, including letters and numbers.
                                </p>

                                <form id="security-form" onSubmit={handleChangePassword} className="space-y-5">
                                    {/* Current Password */}
                                    <div className="space-y-1.5">
                                        <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>Current Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                            <input
                                                id="input-current-password"
                                                type={showCurrentPw ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Your current password"
                                                required
                                                className={`w-full pl-9 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                    theme.mode === "dark"
                                                    ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPw((v) => !v)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPw ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* New Password */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>New Password</label>
                                            <div className="relative">
                                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-new-password"
                                                    type={showNewPw ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="New password"
                                                    required
                                                    className={`w-full pl-9 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        theme.mode === "dark"
                                                        ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPw((v) => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showNewPw ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-bold uppercase tracking-wider ${theme.mode === "dark" ? "text-slate-450" : "text-slate-550"}`}>Confirm New Password</label>
                                            <div className="relative">
                                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-confirm-password"
                                                    type={showConfirmPw ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    required
                                                    className={`w-full pl-9 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                                                        confirmPassword && newPassword !== confirmPassword
                                                            ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-400"
                                                            : theme.mode === "dark"
                                                            ? "bg-slate-950 border-slate-850 text-slate-200 placeholder-slate-600 focus:ring-slate-800/40 focus:border-slate-700"
                                                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 " + currentAccent.focusRing
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPw((v) => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPw ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                                </button>
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-rose-500 font-medium">Passwords don't match</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Strength hint */}
                                    {newPassword && (
                                        <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg ${theme.mode === "dark" ? "bg-slate-800/40 text-slate-400" : "bg-slate-50 text-slate-400"}`}>
                                            <FaShieldAlt className={`text-sm ${newPassword.length >= 8 ? "text-emerald-500" : "text-amber-400"}`} />
                                            <span>
                                                {newPassword.length < 6
                                                    ? "Password is too short (min 6 chars)"
                                                    : newPassword.length < 8
                                                    ? "Acceptable — consider making it longer"
                                                    : "Good password strength"}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            id="btn-update-password"
                                            type="submit"
                                            disabled={savingPassword}
                                            className={`inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${currentAccent.bg}`}
                                        >
                                            {savingPassword
                                                ? <FaSpinner className="animate-spin" />
                                                : <FaShieldAlt />
                                            }
                                            <span>{savingPassword ? "Updating..." : "Update Password"}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
