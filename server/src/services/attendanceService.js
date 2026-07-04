import StaffMember from "../models/User/StaffMember.js";
import Role from "../models/User/Role.js";
import Attendance from "../models/attendance/Attendance.js";
import AttendanceEditLog from "../models/attendance/AttendanceEditLog.js";
import AttendanceSetting from "../models/attendance/AttendanceSetting.js";
import LeaveRequest from "../models/leave/LeaveRequest.js";
import dayjs from "dayjs";
import crypto from "crypto";
import { Op } from "sequelize";

const DEFAULT_OFFICE_START_TIME = "08:00";
const DEFAULT_OFFICE_END_TIME = "17:00";
const DEFAULT_GRACE_PERIOD = 10;

const parseTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") {
        return null;
    }

    const [hour, minute] = timeString.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return null;
    }

    return { hour, minute };
};

const buildDateTime = (referenceDate, timeString) => {
    const parsed = parseTime(timeString);
    if (!parsed) {
        return null;
    }

    return dayjs(referenceDate)
        .hour(parsed.hour)
        .minute(parsed.minute)
        .second(0)
        .millisecond(0);
};

const buildShiftWindow = (referenceDate, startTime, endTime) => {
    const start = buildDateTime(referenceDate, startTime);
    let end = buildDateTime(referenceDate, endTime);

    if (start && end && !end.isAfter(start)) {
        end = end.add(1, "day");
    }

    return { start, end };
};

const normalizeRoleSchedule = async (role) => {
    const globalSettings = await getSettingsMap();

    return {
        officeStartTime: role?.officeStartTime || globalSettings.OFFICE_START_TIME || DEFAULT_OFFICE_START_TIME,
        officeEndTime: role?.officeEndTime || globalSettings.OFFICE_END_TIME || DEFAULT_OFFICE_END_TIME,
        gracePeriodMinutes: role?.gracePeriodMinutes ?? Number(globalSettings.GRACE_PERIOD ?? DEFAULT_GRACE_PERIOD),
        standardWorkingHours: role?.standardWorkingHours ?? Number(globalSettings.STANDARD_WORKING_HOURS ?? 8)
    };
};

const getRoleScheduleForStaff = async (staff) => {
    const role = staff?.Role || (staff?.roleId ? await Role.findByPk(staff.roleId) : null);
    return normalizeRoleSchedule(role);
};

export const getSetting = async (key, defaultValue) => {
    const setting = await AttendanceSetting.findOne({ where: { settingKey: key } });
    return setting ? setting.settingValue : defaultValue;
};

export const getSettingsMap = async () => {
    const settings = await AttendanceSetting.findAll();
    const map = {};
    settings.forEach(s => {
        map[s.settingKey] = s.settingValue;
    });
    return map;
};

export const getAttendanceSettings = async () => {
    const settings = await AttendanceSetting.findAll();
    return {
        success: true,
        data: settings
    };
};

export const updateAttendanceSettings = async (settingsArray) => {
    if (!Array.isArray(settingsArray)) {
        throw new Error("Invalid settings payload");
    }

    for (const item of settingsArray) {
        const { settingKey, settingValue } = item;
        const setting = await AttendanceSetting.findOne({ where: { settingKey } });
        if (setting) {
            setting.settingValue = String(settingValue);
            await setting.save();
        }
    }

    const updatedSettings = await AttendanceSetting.findAll();
    return {
        success: true,
        message: "Settings updated successfully",
        data: updatedSettings
    };
};


