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

export default function AdminProfileSettings() {
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

    useEffect(() => {
        const fetchAdminProfile = async () => {
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
                const adminData = res.data.find((user) => user.userId === currentUserId);

                if (adminData) {
                    setStaffId(adminData.staffId || "");
                    setName(adminData.name || "");
                    setUserName(adminData.userName || "");
                    setEmail(adminData.email || "");
                    setPhoneNumber(adminData.phoneNumber || "");
                    setNicNumber(adminData.nicNumber || "");
                    setAddress(adminData.address || "");
                    setImageUrl(adminData.imageUrl || "");
                    setImagePreview(adminData.imageUrl || "");
                    setRoleId(adminData.roleId);
                } else {
                    toast.error("Could not load profile details");
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to fetch admin profile");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminProfile();
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

            localStorage.setItem("adminName", name);
            localStorage.setItem("adminEmail", email);
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
        n ? n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "AD";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profile Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your personal info, avatar, and security credentials.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ─── Left Column: Profile Card ─── */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Avatar Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                            {/* Avatar */}
                            <div className="relative group cursor-pointer mb-4">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-100"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-lg ring-2 ring-blue-100 flex items-center justify-center text-white text-3xl font-bold">
                                        {getInitials(name)}
                                    </div>
                                )}
                                <label className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all duration-200">
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

                            <h2 className="text-lg font-bold text-slate-800">{name || "Administrator"}</h2>
                            <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full mt-1">
                                System Administrator
                            </span>

                            <div className="w-full mt-5 pt-5 border-t border-slate-50 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <MdBadge className="text-slate-500 text-sm" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Staff ID</p>
                                        <p className="text-xs font-bold text-slate-700 font-mono">{staffId || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FaUser className="text-slate-500 text-xs" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Username</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">@{userName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FaEnvelope className="text-slate-500 text-xs" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">{email}</p>
                                    </div>
                                </div>
                                {phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <FaPhone className="text-slate-500 text-xs" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Phone</p>
                                            <p className="text-xs font-bold text-slate-700">{phoneNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Column: Tabs + Forms ─── */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Tab Bar */}
                        <div className="flex gap-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5">
                            <button
                                id="tab-personal-details"
                                onClick={() => setActiveTab("profile")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    activeTab === "profile"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <FaUser className="text-xs" />
                                <span>Personal Details</span>
                            </button>
                            <button
                                id="tab-security"
                                onClick={() => setActiveTab("security")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    activeTab === "security"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <FaShieldAlt className="text-xs" />
                                <span>Security</span>
                            </button>
                        </div>

                        {/* ── Profile Form ── */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-base font-bold text-slate-800 mb-5 pb-3 border-b border-slate-50">
                                    Personal Information
                                </h3>
                                <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-full-name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Full name"
                                                    required
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                                                <input
                                                    id="input-username"
                                                    type="text"
                                                    value={userName}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                    placeholder="username"
                                                    required
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="admin@bluebird.com"
                                                    required
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-phone"
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="07X XXX XXXX"
                                                    required
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* NIC */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIC Number</label>
                                            <div className="relative">
                                                <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-nic"
                                                    type="text"
                                                    value={nicNumber}
                                                    onChange={(e) => setNicNumber(e.target.value)}
                                                    placeholder="199912345678 or 991234567V"
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                                                <textarea
                                                    id="input-address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Full postal address"
                                                    rows="3"
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            id="btn-save-profile"
                                            type="submit"
                                            disabled={savingProfile}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-base font-bold text-slate-800 mb-2 pb-3 border-b border-slate-50">
                                    Change Password
                                </h3>
                                <p className="text-xs text-slate-400 mb-5">
                                    Choose a strong password with at least 6 characters, including letters and numbers.
                                </p>

                                <form id="security-form" onSubmit={handleChangePassword} className="space-y-5">
                                    {/* Current Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                            <input
                                                id="input-current-password"
                                                type={showCurrentPw ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Your current password"
                                                required
                                                className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
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
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                                            <div className="relative">
                                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-new-password"
                                                    type={showNewPw ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="New password"
                                                    required
                                                    className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm text-slate-700 placeholder-slate-400"
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
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                                            <div className="relative">
                                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    id="input-confirm-password"
                                                    type={showConfirmPw ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    required
                                                    className={`w-full pl-9 pr-10 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm text-slate-700 placeholder-slate-400 ${
                                                        confirmPassword && newPassword !== confirmPassword
                                                            ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-400"
                                                            : "border-slate-200 focus:ring-blue-500/10 focus:border-blue-400"
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
                                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-2.5 rounded-lg">
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
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
