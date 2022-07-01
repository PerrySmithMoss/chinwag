import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";

const authRouter = Router();

//REGISTER
authRouter.post("/register", registerUser);

//LOGIN
authRouter.post("/login", loginUser);

export default authRouter