export const scanAttendance = async (data) => {
    const { signature, ...payload } = data;
    const { staffId, type, version } = payload;

    const orderedPayload = {
        staffId: payload.staffId,
        type: payload.type,
        version: payload.version !== undefined ? Number(payload.version) : undefined
    };

    const expectedSignature = crypto
        .createHmac("sha256", process.env.QR_SECRET || "default_qr_secret_key_123456")
        .update(JSON.stringify(orderedPayload))
        .digest("hex");

    if (signature !== expectedSignature) {
        throw new Error("Invalid QR Code signature. Verification failed.");
    }

    if (type !== "attendance") {
        throw new Error("Invalid QR Code");
    }

    if (version !== 1) {
        throw new Error("Unsupported QR Version");
    }

    const enabled = (await getSetting("ATTENDANCE_ENABLED", "true")) === "true";
    if (!enabled) {
        throw new Error("Attendance scanning is currently disabled.");
    }

    const staff = await StaffMember.findOne({
        where: {
            staffId
        },
        include: [
            {
                model: Role
            }
        ]
    });

    if (!staff) {
        throw new Error("Staff member not found.");
    }

    const today = dayjs().format("YYYY-MM-DD");

    let attendance = await Attendance.findOne({
        where: {
            staffId,
            attendanceDate: today
        }
    });

    if (attendance && attendance.status === "Absent") {
        return {
            success: false,
            message: "Staff member is marked as Absent today.",
            staffName: staff.name,
            staff
        };
    }

    if (!attendance) {
        const now = dayjs();
        const roleSchedule = await getRoleScheduleForStaff(staff);
        const { start: officeStart, end: officeEnd } = buildShiftWindow(today, roleSchedule.officeStartTime, roleSchedule.officeEndTime);
        const gracePeriodMins = Number(roleSchedule.gracePeriodMinutes || 0);

        if (officeEnd && now.isAfter(officeEnd)) {
            return {
                success: false,
                message: `Check-in window closed for ${staff.Role?.roleName || "this role"} today.`,
                staffName: staff.name,
                staff
            };
        }

        const officeStartWithGrace = officeStart ? officeStart.add(gracePeriodMins, "minute") : null;

        let lateMinutes = 0;
        let status = "Present";

        if (officeStartWithGrace && now.isAfter(officeStartWithGrace)) {
            lateMinutes = now.diff(officeStart, "minute");
            status = "Late";
        }

        // First Scan (Check-In)
        attendance = await Attendance.create({
            staffId,
            attendanceDate: today,
            checkInTime: new Date(),
            lateMinutes,
            status,
            attendanceMethod: "QR"
        });

        return {
            success: true,
            action: "CHECK_IN",
            message: `Check-In Successful. Welcome ${staff.name}`,
            staffName: staff.name,
            staff,
            attendance
        };
    }

    // Second Scan (Check-Out)
    if (attendance.checkOutTime === null) {
        // Cooldown check
        const now = dayjs();
        const checkIn = dayjs(attendance.checkInTime);
        const cooldownMins = parseInt(await getSetting("QR_SCAN_COOLDOWN", "3"), 10);

        if (now.diff(checkIn, "minute") < cooldownMins) {
            return {
                success: false,
                message: `Scan cooldown active. Please wait at least ${cooldownMins} minutes since your check-in.`,
                staffName: staff.name,
                staff
            };
        }

        attendance.checkOutTime = new Date();

        // Calculate Worked Time
        const workingMinutes = now.diff(checkIn, "minute");

        attendance.workingMinutes = workingMinutes;
        attendance.workingHours = Number((workingMinutes / 60).toFixed(2));

        await attendance.save();

        return {
            success: true,
            action: "CHECK_OUT",
            message: `Check-Out Successful. Goodbye ${staff.name}`,
            staffName: staff.name,
            staff,
            attendance
        };
    }

    // Third Scan (Attendance Completed)
    return {
        success: false,
        message: "Attendance already completed today.",
        staffName: staff.name,
        staff
    };
};

