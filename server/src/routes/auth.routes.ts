import { Router } from "express";
import {
  createSessionHandler, refreshAccessTokenHandler, deleteUserSessionHandler, registerSessionHandler,
  createSocketTicketHandler,
} from "../controllers/auth.controller";
import { requireUser } from "../middleware/requireUser";

const authRouter = Router();

// Register user
authRouter.post("/register", registerSessionHandler);

// Login user
authRouter.post("/create", createSessionHandler);

// Refresh access token
authRouter.post("/refresh", refreshAccessTokenHandler);
authRouter.post("/socket-ticket", requireUser, createSocketTicketHandler);

// Logout user
authRouter.delete("/", deleteUserSessionHandler);

export default authRouter;
