import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import messageRouter from "./message.routes";
import imageRouter from "./images.routes";

const router = Router();

router.use("/api/sessions", authRouter);
router.use("/api/users", userRouter);
router.use("/api/messages", messageRouter);
router.use("/api/images", imageRouter);

export default router;