import express from "express";
import { scanAttendance, getAttendanceRecords, getDailyAttendanceStats } from "../controllers/admin/attendanceController.js";

const router = express.Router();

router.post("/scan", scanAttendance);
router.get("/records", getAttendanceRecords);
router.get("/daily-stats", getDailyAttendanceStats);

export default router;
