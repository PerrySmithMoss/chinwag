import { Router } from "express";
import { getChatMessages } from "../controllers/messageController";

const messageRouter = Router();

// Return all messages between two users
messageRouter.get("/:senderId/:receiverId", getChatMessages);

export default messageRouter;
