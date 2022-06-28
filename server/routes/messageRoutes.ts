import { Router } from "express";
import { getChatMessagesBetweenTwoUsers, getMessagesForSpecificUser } from "../controllers/messageController";

const messageRouter = Router();

// Return all messages for a specifc userID
messageRouter.get("/:userID", getMessagesForSpecificUser);

// Return all messages between two users
messageRouter.get("/:senderId/:receiverId", getChatMessagesBetweenTwoUsers);

export default messageRouter;
