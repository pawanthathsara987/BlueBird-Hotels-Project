import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteStaffModal from "../../../components/DeleteStaffModal";

export default function StaffManagement() {

    const [staffMembers, setStaffMembers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadStaffMembers();
    }, []);

    const loadStaffMembers = () => {
        axios.get(import.meta.env.VITE_BACKEND_URL + "/users/getAll")
            .then((response) => {
                setStaffMembers(response.data);
            })
            .catch((error) => {
                console.error("Error fetching staff members:", error);
            });
    };

    const onDeleteClick = (member) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    const onCancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedMember(null);
    };

    const onConfirmDelete = async () => {
        try {
            await axios.delete(import.meta.env.VITE_BACKEND_URL + "/users/delete/" + selectedMember.userId);
            toast.success("Staff member deleted successfully");
            onCancelDelete();
            loadStaffMembers();
        } catch (error) {
            toast.error("Failed to delete staff member");
            console.error("Delete failed:", error);
        }
    };

    return (
        <>
            <div className="flex flex-row justify-between items-center p-5">
                <h1 className="p-5 text-2xl font-bold">Staff Management</h1>
                <Link
                    to="/admin/users/addStaffMember"
                    className="w-[200px] bg-blue-500 text-white p-2 rounded-lg text-center"
                >
                    + Add Staff
                </Link>
            </div>
            <div className="w-5xl flex flex-row mx-auto justify-between items-center p-5 shadow-2xl rounded-lg">
                <h3>Staff Members</h3>
                <input type="text" placeholder="Search staff..." className="w-[250px] border p-2 rounded-lg mb-4"
                    onChange={async (e) => {

                        const value = e.target.value;

                        try {

                            const response = await axios.get(
                                `${import.meta.env.VITE_BACKEND_URL}/users/search/${value}`
                            );

                            setStaffMembers(response.data);

                        } catch (error) {
                            console.error("Error fetching staff members:", error);
                        }
                    }}
                />
            </div>
            <div className="w-5xl mx-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">STAFF MEMBER</th>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">USERNAME</th>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">EMAIL</th>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">ROLE</th>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">PHONE</th>
                            <th className="text-left p-4 font-semibold text-gray-400 text-sm">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffMembers.map((member, index) => (
                            <tr key={index}>
                                <td className="p-4 border-b">{member.name}</td>
                                <td className="p-4 border-b">{member.userName}</td>
                                <td className="p-4 border-b">{member.email}</td>
                                <td className="p-4 border-b">{member.role}</td>
                                <td className="p-4 border-b">{member.phoneNumber}</td>
                                <td className="p-4 border-b">
                                    <div className="flex flex-row gap-2">
                                        <button
                                            onClick={() => {
                                                navigate("/admin/users/updateStaffMember", { state: { member } });
                                            }} className="bg-blue-500 text-white p-2 rounded-lg flex items-center gap-1">
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => onDeleteClick(member)}
                                            className="bg-red-500 text-white p-2 rounded-lg flex items-center gap-1">
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DeleteStaffModal
                isOpen={showDeleteModal}
                member={selectedMember}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
            />
        </>
    );
}