import { Router } from "express";
import {
  createSessionHandler, refreshAccessTokenHandler, deleteUserSessionHandler, registerSessionHandler
} from "../controllers/auth.controller";
import { requireUser } from "../middleware/requireUser";

const authRouter = Router();

// Register user
authRouter.post("/register", registerSessionHandler);

// Login user
authRouter.post("/create", createSessionHandler);

// Refresh access token
authRouter.post("/refresh", refreshAccessTokenHandler);

// Logout user
authRouter.delete("/", requireUser, deleteUserSessionHandler);

export default authRouter;
