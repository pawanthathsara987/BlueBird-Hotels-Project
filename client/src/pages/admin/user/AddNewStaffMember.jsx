import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Select from "react-select";

export default function AddNewStaffMember() {

    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [roles, setRoles] = useState([]);
    const [role, setRole] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nicNumber, setNicNumber] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);

    const navigate = useNavigate();

    async function addMember() {
        if (loading) {
            return;
        }

        if (userName == "" || name == "" || email == "" || role == "" || phoneNumber == "") {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
                userName: userName,
                name: name,
                email: email,
                roleId: role,
                phoneNumber: phoneNumber,
                nicNumber: nicNumber,
                address: address,
                image: image
            });

            toast.success("Staff member added successfully");
            navigate("/admin/users");

        } catch (err) {
            toast.error("Failed to add staff member");
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        getRoles();
    }, []);

    async function getRoles() {
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/users/getAll-roles");
        setRoles(response.data);
    }


    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            <Link to="/admin/users" className="text-gray-600 hover:text-gray-800 mb-4 inline-block">
                ← Back
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Add Staff Member</h1>
                <p className="text-gray-500 mt-1">Fill in the details to register a new staff member</p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

                <div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
                    <div className="bg-[#4a6a8a] rounded-full p-3">
                        <FaUserCircle className="text-3xl text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">New Staff Registration</h2>
                        <p className="text-gray-300 text-sm">All fields are required</p>
                    </div>
                </div>

                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        disabled={loading}
                        placeholder="e.g. jsmith"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        placeholder="Full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        placeholder="staff@hotel.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="grid m-5 grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                            Role
                        </label>
                        <Select
                            options={roles.map(role => ({
                                value: role.roleId,
                                label: role.roleName
                            }))}
                            onChange={(selected) => setRole(selected.value)}

                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            maxMenuHeight={200}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={loading}
                            placeholder="+94 777 666 555"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="grid m-5 grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                            NIC Number
                        </label>
                        <input
                            type="text"
                            name="nicNumber"
                            value={nicNumber}
                            onChange={(e) => setNicNumber(e.target.value)}
                            disabled={loading}
                            placeholder="e.g. 199912345678"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={loading}
                            placeholder="Staff member address"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Staff Image
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        disabled={loading}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 m-5">
                    <Link
                        to="/admin/users"
                        onClick={(e) => {
                            if (loading) {
                                e.preventDefault();
                            }
                        }}
                        className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={addMember}
                        type="button"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "+ Add Staff Member"}
                    </button>
                </div>
            </div>
        </div>
    );
}