import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import messageRouter from "./message.routes";

const router = Router();

router.use("/api/sessions", authRouter);
router.use("/api/users", userRouter);
router.use("/api/messages", messageRouter);

export default router;