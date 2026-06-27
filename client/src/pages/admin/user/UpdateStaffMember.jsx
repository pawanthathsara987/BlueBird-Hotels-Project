import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaCamera, FaBriefcase } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Select from "react-select";
import { validateSriLankanNIC } from "../../../utils/validation";

export default function UpdateStaffMember() {

    const location = useLocation();

    const [userId, setUserId] = useState(location.state.member.userId);
    const [userName, setUserName] = useState(location.state.member.userName);
    const [name, setName] = useState(location.state.member.name);
    const [email, setEmail] = useState(location.state.member.email);
    const [role, setRole] = useState(location.state.member.roleId);
    const [roles, setRoles] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState(location.state.member.phoneNumber);
    const [nicNumber, setNicNumber] = useState(location.state.member.nicNumber || "");
    const [nicError, setNicError] = useState(!validateSriLankanNIC(location.state.member.nicNumber || ""));
    const [address, setAddress] = useState(location.state.member.address || "");
    const [imageUrl, setImageUrl] = useState(location.state.member.imageUrl || "");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getRoles();
    }, []);

    async function getRoles() {
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/users/getAll-roles");
        setRoles(response.data);
    }

    async function updateMember() {
        if (loading) {
            return;
        }

        if (userName == "" || name == "" || email == "" || role == "" || phoneNumber == "") {
            toast.error("Please fill in all fields");
            return;
        }

        if (nicNumber !== "" && !validateSriLankanNIC(nicNumber)) {
            toast.error("Please enter a valid NIC number");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("userName", userName);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("roleId", role);
            formData.append("phoneNumber", phoneNumber);
            formData.append("nicNumber", nicNumber);
            formData.append("address", address);
            if (image) {
                formData.append("image", image);
            } else {
                formData.append("imageUrl", imageUrl);
            }

            await axios.put(import.meta.env.VITE_BACKEND_URL + "/users/update/" + userId, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Staff member updated successfully");
            navigate("/admin/users");

        } catch (err) {
            toast.error("Failed to update staff member");
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            padding: "0.25rem",
            borderRadius: "0.75rem",
            borderColor: state.isFocused ? "#4f46e5" : "#cbd5e1",
            boxShadow: state.isFocused ? "0 0 0 4px rgba(79, 70, 229, 0.1)" : "none",
            backgroundColor: "#f8fafc",
            transition: "all 0.2s",
            "&:hover": {
                borderColor: state.isFocused ? "#4f46e5" : "#94a3b8"
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f1f5f9"
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#4f46e5" : state.isFocused ? "#f1f5f9" : "transparent",
            color: state.isSelected ? "#ffffff" : "#475569",
            "&:active": {
                backgroundColor: "#4f46e5",
                color: "#ffffff"
            }
        })
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen font-sans">

            <Link to="/admin/users" className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold text-sm">
                <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
                Back to Staff List
            </Link>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.06)] overflow-hidden border border-slate-100">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/15 p-3.5 rounded-2xl backdrop-blur-md shadow-inner">
                                <FaUserCircle className="text-4xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Edit Staff Member</h1>
                                <p className="text-indigo-100 text-sm mt-0.5">Editing: <span className="font-semibold text-white">{location.state.member.name}</span></p>
                            </div>
                        </div>
                        <div className="bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider self-start md:self-auto text-indigo-50">
                            Administrative Action
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Guidance */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Profile Image
                            </label>
                            
                            <div className="relative group cursor-pointer">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center relative transition-all duration-300 group-hover:scale-105">
                                    {image ? (
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Current"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                                            <FaUserCircle className="w-20 h-20 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 backdrop-blur-[2px]">
                                        <FaCamera className="text-xl" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Change Image</span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    disabled={loading}
                                />
                            </div>
                            
                            <p className="text-[11px] text-slate-400 mt-4 text-center leading-normal">
                                Recommend square aspect ratio.<br />PNG, JPG or WEBP up to 5MB.
                            </p>
                        </div>

                        {/* Visual guidance info box */}
                        <div className="p-5 bg-indigo-50/40 rounded-3xl border border-indigo-100/50 text-indigo-950/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Update Rules</h4>
                            <ul className="text-xs space-y-1.5 list-disc list-inside">
                                <li>Ensure unique details for username and email.</li>
                                <li>Select accurate access role.</li>
                                <li>Keep active details verified.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaUser className="text-slate-400 text-sm" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    disabled={loading}
                                    placeholder="e.g. jsmith"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaUser className="text-slate-400 text-sm" />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    placeholder="Full name"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <FaEnvelope className="text-slate-400 text-sm" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                placeholder="staff@hotel.com"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaBriefcase className="text-slate-400 text-sm" />
                                    Role
                                </label>
                                <Select
                                    options={roles.map(r => ({
                                        value: r.roleId,
                                        label: r.roleName
                                    }))}
                                    value={roles
                                        .map(r => ({
                                            value: r.roleId,
                                            label: r.roleName
                                        }))
                                        .find(option => option.value === role)
                                    }
                                    onChange={(selected) => setRole(selected.value)}
                                    styles={selectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    maxMenuHeight={200}
                                    isDisabled={loading}
                                    placeholder="Select a role..."
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaPhone className="text-slate-400 text-sm" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={loading}
                                    placeholder="+94 777 666 555"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NIC Number */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaIdCard className={`${nicNumber === "" ? "text-slate-400" : nicError ? "text-rose-400" : "text-emerald-400"} text-sm transition-colors`} />
                                    NIC Number
                                </label>
                                <input
                                    type="text"
                                    name="nicNumber"
                                    value={nicNumber}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNicNumber(val);
                                        setNicError(!validateSriLankanNIC(val));
                                    }}
                                    disabled={loading}
                                    placeholder="e.g. 199912345678"
                                    className={`w-full p-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                                        nicNumber === ""
                                            ? "border-slate-200 text-slate-700 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            : nicError
                                                ? "border-rose-400 text-rose-700 focus:ring-rose-500/10 focus:border-rose-500"
                                                : "border-emerald-400 text-emerald-700 focus:ring-emerald-500/10 focus:border-emerald-500"
                                    }`}
                                />
                                {nicNumber !== "" && nicError && (
                                    <p className="text-xs text-rose-500 font-semibold tracking-wide animate-pulse">
                                        Invalid format (use 9 digits + V/X or 12 digits).
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FaMapMarkerAlt className="text-slate-400 text-sm" />
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={loading}
                                    placeholder="Staff member address"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                            <Link
                                to="/admin/users"
                                onClick={(e) => {
                                    if (loading) {
                                        e.preventDefault();
                                    }
                                }}
                                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors rounded-xl hover:bg-slate-50 flex items-center justify-center"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={updateMember}
                                type="button"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? "Saving..." : "+ Update Staff Member"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}