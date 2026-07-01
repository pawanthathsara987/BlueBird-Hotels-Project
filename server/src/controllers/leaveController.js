import { LeaveType, LeaveRequest, StaffMember } from "../models/index.js";

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

export const createLeaveRequest = async (req, res) => {
    try {
        // Assume admin creates leave on behalf of employee
        const { staffId, leaveTypeId, startDate, endDate, totalDays, reason, status } = req.body;
        
        // Basic validation
        if (!staffId || !leaveTypeId || !startDate || !endDate || !totalDays) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
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

        await request.update({ staffId, leaveTypeId, startDate, endDate, totalDays, reason, status });
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
            request.approvedBy = approvedBy;
            request.approvedAt = new Date();
        }

        await request.save();
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
