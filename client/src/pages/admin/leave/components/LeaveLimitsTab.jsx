import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdSave, MdRefresh, MdShield, MdEdit, MdFilterList } from "react-icons/md";
import Loader from "../../../../components/Loader";

export default function LeaveLimitsTab() {
    const [roles, setRoles] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [limits, setLimits] = useState({}); // Key: "roleId-leaveTypeId", Value: maxDays
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedLeaveType, setSelectedLeaveType] = useState("");
    const [maxDays, setMaxDays] = useState("");

    // View state
    const [viewRole, setViewRole] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, typesRes, limitsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getAll-roles`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/leave/types`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/leave/role-limits`)
            ]);

            // Roles
            const rolesData = rolesRes.data || [];
            setRoles(rolesData);

            // Leave Types
            if (typesRes.data.success) {
                setLeaveTypes(typesRes.data.data);
            }

            // Map limits to a lookup object
            if (limitsRes.data.success) {
                const limitsMap = {};
                limitsRes.data.data.forEach((limit) => {
                    limitsMap[`${limit.roleId}-${limit.leaveTypeId}`] = limit.maxDays;
                });
                setLimits(limitsMap);
            }
        } catch (error) {
            console.error("Failed to fetch leave limits configuration:", error);
            toast.error(error?.response?.data?.message || "Failed to load limits configuration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Set initial values when roles/leaveTypes load
    useEffect(() => {
        if (roles.length > 0) {
            if (!selectedRole) setSelectedRole(roles[0].roleId.toString());
            if (!viewRole) setViewRole(roles[0].roleId.toString());
        }
    }, [roles, selectedRole, viewRole]);

    useEffect(() => {
        if (leaveTypes.length > 0 && !selectedLeaveType) {
            setSelectedLeaveType(leaveTypes[0].leaveTypeId.toString());
        }
    }, [leaveTypes, selectedLeaveType]);

    // Reactive form auto-fill based on selected role & leave type
    useEffect(() => {
        if (selectedRole && selectedLeaveType) {
            const key = `${selectedRole}-${selectedLeaveType}`;
            if (limits[key] !== undefined) {
                setMaxDays(limits[key]);
            } else {
                setMaxDays("0");
            }
        }
    }, [selectedRole, selectedLeaveType, limits]);

    const handleApplyLimit = async (e) => {
        e.preventDefault();
        if (!selectedRole || !selectedLeaveType) {
            toast.error("Please select a role and leave type");
            return;
        }

        setIsSubmitting(true);
        try {
            const days = maxDays === "" ? 0 : Math.max(0, parseInt(maxDays, 10) || 0);
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/leave/role-limits`, {
                limits: [
                    {
                        roleId: parseInt(selectedRole, 10),
                        leaveTypeId: parseInt(selectedLeaveType, 10),
                        maxDays: days
                    }
                ]
            });

            if (res.data.success) {
                toast.success("Leave limit updated successfully");
                await fetchData();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save leave limit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditLimit = (leaveTypeId, currentMaxDays) => {
        setSelectedRole(viewRole);
        setSelectedLeaveType(leaveTypeId.toString());
        setMaxDays(currentMaxDays.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Generate details list for the selected viewRole
    const activeViewRole = roles.find((r) => r.roleId.toString() === viewRole);
    const viewRoleName = activeViewRole ? activeViewRole.roleName : "";

    const viewRoleLimits = leaveTypes.map((type) => {
        const key = `${viewRole}-${type.leaveTypeId}`;
        const maxDays = limits[key] !== undefined ? limits[key] : 0;
        return {
            leaveTypeId: type.leaveTypeId,
            name: type.name,
            description: type.description,
            isPaid: type.isPaid,
            maxDays: maxDays
        };
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader />
            </div>
        );
    }

    if (roles.length === 0 || leaveTypes.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-fadeIn">
                No roles or leave types found to configure limits. Please create them first.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header section */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <MdShield className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">Role-Based Leave Limits</h2>
                        <p className="text-xs text-slate-500">Configure maximum leave days for each role and leave type</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/40"
                    title="Reload configuration"
                >
                    <MdRefresh className="text-xl" />
                </button>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Configuration Form Card */}
                <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">Configure Limit</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Select a role & leave type, and set allowed days.</p>
                    </div>

                    <form onSubmit={handleApplyLimit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Staff Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium text-slate-800 transition-all cursor-pointer"
                            >
                                {roles.map((r) => (
                                    <option key={r.roleId} value={r.roleId}>
                                        {r.roleName.charAt(0).toUpperCase() + r.roleName.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Leave Type
                            </label>
                            <select
                                value={selectedLeaveType}
                                onChange={(e) => setSelectedLeaveType(e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium text-slate-800 transition-all cursor-pointer"
                            >
                                {leaveTypes.map((t) => (
                                    <option key={t.leaveTypeId} value={t.leaveTypeId}>
                                        {t.name} ({t.isPaid ? "Paid" : "Unpaid"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Maximum Days
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={maxDays}
                                    onChange={(e) =>
                                        setMaxDays(
                                            e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10))
                                        )
                                    }
                                    className="w-full pl-3.5 pr-12 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 font-semibold text-slate-800 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                    days
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 flex justify-center items-center gap-2 mt-4"
                        >
                            <MdSave className="text-xl" />
                            <span>{isSubmitting ? "Applying..." : "Apply Limit"}</span>
                        </button>
                    </form>
                </div>

                {/* Configurations List Section */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Role Selector Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdFilterList className="text-slate-400 text-xl" />
                            <span className="font-semibold text-slate-700 text-sm">View Limits for Role:</span>
                        </div>
                        <select
                            value={viewRole}
                            onChange={(e) => setViewRole(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 text-sm font-semibold text-slate-750 cursor-pointer w-full sm:w-64"
                        >
                            {roles.map((r) => (
                                <option key={r.roleId} value={r.roleId}>
                                    {r.roleName.charAt(0).toUpperCase() + r.roleName.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Limits Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div className="p-4 bg-slate-50/50 border-b border-slate-200/60 flex justify-between items-center">
                            <h4 className="font-semibold text-slate-800 text-sm">
                                Allowed Leave Types for {viewRoleName.charAt(0).toUpperCase() + viewRoleName.slice(1)}
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                                {viewRoleLimits.length} total leave types
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/30 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Leave Type</th>
                                        <th className="p-4 font-semibold hidden md:table-cell">Description</th>
                                        <th className="p-4 font-semibold text-center">Allowed Days</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-750 text-sm">
                                    {viewRoleLimits.map((limit) => {
                                        return (
                                            <tr
                                                key={limit.leaveTypeId}
                                                className="hover:bg-slate-50/30 transition-colors h-16"
                                            >
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-900">
                                                                {limit.name}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                                    limit.isPaid
                                                                        ? "bg-emerald-100 text-emerald-800"
                                                                        : "bg-rose-100 text-rose-800"
                                                                }`}
                                                            >
                                                                {limit.isPaid ? "Paid" : "Unpaid"}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-slate-450 md:hidden mt-0.5">
                                                            {limit.description || "No description provided"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs hidden md:table-cell max-w-xs truncate">
                                                    {limit.description || "-"}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-block font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                                                        {limit.maxDays} days
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleEditLimit(limit.leaveTypeId, limit.maxDays)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Limit"
                                                        >
                                                            <MdEdit className="text-lg" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
