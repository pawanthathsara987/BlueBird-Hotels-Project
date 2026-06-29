import StaffMember from "../models/User/StaffMember.js";
import Attendance from "../models/attendance/Attendance.js";
import dayjs from "dayjs";
import { Op } from "sequelize";

export const scanAttendance = async (data) => {
    const { staffId, type, version } = data;

    if (type !== "attendance") {
        throw new Error("Invalid QR Code");
    }

    if (version !== 1) {
        throw new Error("Unsupported QR Version");
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

    if (!attendance) {
        // Calculate Lateness
        const now = dayjs();
        const officeStart = dayjs().hour(8).minute(0).second(0);
        let lateMinutes = 0;
        let status = "Present";

        if (now.isAfter(officeStart)) {
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
        attendance.checkOutTime = new Date();

        // Calculate Worked Time
        const checkIn = dayjs(attendance.checkInTime);
        const checkOut = dayjs(attendance.checkOutTime);
        const workingMinutes = checkOut.diff(checkIn, "minute");

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
    const checkedInCount = logs.length;
    const absentCount = Math.max(0, totalStaff - checkedInCount);
    
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
            recentLogs: logs.slice(0, 5)
        }
    };
};

