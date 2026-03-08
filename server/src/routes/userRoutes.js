import express from "express";
import {registerUser} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/create", registerUser);

export default userRouter;