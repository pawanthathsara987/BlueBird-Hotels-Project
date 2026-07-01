import StaffMember from "../models/User/StaffMember.js";
import Attendance from "../models/attendance/Attendance.js";
import AttendanceEditLog from "../models/attendance/AttendanceEditLog.js";
import AttendanceSetting from "../models/attendance/AttendanceSetting.js";
import dayjs from "dayjs";
import crypto from "crypto";
import { Op } from "sequelize";

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
        }
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
            message: "Staff member is marked as Absent today."
        };
    }

    if (!attendance) {
        // Calculate Lateness
        const now = dayjs();
        const startTimeStr = await getSetting("OFFICE_START_TIME", "08:00");
        const [startHour, startMinute] = startTimeStr.split(":").map(Number);
        
        const officeStart = dayjs().hour(startHour).minute(startMinute).second(0).millisecond(0);
        const gracePeriodMins = parseInt(await getSetting("GRACE_PERIOD", "10"), 10);
        const officeStartWithGrace = officeStart.add(gracePeriodMins, "minute");

        let lateMinutes = 0;
        let status = "Present";

        if (now.isAfter(officeStartWithGrace)) {
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
                message: `Scan cooldown active. Please wait at least ${cooldownMins} minutes since your check-in.`
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
        message: "Attendance already completed today."
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

    return {
        success: true,
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
    };
};

export const getDailyAttendanceStats = async () => {
    const today = dayjs().format("YYYY-MM-DD");

    // Total active staff members
    const totalStaff = await StaffMember.count();

    // Query all logs for today
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
    const checkedInCount = logs.filter(l => l.status !== "Absent").length;
    const absentCount = logs.filter(l => l.status === "Absent").length + Math.max(0, totalStaff - logs.length);

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

    // Fetch all active staff members
    const allStaff = await StaffMember.findAll();
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

    // Create Absent records for the missing staff members
    const recordsToCreate = missingStaff.map(staff => ({
        staffId: staff.staffId,
        attendanceDate: today,
        checkInTime: null,
        checkOutTime: null,
        workingHours: 0,
        workingMinutes: 0,
        lateMinutes: 0,
        status: "Absent",
        attendanceMethod: "QR",
        remarks: "Automatically marked absent"
    }));

    await Attendance.bulkCreate(recordsToCreate);

    return {
        success: true,
        message: `Successfully marked ${recordsToCreate.length} absentees for today.`,
        markedCount: recordsToCreate.length
    };
};