export const getAttendanceRecords = async (query) => {
    const { search, status, date, startDate, endDate, page = 1, limit = 10 } = query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    // Date filters
    if (date) {
        whereClause.attendanceDate = date;
    } else if (startDate && endDate) {
        whereClause.attendanceDate = {
            [Op.between]: [startDate, endDate]
        };
    } else if (startDate) {
        whereClause.attendanceDate = {
            [Op.gte]: startDate
        };
    } else if (endDate) {
        whereClause.attendanceDate = {
            [Op.lte]: endDate
        };
    }

    // Status filter
    if (status && status !== "All") {
        whereClause.status = status;
    }

    // Staff query include
    const staffInclude = {
        model: StaffMember,
        attributes: ["name"]
    };

    if (search) {
        staffInclude.where = {
            [Op.or]: [
                { staffId: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } }
            ]
        };
    }

    const { count, rows } = await Attendance.findAndCountAll({
        where: whereClause,
        include: [staffInclude],
        limit: parseInt(limit),
        offset: offset,
        order: [
            ["attendanceDate", "DESC"],
            ["checkInTime", "DESC"]
        ]
    });

    const allMatching = await Attendance.findAll({
        where: whereClause,
        include: [staffInclude]
    });
    const totalWorkingHours = allMatching.reduce((sum, row) => sum + (row.workingHours || 0), 0);

    return {
        success: true,
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalWorkingHours: Number(totalWorkingHours.toFixed(2))
    };
};

export const getRoleAttendanceSettings = async () => {
    const roles = await Role.findAll({
        order: [["roleName", "ASC"]]
    });

    return {
        success: true,
        data: roles
    };
};

export const updateRoleAttendanceSettings = async (rolesArray) => {
    if (!Array.isArray(rolesArray)) {
        throw new Error("Invalid role settings payload");
    }

    for (const item of rolesArray) {
        const { roleId, officeStartTime, officeEndTime, gracePeriodMinutes, standardWorkingHours } = item;
        if (!roleId) {
            continue;
        }

        const role = await Role.findByPk(roleId);
        if (!role) {
            continue;
        }

        role.officeStartTime = officeStartTime || null;
        role.officeEndTime = officeEndTime || null;
        role.gracePeriodMinutes = gracePeriodMinutes === "" || gracePeriodMinutes === null || gracePeriodMinutes === undefined
            ? null
            : Number(gracePeriodMinutes);
        role.standardWorkingHours = standardWorkingHours === "" || standardWorkingHours === null || standardWorkingHours === undefined
            ? null
            : Number(standardWorkingHours);

        await role.save();
    }

    const updatedRoles = await Role.findAll({ order: [["roleName", "ASC"]] });

    return {
        success: true,
        message: "Role schedules updated successfully",
        data: updatedRoles
    };
};

export const getDailyAttendanceStats = async () => {
    const today = dayjs().format("YYYY-MM-DD");

    const totalStaff = await StaffMember.count();

    const staffMembers = await StaffMember.findAll({
        include: [{ model: Role }]
    });

    const logs = await Attendance.findAll({
        where: {
            attendanceDate: today
        },
        include: [{
            model: StaffMember,
            attributes: ["name"]
        }],
        order: [["checkInTime", "DESC"]]
    });

    const presentCount = logs.filter(l => l.status === "Present").length;
    const lateCount = logs.filter(l => l.status === "Late").length;
    const onLeaveCount = logs.filter(l => l.status === "On Leave").length;
    const checkedInCount = logs.filter(l => l.status === "Present" || l.status === "Late").length;

    const staffWithRecords = new Set(logs.map(log => log.staffId));
    const missingStaff = staffMembers.filter(staff => !staffWithRecords.has(staff.staffId));
    let absentCount = logs.filter(l => l.status === "Absent").length;

    for (const staff of missingStaff) {
        const roleSchedule = await getRoleScheduleForStaff(staff);
        const { end: officeEnd } = buildShiftWindow(today, roleSchedule.officeStartTime, roleSchedule.officeEndTime);

        if (!officeEnd || dayjs().isAfter(officeEnd)) {
            absentCount += 1;
        }
    }

    const attendanceRate = totalStaff > 0
        ? Math.round((checkedInCount / totalStaff) * 100)
        : 0;

    return {
        success: true,
        data: {
            date: today,
            totalStaff,
            presentCount,
            lateCount,
            onLeaveCount,
            absentCount,
            checkedInCount,
            attendanceRate,
            recentLogs: logs.filter(l => l.status !== "Absent").slice(0, 5)
        }
    };
};

