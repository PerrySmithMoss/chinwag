import { Router } from "express";
import authRouter from "../routes/authRoutes";
import userRouter from "../routes/userRoutes";
import messageRouter from "../routes/messageRoutes";

const router = Router();

router.use("/api/sessions", authRouter);
router.use("/api/users", userRouter);
router.use("/api/messages", messageRouter);

export default router;