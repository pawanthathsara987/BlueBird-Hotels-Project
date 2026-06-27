import express from "express";
import { registerUser, getAllUsers, updateUser, deleteUser, searchUsers, verifyEmail, registerStaffMember, sendOtp, verifyOtpAndResetPassword, userLogin, addUserRoles, getAllRoles, searchDeletedUsers, getAllDeletedUsers } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const userRouter = express.Router();

userRouter.post("/create", upload.single("image"), registerUser);
userRouter.post("/add-role", addUserRoles);
userRouter.get("/getAll-roles", getAllRoles);
userRouter.get("/search/:query", searchUsers);
userRouter.get("/search-deleted/:query", searchDeletedUsers);
userRouter.get("/getAll", getAllUsers);
userRouter.put("/update/:id", upload.single("image"), updateUser);
userRouter.delete("/delete/:id", deleteUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/registerStaffMember", registerStaffMember);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/reset-password", verifyOtpAndResetPassword);
userRouter.post("/login", userLogin);
userRouter.get("/getAll-deleted", getAllDeletedUsers);
export default userRouter;