export const getAttendanceById = async (attendanceId) => {
    const attendance = await Attendance.findOne({
        where: { attendanceId },
        include: [
            {
                model: StaffMember,
                attributes: ["name", "staffId"]
            },
            {
                model: AttendanceEditLog,
                as: "editLogs"
            }
        ],
        order: [
            [{ model: AttendanceEditLog, as: "editLogs" }, "editedAt", "DESC"]
        ]
    });

    if (!attendance) {
        throw new Error("Attendance record not found");
    }

    return {
        success: true,
        data: attendance
    };
};

export const updateAttendance = async (attendanceId, data) => {
    const { checkInTime, checkOutTime, reason, editedBy } = data;

    const allowManualEdit = (await getSetting("ALLOW_MANUAL_EDIT", "true")) === "true";
    if (!allowManualEdit) {
        throw new Error("Manual editing of attendance records is disabled in system settings.");
    }

    if (!reason || reason.trim() === "") {
        throw new Error("Reason is required.");
    }

    if (!checkInTime && !checkOutTime) {
        throw new Error("Check-In and Check-Out times cannot both be empty.");
    }

    if (checkInTime && checkOutTime) {
        const inTime = dayjs(checkInTime);
        const outTime = dayjs(checkOutTime);
        if (!outTime.isAfter(inTime)) {
            throw new Error("Check-out time must be after check-in time.");
        }
    }

    const attendance = await Attendance.findOne({
        where: { attendanceId }
    });

    if (!attendance) {
        throw new Error("Attendance record not found.");
    }

    // Log the edit
    await AttendanceEditLog.create({
        attendanceId,
        oldCheckIn: attendance.checkInTime,
        newCheckIn: checkInTime ? new Date(checkInTime) : null,
        oldCheckOut: attendance.checkOutTime,
        newCheckOut: checkOutTime ? new Date(checkOutTime) : null,
        reason: reason.trim(),
        editedBy: editedBy || "Admin"
    });

    // Update times
    attendance.checkInTime = checkInTime ? new Date(checkInTime) : null;
    attendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;

    // Recalculate Late Minutes and Status based on Check-In Time
    if (attendance.checkInTime) {
        const checkIn = dayjs(attendance.checkInTime);
        const startTimeStr = await getSetting("OFFICE_START_TIME", "08:00");
        const [startHour, startMinute] = startTimeStr.split(":").map(Number);
        const officeStart = dayjs(attendance.attendanceDate).hour(startHour).minute(startMinute).second(0).millisecond(0);
        
        const gracePeriodMins = parseInt(await getSetting("GRACE_PERIOD", "10"), 10);
        const officeStartWithGrace = officeStart.add(gracePeriodMins, "minute");

        if (checkIn.isAfter(officeStartWithGrace)) {
            attendance.lateMinutes = checkIn.diff(officeStart, "minute");
            attendance.status = "Late";
        } else {
            attendance.lateMinutes = 0;
            attendance.status = "Present";
        }
    } else {
        attendance.lateMinutes = 0;
        attendance.status = "Present";
    }

    // Recalculate Working Time
    if (attendance.checkInTime && attendance.checkOutTime) {
        const checkIn = dayjs(attendance.checkInTime);
        const checkOut = dayjs(attendance.checkOutTime);
        const workingMinutes = checkOut.diff(checkIn, "minute");

        attendance.workingMinutes = workingMinutes;
        attendance.workingHours = Number((workingMinutes / 60).toFixed(2));
    } else {
        attendance.workingMinutes = 0;
        attendance.workingHours = 0;
    }

    await attendance.save();

    // Fetch complete record with associated staff member and edit logs to return
    return getAttendanceById(attendanceId);
};

