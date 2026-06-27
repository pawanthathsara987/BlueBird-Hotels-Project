import { FaTimes, FaUser, FaEnvelope, FaShieldAlt, FaPhone, FaIdCard, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";

export default function StaffDetailsModal({ isOpen, member, onClose }) {
    if (!isOpen || !member) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Header Cover / Gradient */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-all duration-200 backdrop-blur-sm shadow-md"
                        aria-label="Close"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Profile Photo / Avatar overlap */}
                <div className="flex flex-col items-center -mt-16 pb-4">
                    <div className="relative">
                        {member.imageUrl ? (
                            <img
                                src={member.imageUrl}
                                alt={member.name}
                                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center border-4 border-white shadow-2xl text-slate-500 font-bold text-4xl">
                                {member.name ? member.name.charAt(0).toUpperCase() : <FaUser className="text-slate-400" />}
                            </div>
                        )}
                        <span className="absolute -bottom-2 right-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white border-2 border-white shadow-md">
                            Active
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-800 tracking-tight">{member.name}</h2>
                    <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1.5 shadow-sm">
                        {member.Role?.roleName || "Staff"}
                    </span>
                </div>

                {/* Details Section */}
                <div className="px-8 pb-8 pt-2 space-y-4 overflow-y-auto flex-1">
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Information Details
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Username */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                    <FaUser className="text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Username</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate">@{member.userName}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200 sm:col-span-2">
                                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                    <FaEnvelope className="text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{member.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                    <FaPhone className="text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{member.phoneNumber}</p>
                                </div>
                            </div>

                            {/* NIC Number */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200">
                                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                    <FaIdCard className="text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NIC Number</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{member.nicNumber || "-"}</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all duration-200 sm:col-span-2">
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 mt-0.5">
                                    <FaMapMarkerAlt className="text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Address</p>
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed break-words whitespace-pre-line">{member.address || "No address provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 px-8 py-4 flex justify-end border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
