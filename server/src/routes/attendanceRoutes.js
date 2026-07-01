import express from "express";
import {
    scanAttendance,
    getAttendanceRecords,
    getDailyAttendanceStats,
    getAttendanceById,
    updateAttendance,
    getStaffAttendanceHistory,
    markAbsentees,
    getAttendanceSettings,
    updateAttendanceSettings
} from "../controllers/admin/attendanceController.js";

const router = express.Router();

router.get("/settings", getAttendanceSettings);
router.put("/settings", updateAttendanceSettings);
router.post("/scan", scanAttendance);
router.post("/mark-absentees", markAbsentees);
router.get("/records", getAttendanceRecords);
router.get("/daily-stats", getDailyAttendanceStats);
router.get("/staff/:staffId", getStaffAttendanceHistory);
router.get("/:attendanceId", getAttendanceById);
router.put("/:attendanceId", updateAttendance);

export default router;
