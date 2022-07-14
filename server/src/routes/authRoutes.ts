import { Router } from "express";
import {
  createSessionHandler, refreshAccessTokenHandler,
} from "../controllers/authController";

const authRouter = Router();

authRouter.post("/create", createSessionHandler);

authRouter.post("/refresh", refreshAccessTokenHandler);

export default authRouter;
