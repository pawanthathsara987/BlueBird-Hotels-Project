import { LeaveType, LeaveRequest, StaffMember, RoleLeaveLimit, Role, Attendance } from "../models/index.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

// ================= Leave Type Controllers =================

export const getAllLeaveTypes = async (req, res) => {
    try {
        const leaveTypes = await LeaveType.findAll();
        res.status(200).json({ success: true, data: leaveTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createLeaveType = async (req, res) => {
    try {
        const { name, description, isPaid } = req.body;
        const leaveType = await LeaveType.create({ name, description, isPaid });
        res.status(201).json({ success: true, data: leaveType });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isPaid } = req.body;
        const leaveType = await LeaveType.findByPk(id);
        if (!leaveType) {
            return res.status(404).json({ success: false, message: "Leave Type not found" });
        }
        await leaveType.update({ name, description, isPaid });
        res.status(200).json({ success: true, data: leaveType });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const leaveType = await LeaveType.findByPk(id);
        if (!leaveType) {
            return res.status(404).json({ success: false, message: "Leave Type not found" });
        }
        await leaveType.destroy();
        res.status(200).json({ success: true, message: "Leave Type deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= Leave Request Controllers =================

export const getAllLeaveRequests = async (req, res) => {
    try {
        const { staffId, status } = req.query;
        const whereClause = {};
        if (staffId) whereClause.staffId = staffId;
        if (status) whereClause.status = status;

        const requests = await LeaveRequest.findAll({
            where: whereClause,
            include: [
                { model: LeaveType, as: "leaveType" },
                { model: StaffMember, as: "staffMember", attributes: ["name", "email", "staffId"] },
                { model: StaffMember, as: "approver", attributes: ["name", "email", "staffId"] }
            ],
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= Leave Limit Validation Helper =================
const validateLeaveLimit = async (staffId, leaveTypeId, totalDays, excludeLeaveId = null) => {
    // 1. Get staff member's role
    const staff = await StaffMember.findOne({
        where: { staffId },
        include: [{ model: Role }]
    });

    if (!staff) {
        throw new Error("Staff member not found");
    }

    const roleId = staff.roleId;

    // 2. Check if a limit is configured for this role and leave type
    const limit = await RoleLeaveLimit.findOne({
        where: { roleId, leaveTypeId }
    });

    // If no limit is configured, we assume no limit (defaulting to unlimited is standard unless set)
    if (!limit) {
        return { valid: true };
    }

    const maxDays = limit.maxDays;

    // 3. Calculate total approved leave days in the current calendar year
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const whereClause = {
        staffId,
        leaveTypeId,
        status: "Approved",
        startDate: {
            [Op.between]: [startOfYear, endOfYear]
        }
    };

    if (excludeLeaveId) {
        whereClause.leaveId = {
            [Op.ne]: excludeLeaveId
        };
    }

    const approvedLeaves = await LeaveRequest.findAll({
        where: whereClause
    });

    const totalApprovedDays = approvedLeaves.reduce((sum, req) => sum + req.totalDays, 0);

    if (totalApprovedDays + totalDays > maxDays) {
        const leaveType = await LeaveType.findByPk(leaveTypeId);
        return {
            valid: false,
            message: `Leave limit exceeded. This staff member has already used ${totalApprovedDays} of ${maxDays} allowed days for '${leaveType?.name || 'this leave type'}' in ${currentYear}.`
        };
    }

    return { valid: true };
};

// Helper to sync leave request status to attendance records in real time
const syncLeaveToAttendance = async (leaveRequest) => {
    try {
        const { staffId, startDate, endDate, status } = leaveRequest;

        // Generate list of dates in range
        const dates = [];
        let current = dayjs(startDate);
        const last = dayjs(endDate);
        while (current.isBefore(last) || current.isSame(last, "day")) {
            dates.push(current.format("YYYY-MM-DD"));
            current = current.add(1, "day");
        }

        if (status === "Approved") {
            for (const date of dates) {
                const [record, created] = await Attendance.findOrCreate({
                    where: { staffId, attendanceDate: date },
                    defaults: {
                        staffId,
                        attendanceDate: date,
                        status: "On Leave",
                        attendanceMethod: "QR",
                        remarks: "Automatically marked on leave (Leave Request Approved)"
                    }
                });

                // If the record already existed, we only update it if it is "Absent"
                if (!created && record.status === "Absent") {
                    record.status = "On Leave";
                    record.remarks = "Automatically marked on leave (Leave Request Approved)";
                    await record.save();
                }
            }
        } else if (["Rejected", "Cancelled", "Pending"].includes(status)) {
            // Revert "On Leave" records for these dates
            for (const date of dates) {
                const record = await Attendance.findOne({
                    where: { staffId, attendanceDate: date }
                });

                if (record && record.status === "On Leave") {
                    const today = dayjs().format("YYYY-MM-DD");
                    // If it is a future date, delete it entirely to clean up reports
                    if (dayjs(date).isAfter(dayjs(today))) {
                        await record.destroy();
                    } else {
                        // If it is today or past date, revert to "Absent"
                        record.status = "Absent";
                        record.remarks = "Marked absent (Leave Request Cancelled/Rejected)";
                        await record.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to sync leave request to attendance:", error);
    }
};

export const createLeaveRequest = async (req, res) => {
    try {
        // Assume admin creates leave on behalf of employee
        const { staffId, leaveTypeId, startDate, endDate, totalDays, reason, status } = req.body;

        // Basic validation
        if (!staffId || !leaveTypeId || !startDate || !endDate || !totalDays) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Limit validation (only validate if status is Approved or Pending)
        if (status === "Approved" || !status || status === "Pending") {
            const validation = await validateLeaveLimit(staffId, leaveTypeId, Number(totalDays));
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
        }

        const request = await LeaveRequest.create({
            staffId,
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason,
            status: status || "Pending"
        });

        // Sync with attendance table
        await syncLeaveToAttendance(request);

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId, leaveTypeId, startDate, endDate, totalDays, reason, status } = req.body;

        const request = await LeaveRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Leave Request not found" });
        }

        // Store original data to clean up previous sync state
        const originalRequest = request.toJSON();

        // Limit validation
        const targetStatus = status || request.status;
        if (targetStatus === "Approved" || targetStatus === "Pending") {
            const validation = await validateLeaveLimit(
                staffId || request.staffId,
                leaveTypeId || request.leaveTypeId,
                Number(totalDays || request.totalDays),
                id
            );
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
        }

        // Revert previous attendance records for old dates
        await syncLeaveToAttendance({ ...originalRequest, status: "Cancelled" });

        await request.update({ staffId, leaveTypeId, startDate, endDate, totalDays, reason, status });

        // Apply new attendance records for new dates/status
        await syncLeaveToAttendance(request);

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await LeaveRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Leave Request not found" });
        }

        // Clean up attendance logs before deleting the request
        await syncLeaveToAttendance({ ...request.toJSON(), status: "Cancelled" });

        await request.destroy();
        res.status(200).json({ success: true, message: "Leave Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy } = req.body; // approvedBy is Admin's staffId

        if (!["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const request = await LeaveRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Leave Request not found" });
        }

        request.status = status;
        if (status === "Approved" || status === "Rejected") {
            // Limit validation on approval
            if (status === "Approved") {
                const validation = await validateLeaveLimit(request.staffId, request.leaveTypeId, request.totalDays, id);
                if (!validation.valid) {
                    return res.status(400).json({ success: false, message: validation.message });
                }
            }
            request.approvedBy = approvedBy;
            request.approvedAt = new Date();
        }

        await request.save();

        // Sync with attendance table
        await syncLeaveToAttendance(request);

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= Role Leave Limit Controllers =================

export const getRoleLeaveLimits = async (req, res) => {
    try {
        const limits = await RoleLeaveLimit.findAll({
            include: [
                { model: Role, as: "role", attributes: ["roleName"] },
                { model: LeaveType, as: "leaveType", attributes: ["name"] }
            ]
        });
        res.status(200).json({ success: true, data: limits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRoleLeaveLimits = async (req, res) => {
    try {
        const { limits } = req.body; // Array of { roleId, leaveTypeId, maxDays }
        if (!Array.isArray(limits)) {
            return res.status(400).json({ success: false, message: "Limits must be an array" });
        }

        for (const item of limits) {
            const { roleId, leaveTypeId, maxDays } = item;
            if (roleId && leaveTypeId !== undefined && maxDays !== undefined) {
                await RoleLeaveLimit.upsert({
                    roleId,
                    leaveTypeId,
                    maxDays: Number(maxDays)
                });
            }
        }

        res.status(200).json({ success: true, message: "Role leave limits updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
