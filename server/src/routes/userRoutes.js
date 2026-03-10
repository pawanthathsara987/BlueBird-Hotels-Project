import express from "express";
import {registerUser, getAllUsers, updateUser, deleteUser, searchUsers, verifyEmail} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/create", registerUser);
userRouter.get("/search/:query", searchUsers);
userRouter.get("/getAll", getAllUsers);
userRouter.put("/update/:id", updateUser);
userRouter.delete("/delete/:id", deleteUser);
userRouter.post("/verify-email", verifyEmail);

export default userRouter;