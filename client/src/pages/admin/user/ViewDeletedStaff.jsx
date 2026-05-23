import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";
import axios from "axios";
import { FaArrowLeft, FaSearch, FaUserMinus } from "react-icons/fa";

export default function ViewDeletedStaff() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [deletedStaffMembers, setDeletedStaffMembers] = useState([]);

    async function fetchDeletedStaff() {
        try {
            setLoading(true);
            let url = import.meta.env.VITE_BACKEND_URL + "/users/getAll-deleted";

            if (searchTerm.trim() !== "") {
                url = import.meta.env.VITE_BACKEND_URL + `/users/search-deleted/${searchTerm}`;
            }

            const res = await axios.get(url);
            console.log("Deleted staff members fetched:", res.data);
            setDeletedStaffMembers(res.data);

        } catch (error) {
            console.error("Error fetching deleted staff members:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDeletedStaff();
    }, [searchTerm]);

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
            <div className="flex flex-col gap-4">
                <Link
                    to="/admin/users"
                    className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 font-semibold text-sm"
                >
                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
                    Back to Staff Management
                </Link>
            </div>

            <div className="rounded-3xl bg-white shadow-[0_20px_50px_rgba(8,112,184,0.05)] overflow-hidden border border-slate-100">
                {/* Banner Header */}
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-600/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/15 p-3.5 rounded-2xl backdrop-blur-md shadow-inner">
                                <FaUserMinus className="text-3xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Staff Archives</h1>
                                <p className="text-rose-100 text-sm mt-0.5">View and manage records of previously deleted staff members.</p>
                            </div>
                        </div>
                        <div className="bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider self-start md:self-auto text-rose-50">
                            Read-Only Logs
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Toolbar / Search */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Archived Members</h3>
                            <p className="text-slate-400 text-xs mt-0.5">Total archived records: {deletedStaffMembers.length}</p>
                        </div>
                        
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaSearch className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search archives..."
                                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden overflow-x-auto md:block border border-slate-100 rounded-2xl bg-white">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                            <tr>
                                                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Staff Member</th>
                                                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Username</th>
                                                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Email Address</th>
                                                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                                                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Phone Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deletedStaffMembers.length > 0 ? (
                                                deletedStaffMembers.map((member, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                                                        <td className="p-4 text-sm font-semibold text-slate-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-xs border border-rose-100">
                                                                    {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                                                                </div>
                                                                {member.name}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-600 font-medium">@{member.userName}</td>
                                                        <td className="p-4 text-sm text-slate-500">{member.email}</td>
                                                        <td className="p-4 text-sm">
                                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200/50">
                                                                {member.roleName || "Staff"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-500 font-medium">{member.phoneNumber}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4 border border-slate-100">
                                                                <FaUserMinus className="text-3xl" />
                                                            </div>
                                                            <h3 className="text-slate-700 font-bold text-base">No archived staff found</h3>
                                                            <p className="text-slate-400 text-xs mt-1 max-w-xs">There are currently no staff member records matching your search queries.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="space-y-4 md:hidden">
                                    {deletedStaffMembers.length > 0 ? (
                                        deletedStaffMembers.map((member, index) => (
                                            <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-sm border border-rose-100">
                                                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">@{member.userName}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-600 border-t border-slate-50 pt-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-400 w-16">Email:</span>
                                                        <span className="truncate">{member.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-400 w-16">Role:</span>
                                                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/50 scale-95 origin-left">
                                                            {member.roleName || "Staff"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-400 w-16">Phone:</span>
                                                        <span>{member.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                                            <FaUserMinus className="text-2xl text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs font-semibold text-slate-500">No archived staff found.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}