import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdSave, MdRefresh, MdShield } from "react-icons/md";
import Loader from "../../../../components/Loader";

export default function LeaveLimitsTab() {
    const [roles, setRoles] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [limits, setLimits] = useState({}); // Key: "roleId-leaveTypeId", Value: maxDays
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            // Remove 'admin' role from leave limit editing if applicable, or keep all.
            // Keeping all is safer, but typically admins don't need leave tracking.
            // Let's list all roles.
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

    const handleLimitChange = (roleId, leaveTypeId, val) => {
        const key = `${roleId}-${leaveTypeId}`;
        // Enforce numeric values, default to 0 on empty/NaN
        const numVal = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
        setLimits((prev) => ({
            ...prev,
            [key]: numVal
        }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Prepare payload
            const limitsArray = [];
            roles.forEach((role) => {
                leaveTypes.forEach((type) => {
                    const key = `${role.roleId}-${type.leaveTypeId}`;
                    const maxDays = limits[key] === "" ? 0 : (limits[key] || 0);
                    limitsArray.push({
                        roleId: role.roleId,
                        leaveTypeId: type.leaveTypeId,
                        maxDays
                    });
                });
            });

            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/leave/role-limits`, {
                limits: limitsArray
            });

            if (res.data.success) {
                toast.success("Leave limits saved successfully");
                fetchData();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save leave limits");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Tab Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-2">
                    <MdShield className="text-blue-600 text-xl" />
                    <div>
                        <h2 className="font-semibold text-slate-800">Role-Based Leave Limits</h2>
                        <p className="text-xs text-slate-500">Configure maximum leave days for each role and leave type</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        title="Reload configuration"
                    >
                        <MdRefresh className="text-xl" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/30"
                    >
                        <MdSave className="text-xl" />
                        <span>{isSubmitting ? "Saving..." : "Save Limits"}</span>
                    </button>
                </div>
            </div>

            {/* Matrix Config Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {roles.length === 0 || leaveTypes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No roles or leave types found to configure limits.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm">
                                    <th className="p-4 font-semibold w-1/4">Staff Role</th>
                                    {leaveTypes.map((type) => (
                                        <th key={type.leaveTypeId} className="p-4 font-semibold text-center">
                                            {type.name}
                                            <span className="block text-[10px] font-normal text-slate-400">
                                                {type.isPaid ? "Paid" : "Unpaid"}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {roles.map((role) => (
                                    <tr key={role.roleId} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">
                                            {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                                        </td>
                                        {leaveTypes.map((type) => {
                                            const key = `${role.roleId}-${type.leaveTypeId}`;
                                            const value = limits[key] !== undefined ? limits[key] : "";
                                            return (
                                                <td key={type.leaveTypeId} className="p-4 text-center">
                                                    <div className="inline-flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleLimitChange(
                                                                    role.roleId,
                                                                    type.leaveTypeId,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-20 px-3 py-1.5 text-center border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-slate-800 shadow-sm"
                                                        />
                                                        <span className="text-xs text-slate-400">days</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
