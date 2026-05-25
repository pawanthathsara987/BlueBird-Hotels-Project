import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaPlus, FaHistory, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteStaffModal from "../../../components/DeleteStaffModal";
import StaffDetailsModal from "../../../components/StaffDetailsModal";
import Loader from "../../../components/Loader";

export default function StaffManagement() {
    const [staffMembers, setStaffMembers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    // Function to load staff members, with search term
    const loadStaffMembers = async () => {
        try {
            setLoading(true);
            let url = import.meta.env.VITE_BACKEND_URL + "/users/getAll";

            if (searchTerm.trim() !== "") {
                url = import.meta.env.VITE_BACKEND_URL + `/users/search/${searchTerm}`;
            }

            const res = await axios.get(url);
            setStaffMembers(res.data);
        } catch (err) {
            console.error("Error fetching staff members:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load staff members on component mount and whenever search term changes    
    useEffect(() => {
        loadStaffMembers();
    }, [searchTerm]);

    // Handlers for delete action
    const onDeleteClick = (member) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    // Handlers for delete modal actions    
    const onCancelDelete = () => {
        if (isDeleting) {
            return;
        }
        setShowDeleteModal(false);
        setSelectedMember(null);
    };

    // Handler for confirming deletion of a staff member
    const onConfirmDelete = async () => {
        if (!selectedMember || isDeleting) {
            return;
        }

        try {
            setIsDeleting(true);
            await axios.delete(import.meta.env.VITE_BACKEND_URL + "/users/delete/" + selectedMember.userId);
            toast.success("Staff member deleted successfully");
            setShowDeleteModal(false);
            setSelectedMember(null);
            loadStaffMembers();
        } catch (error) {
            toast.error("Failed to delete staff member");
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handlers for details popup view
    const onDetailsClick = (member) => {
        setSelectedMember(member);
        setShowDetailsModal(true);
    };

    const onCloseDetails = () => {
        setShowDetailsModal(false);
        setSelectedMember(null);
    };

    return (
        <>
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Directory</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage and view details of your system administrators and support staff.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/admin/users/viewDeletedStaff"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 transition-all duration-250 shadow-sm"
                        >
                            <FaHistory className="text-sm" /> View Deleted Staff
                        </Link>
                        <Link
                            to="/admin/users/addStaffMember"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 transition-all duration-250 shadow-md hover:shadow-lg active:scale-98"
                        >
                            <FaPlus className="text-sm" /> Add Staff Member
                        </Link>
                    </div>
                </div>

                {/* Table Container Card */}
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-100/80">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Active Staff Members</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Showing {staffMembers.length} records in total</p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="search"
                                placeholder="Search staff by name, email..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 pl-4 pr-10 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        {loading ? (
                            <div className="py-20">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">STAFF MEMBER</th>
                                                <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">USERNAME</th>
                                                <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">ROLE</th>
                                                <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">PHONE</th>
                                                <th className="pb-4 pt-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {staffMembers.length > 0 ? (
                                                staffMembers.map((member, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/70 transition-colors duration-150">
                                                        {/* Avatar and Name */}
                                                        <td className="py-4.5 pr-4">
                                                            <div className="flex items-center gap-3">
                                                                {member.imageUrl ? (
                                                                    <img
                                                                        src={member.imageUrl}
                                                                        alt={member.name}
                                                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-semibold ring-2 ring-slate-100">
                                                                        {member.name ? member.name.charAt(0).toUpperCase() : <FaUser className="text-xs" />}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 leading-none">{member.name}</p>
                                                                    <p className="text-xs text-slate-400 mt-1">{member.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4.5 text-sm font-medium text-slate-600">
                                                            @{member.userName}
                                                        </td>
                                                        <td className="py-4.5">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide capitalize ${
                                                                member.Role?.roleName === 'admin' 
                                                                    ? 'bg-red-50 text-red-600' 
                                                                    : member.Role?.roleName === 'manager' 
                                                                        ? 'bg-amber-50 text-amber-600' 
                                                                        : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                                {member.Role?.roleName || "Staff"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4.5 text-sm font-medium text-slate-500">
                                                            {member.phoneNumber}
                                                        </td>
                                                        <td className="py-4.5">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => onDetailsClick(member)}
                                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                                                                    title="View Details"
                                                                >
                                                                    <FaEye className="text-sm" /> Details
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        navigate("/admin/users/updateStaffMember", { state: { member } });
                                                                    }}
                                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-2 text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                                                                    title="Edit Staff Member"
                                                                >
                                                                    <FaEdit className="text-sm" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => onDeleteClick(member)}
                                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-3 py-2 text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                                                                    title="Delete Staff Member"
                                                                >
                                                                    <FaTrash className="text-sm" /> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                                                        No staff members found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Layout (Cards) */}
                                <div className="space-y-4 md:hidden">
                                    {staffMembers.length > 0 ? (
                                        staffMembers.map((member, index) => (
                                            <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm hover:shadow-md transition-all duration-200">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        {member.imageUrl ? (
                                                            <img
                                                                src={member.imageUrl}
                                                                alt={member.name}
                                                                className="w-12 h-12 rounded-xl object-cover shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-semibold text-lg">
                                                                {member.name ? member.name.charAt(0).toUpperCase() : <FaUser className="text-sm" />}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-base font-bold text-slate-800 leading-tight">{member.name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">@{member.userName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100/80 py-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                                                            <span className={`inline-block font-semibold mt-1 px-2 py-0.5 rounded-full capitalize text-[10px] ${
                                                                member.Role?.roleName === 'admin' 
                                                                    ? 'bg-red-50 text-red-600' 
                                                                    : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                                {member.Role?.roleName || "Staff"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                                            <p className="font-semibold text-slate-700 mt-1">{member.phoneNumber}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <button
                                                            onClick={() => onDetailsClick(member)}
                                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 text-xs transition-all duration-200 active:scale-98"
                                                        >
                                                            <FaEye /> Details
                                                        </button>
                                                        <div className="flex gap-2 w-full">
                                                            <button
                                                                onClick={() => {
                                                                    navigate("/admin/users/updateStaffMember", { state: { member } });
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2.5 text-xs transition-all duration-200 active:scale-98"
                                                            >
                                                                <FaEdit /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteClick(member)}
                                                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-4 py-2.5 text-xs transition-all duration-200 active:scale-98"
                                                            >
                                                                <FaTrash /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                                            No staff members found.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Popups & Modals */}
            <DeleteStaffModal
                isOpen={showDeleteModal}
                member={selectedMember}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
                isDeleting={isDeleting}
            />

            <StaffDetailsModal
                isOpen={showDetailsModal}
                member={selectedMember}
                onClose={onCloseDetails}
            />
        </>
    );
}