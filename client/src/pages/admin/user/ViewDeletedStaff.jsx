import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";
import axios from "axios";

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
        <>
            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Link
                        to="/admin/users"
                        className="text-gray-600 hover:text-gray-800 mb-4 inline-block"
                    >
                        ← Back to Staff Management
                    </Link>
                </div>

                <div className="mt-4 rounded-lg bg-white p-4 shadow-2xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold">Deleted Staff Members</h3>
                        <input
                            type="search"
                            placeholder="Search deleted staff..."
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deletedStaffMembers.map((member, index) => (
                                                <tr key={index}>
                                                    <td className="border-b p-4">{member.name}</td>
                                                    <td className="border-b p-4">{member.userName}</td>
                                                    <td className="border-b p-4">{member.email}</td>
                                                    <td className="border-b p-4">{member.roleName}</td>
                                                    <td className="border-b p-4">{member.phoneNumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {deletedStaffMembers.length > 0 ? (
                                        deletedStaffMembers.map((member, index) => (
                                            <div key={index} className="rounded-lg border bg-gray-50 p-4 shadow-sm">
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.userName}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                                                        <p><span className="font-semibold">Email:</span> {member.email}</p>
                                                        <p><span className="font-semibold">Role:</span> {member.roleName}</p>
                                                        <p><span className="font-semibold">Phone:</span> {member.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                                            No deleted staff members found.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}