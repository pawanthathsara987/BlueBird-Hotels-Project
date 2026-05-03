import express from "express";
import {registerUser, getAllUsers, updateUser, deleteUser, searchUsers, verifyEmail, registerStaffMember, sendOtp, verifyOtpAndResetPassword, userLogin} from "../controllers/userController.js";
import {requireAuth, requireRole} from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/create", requireAuth, requireRole("admin"), registerUser);
userRouter.get("/search/:query", searchUsers);
userRouter.get("/getAll",requireAuth, requireRole("admin"), getAllUsers);
userRouter.put("/update/:id", requireAuth, requireRole("admin"), updateUser);
userRouter.delete("/delete/:id", requireAuth, requireRole("admin"), deleteUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/registerStaffMember", registerStaffMember);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/reset-password", verifyOtpAndResetPassword);
userRouter.post("/login", userLogin);

export default userRouter;