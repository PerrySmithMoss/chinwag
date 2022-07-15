import { Router } from "express";
import {
  createSessionHandler, refreshAccessTokenHandler, deleteUserSessionHandler
} from "../controllers/auth.controller";
import { requireUser } from "../middleware/requireUser";

const authRouter = Router();

authRouter.post("/create", createSessionHandler);

authRouter.post("/refresh", refreshAccessTokenHandler);

// Logout user
authRouter.delete("/", requireUser, deleteUserSessionHandler);

export default authRouter;
