import express from "express";
import {registerUser, getAllUsers, updateUser, deleteUser, searchUsers} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/create", registerUser);
userRouter.get("/search/:query", searchUsers);
userRouter.get("/getAll", getAllUsers);
userRouter.put("/update/:id", updateUser);
userRouter.delete("/delete/:id", deleteUser);

export default userRouter;