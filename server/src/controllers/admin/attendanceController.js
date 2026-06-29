import * as attendanceService from "../../services/attendanceService.js";

export const scanAttendance = async (req, res) => {
    console.log(req.body);
    try {

        const result = await attendanceService.scanAttendance(req.body);

        return res.status(200).json(result);

    } catch (error) {

        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const getAttendanceRecords = async (req, res) => {
    try {
        const result = await attendanceService.getAttendanceRecords(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch attendance records"
        });
    }
};

export const getDailyAttendanceStats = async (req, res) => {
    try {
        const result = await attendanceService.getDailyAttendanceStats();
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch daily attendance statistics"
        });
    }
};

