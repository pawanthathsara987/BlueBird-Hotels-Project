import express from "express";
import { registerCustomer, loginCustomer } from "../controllers/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);

export default customerRouter;