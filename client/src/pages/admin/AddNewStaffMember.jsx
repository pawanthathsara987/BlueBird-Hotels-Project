import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function AddNewStaffMember() {

    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const navigate = useNavigate();

    async function addMember() {
        if (userName == "" || name == "" || email == "" || role == "" || phoneNumber == "") {
            toast.error("Please fill in all fields");
            return;
        }

        try {

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
                userName: userName,
                name: name,
                email: email,
                role: role,
                phoneNumber: phoneNumber,
            });

            toast.success("Staff member added successfully");
            navigate("/admin/users");

        } catch (err) {
            toast.error("Failed to add staff member");
            console.error(err);
            return;
        }

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


            {/* Form Card */}
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
                    <div className="bg-[#4a6a8a] rounded-full p-3">
                        <FaUserCircle className="text-3xl text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">New Staff Registration</h2>
                        <p className="text-gray-300 text-sm">All fields are required</p>
                    </div>
                </div>

                {/* Username */}
                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. jsmith"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Name */}
                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Email Address */}
                <div className="m-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@hotel.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role and Phone Number */}
                <div className="grid m-5 grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                            Role
                        </label>
                        <select
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Select a role...</option>
                            <option value="staff_member">Staff Member</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
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
                            placeholder="+94 777 666 555"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 m-5">
                    <Link
                        to="/admin/users"
                        className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={addMember}
                        type="button"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        + Add Staff Member
                    </button>
                </div>
            </div>
        </div>
    );
}