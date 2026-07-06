import { useState, useEffect } from "react";
import { getAttendanceSettings, updateAttendanceSettings, getRoleAttendanceSettings, updateRoleAttendanceSettings } from "../../../utils/attendanceService";
import { Save, RefreshCw, ShieldAlert, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AttendanceSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roleLoading, setRoleLoading] = useState(true);
    const [savingRoles, setSavingRoles] = useState(false);
    const [roleSchedules, setRoleSchedules] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");

    // Form inputs state mapped by key
    const [formValues, setFormValues] = useState({
        OFFICE_START_TIME: "",
        OFFICE_END_TIME: "",
        GRACE_PERIOD: "",
        STANDARD_WORKING_HOURS: "",
        QR_SCAN_COOLDOWN: "",
        AUTO_MARK_ABSENT: false,
        ATTENDANCE_ENABLED: false,
        ALLOW_MANUAL_EDIT: false,
    });

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await getAttendanceSettings();
            if (response.data?.success) {
                const settingsData = response.data.data || [];
                setSettings(settingsData);
                
                // Map array to key-value state
                const mappedValues = {};
                settingsData.forEach(setting => {
                    if (setting.settingKey === "AUTO_MARK_ABSENT" || 
                        setting.settingKey === "ATTENDANCE_ENABLED" || 
                        setting.settingKey === "ALLOW_MANUAL_EDIT") {
                        mappedValues[setting.settingKey] = setting.settingValue === "true";
                    } else {
                        mappedValues[setting.settingKey] = setting.settingValue;
                    }
                });
                setFormValues(prev => ({ ...prev, ...mappedValues }));
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Failed to load attendance settings");
        } finally {
            setLoading(false);
        }
    };

    const loadRoleSchedules = async () => {
        try {
            setRoleLoading(true);
            const response = await getRoleAttendanceSettings();
            if (response.data?.success) {
                const schedules = response.data.data || [];
                setRoleSchedules(schedules);
                if (!selectedRoleId && schedules.length > 0) {
                    setSelectedRoleId(String(schedules[0].roleId));
                }
            }
        } catch (error) {
            console.error("Failed to load role schedules:", error);
            toast.error("Failed to load role schedules");
        } finally {
            setRoleLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
        loadRoleSchedules();
    }, []);

    const handleChange = (key, value) => {
        setFormValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleRoleChange = (roleId, key, value) => {
        setRoleSchedules(prev => prev.map(role => {
            if (role.roleId !== roleId) {
                return role;
            }

            return {
                ...role,
                [key]: value
            };
        }));
    };

    const selectedRoleSchedule = roleSchedules.find(role => String(role.roleId) === String(selectedRoleId)) || null;

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            // Format state back to array of key-values
            const payload = Object.keys(formValues).map(key => {
                let val = formValues[key];
                if (typeof val === "boolean") {
                    val = val ? "true" : "false";
                }
                return {
                    settingKey: key,
                    settingValue: String(val)
                };
            });

            const response = await updateAttendanceSettings(payload);
            if (response.data?.success) {
                toast.success("Attendance settings saved successfully!");
                loadSettings();
            } else {
                toast.error(response.data?.message || "Failed to update settings");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("An error occurred while saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRoleSchedules = async (e) => {
        e.preventDefault();
        try {
            setSavingRoles(true);

            const payload = roleSchedules.map(role => ({
                roleId: role.roleId,
                officeStartTime: role.officeStartTime,
                officeEndTime: role.officeEndTime,
                gracePeriodMinutes: role.gracePeriodMinutes === null || role.gracePeriodMinutes === "" ? null : Number(role.gracePeriodMinutes),
                standardWorkingHours: role.standardWorkingHours === null || role.standardWorkingHours === "" ? null : Number(role.standardWorkingHours)
            }));

            const response = await updateRoleAttendanceSettings(payload);
            if (response.data?.success) {
                toast.success("Role schedules saved successfully!");
                loadRoleSchedules();
            } else {
                toast.error(response.data?.message || "Failed to save role schedules");
            }
        } catch (error) {
            console.error("Failed to save role schedules:", error);
            toast.error("An error occurred while saving role schedules");
        } finally {
            setSavingRoles(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-slate-500 font-semibold">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-sans">
            <form onSubmit={handleSave} className="space-y-6">
                {/* Operational Settings Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <ShieldAlert className="text-indigo-500 w-5 h-5" /> Operational Limits & Policies
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">QR Scan Cooldown (Minutes)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={formValues.QR_SCAN_COOLDOWN}
                                    onChange={(e) => handleChange("QR_SCAN_COOLDOWN", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700 transition"
                                    required
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Wait threshold required between consecutive check-in and check-out scans.</span>
                            </div>

                            {/* Switches */}
                            <div className="divide-y divide-slate-100 pt-2">
                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700">Attendance Enabled</h4>
                                        <p className="text-[11px] text-slate-400">Enable or disable QR attendance scanning entirely</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange("ATTENDANCE_ENABLED", !formValues.ATTENDANCE_ENABLED)}
                                        className="text-slate-500 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        {formValues.ATTENDANCE_ENABLED ? (
                                            <ToggleRight className="w-12 h-12 text-blue-600" />
                                        ) : (
                                            <ToggleLeft className="w-12 h-12 text-slate-300" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700">Allow Manual Edit</h4>
                                        <p className="text-[11px] text-slate-400">Allow administrators to update times manually</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange("ALLOW_MANUAL_EDIT", !formValues.ALLOW_MANUAL_EDIT)}
                                        className="text-slate-500 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        {formValues.ALLOW_MANUAL_EDIT ? (
                                            <ToggleRight className="w-12 h-12 text-blue-600" />
                                        ) : (
                                            <ToggleLeft className="w-12 h-12 text-slate-300" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700">Auto-Mark Absent</h4>
                                        <p className="text-[11px] text-slate-400">Enable automatic absent flags for missing staff</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange("AUTO_MARK_ABSENT", !formValues.AUTO_MARK_ABSENT)}
                                        className="text-slate-500 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        {formValues.AUTO_MARK_ABSENT ? (
                                            <ToggleRight className="w-12 h-12 text-blue-600" />
                                        ) : (
                                            <ToggleLeft className="w-12 h-12 text-slate-300" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" /> Saving Settings...
                            </>
                        ) : (
                            <>
                                <Save size={16} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            <form onSubmit={handleSaveRoleSchedules} className="mt-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Clock className="text-emerald-500 w-5 h-5" /> Role Work Schedule
                    </h3>

                    {roleLoading ? (
                        <div className="flex items-center justify-center py-8 text-slate-500">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading role schedules...
                        </div>
                    ) : roleSchedules.length === 0 ? (
                        <p className="text-sm text-slate-500">No roles were found.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Role</label>
                                <select
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-700 transition bg-white"
                                    required
                                >
                                    <option value="" disabled>
                                        Choose a role...
                                    </option>
                                    {roleSchedules.map(role => (
                                        <option key={role.roleId} value={role.roleId}>
                                            {role.roleName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!selectedRoleSchedule ? (
                                <p className="text-sm text-slate-500">Select a role to edit its schedule.</p>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{selectedRoleSchedule.roleName} Shift Schedule</h4>
                                            <p className="text-[11px] text-slate-400">Configure shift settings directly for this role.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={selectedRoleSchedule.officeStartTime !== null && selectedRoleSchedule.officeStartTime !== undefined ? selectedRoleSchedule.officeStartTime : (formValues.OFFICE_START_TIME || "08:00")}
                                                onChange={(e) => handleRoleChange(selectedRoleSchedule.roleId, "officeStartTime", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-700 transition"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={selectedRoleSchedule.officeEndTime !== null && selectedRoleSchedule.officeEndTime !== undefined ? selectedRoleSchedule.officeEndTime : (formValues.OFFICE_END_TIME || "17:00")}
                                                onChange={(e) => handleRoleChange(selectedRoleSchedule.roleId, "officeEndTime", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-700 transition"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Grace Period (Minutes)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={selectedRoleSchedule.gracePeriodMinutes !== null && selectedRoleSchedule.gracePeriodMinutes !== undefined ? selectedRoleSchedule.gracePeriodMinutes : (formValues.GRACE_PERIOD || "10")}
                                                onChange={(e) => handleRoleChange(selectedRoleSchedule.roleId, "gracePeriodMinutes", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-700 transition"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={savingRoles || roleLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none"
                    >
                        {savingRoles ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" /> Saving Role Schedules...
                            </>
                        ) : (
                            <>
                                <Save size={16} /> Save Role Schedules
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
