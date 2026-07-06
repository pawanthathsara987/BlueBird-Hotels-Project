import express from "express";
import {
    getAllLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    getAllLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    updateLeaveStatus,
    getRoleLeaveLimits,
    updateRoleLeaveLimits
} from "../controllers/leaveController.js";

const router = express.Router();

// Leave Types Routes
router.get("/types", getAllLeaveTypes);
router.post("/types", createLeaveType);
router.put("/types/:id", updateLeaveType);
router.delete("/types/:id", deleteLeaveType);

// Leave Requests Routes
router.get("/requests", getAllLeaveRequests);
router.post("/requests", createLeaveRequest);
router.put("/requests/:id", updateLeaveRequest);
router.delete("/requests/:id", deleteLeaveRequest);
router.patch("/requests/:id/status", updateLeaveStatus);

// Role Leave Limits Routes
router.get("/role-limits", getRoleLeaveLimits);
router.put("/role-limits", updateRoleLeaveLimits);

export default router;
