import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteStaffModal from "../../../components/DeleteStaffModal";
import Loader from "../../../components/Loader";

export default function StaffManagement() {

    const [staffMembers, setStaffMembers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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

    return (
        <>
            <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold">Staff Management</h1>
                    <Link
                        to="/admin/users/addStaffMember"
                        className="w-full rounded-lg bg-blue-500 p-3 text-center text-white md:w-50"
                    >
                        + Add Staff
                    </Link>
                </div>

                <div className="mt-4 rounded-lg bg-white p-4 shadow-2xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold">Staff Members</h3>
                        <input
                            type="search"
                            placeholder="Search staff..."
                            className="w-full rounded-lg border p-2 sm:max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        {loading ? (
                            <Loader />
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full border-collapse">
                                        <thead className="border-b bg-gray-100">
                                            <tr>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">STAFF MEMBER</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">USERNAME</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">EMAIL</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">ROLE</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">PHONE</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-400">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffMembers.map((member, index) => (
                                                <tr key={index}>
                                                    <td className="border-b p-4">{member.name}</td>
                                                    <td className="border-b p-4">{member.userName}</td>
                                                    <td className="border-b p-4">{member.email}</td>
                                                    <td className="border-b p-4">{member.role}</td>
                                                    <td className="border-b p-4">{member.phoneNumber}</td>
                                                    <td className="border-b p-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    navigate("/admin/users/updateStaffMember", { state: { member } });
                                                                }}
                                                                className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-white"
                                                            >
                                                                <FaEdit /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteClick(member)}
                                                                className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-white"
                                                            >
                                                                <FaTrash /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {staffMembers.length > 0 ? (
                                        staffMembers.map((member, index) => (
                                            <div key={index} className="rounded-lg border bg-gray-50 p-4 shadow-sm">
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.userName}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                                                        <p><span className="font-semibold">Email:</span> {member.email}</p>
                                                        <p><span className="font-semibold">Role:</span> {member.role}</p>
                                                        <p><span className="font-semibold">Phone:</span> {member.phoneNumber}</p>
                                                    </div>

                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <button
                                                            onClick={() => {
                                                                navigate("/admin/users/updateStaffMember", { state: { member } });
                                                            }}
                                                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-white"
                                                        >
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteClick(member)}
                                                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-white"
                                                        >
                                                            <FaTrash /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                                            No staff members found.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteStaffModal
                isOpen={showDeleteModal}
                member={selectedMember}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}