export const getStaffAttendanceHistory = async (staffId) => {
    // Fetch all attendance records for the given staffId
    const records = await Attendance.findAll({
        where: { staffId },
        order: [["attendanceDate", "DESC"]]
    });

    // Calculate summary statistics
    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const lateCount = records.filter(r => r.status === "Late").length;
    const absentCount = records.filter(r => r.status === "Absent").length;
    const onLeaveCount = records.filter(r => r.status === "On Leave").length;

    // Total working hours
    const totalWorkingHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0);

    // Average lateness (only for days with Late status)
    const lateDays = records.filter(r => r.status === "Late");
    const avgLateMinutes = lateDays.length > 0
        ? Math.round(lateDays.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / lateDays.length)
        : 0;

    return {
        success: true,
        summary: {
            totalDays,
            presentCount: presentCount + lateCount, // present includes on-time and late employees
            lateCount,
            absentCount,
            onLeaveCount,
            totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
            avgLateMinutes
        },
        records
    };
};

export const markAbsentees = async () => {
    const autoMarkAbsent = (await getSetting("AUTO_MARK_ABSENT", "true")) === "true";
    if (!autoMarkAbsent) {
        throw new Error("Automatic absent marking is disabled in system settings.");
    }

    const today = dayjs().format("YYYY-MM-DD");

    const allStaff = await StaffMember.findAll({
        include: [{ model: Role }]
    });
    if (allStaff.length === 0) {
        throw new Error("No staff members found in the system.");
    }

    // Fetch all attendance records for today
    const todayAttendance = await Attendance.findAll({
        where: {
            attendanceDate: today
        }
    });

    // Check if everyone already has an attendance record
    const staffWithRecords = new Set(todayAttendance.map(a => a.staffId));
    const missingStaff = allStaff.filter(s => !staffWithRecords.has(s.staffId));

    if (missingStaff.length === 0) {
        throw new Error("All employees already have attendance records for today.");
    }

    // Check which missing staff are on leave
    const missingStaffIds = missingStaff.map(s => s.staffId);
    const activeLeaves = await LeaveRequest.findAll({
        where: {
            staffId: {
                [Op.in]: missingStaffIds
            },
            status: "Approved",
            startDate: { [Op.lte]: today },
            endDate: { [Op.gte]: today }
        }
    });

    const staffOnLeave = new Set(activeLeaves.map(l => l.staffId));
    const now = dayjs();

    const recordsToCreate = [];

    for (const staff of missingStaff) {
        const roleSchedule = await getRoleScheduleForStaff(staff);
        const { end: officeEnd } = buildShiftWindow(today, roleSchedule.officeStartTime, roleSchedule.officeEndTime);

        if (officeEnd && now.isBefore(officeEnd)) {
            continue;
        }

        const isOnLeave = staffOnLeave.has(staff.staffId);
        recordsToCreate.push({
            staffId: staff.staffId,
            attendanceDate: today,
            checkInTime: null,
            checkOutTime: null,
            workingHours: 0,
            workingMinutes: 0,
            lateMinutes: 0,
            status: isOnLeave ? "On Leave" : "Absent",
            attendanceMethod: "QR",
            remarks: isOnLeave ? "Automatically marked on leave" : "Automatically marked absent"
        });
    }

    if (recordsToCreate.length === 0) {
        return {
            success: true,
            message: "No staff are eligible to be marked absent yet.",
            markedCount: 0
        };
    }

    await Attendance.bulkCreate(recordsToCreate);

    return {
        success: true,
        message: `Successfully marked ${recordsToCreate.length} absentees for today.`,
        markedCount: recordsToCreate.length
    };
};

