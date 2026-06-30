import express from "express";
import { 
    scanAttendance, 
    getAttendanceRecords, 
    getDailyAttendanceStats,
    getAttendanceById,
    updateAttendance,
    getStaffAttendanceHistory
} from "../controllers/admin/attendanceController.js";

const router = express.Router();

router.post("/scan", scanAttendance);
router.get("/records", getAttendanceRecords);
router.get("/daily-stats", getDailyAttendanceStats);
router.get("/staff/:staffId", getStaffAttendanceHistory);
router.get("/:attendanceId", getAttendanceById);
router.put("/:attendanceId", updateAttendance);

export default router;
