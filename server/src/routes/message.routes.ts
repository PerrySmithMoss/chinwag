import { Router } from "express";
import { getAllMessagesBetweenTwoUsersHandler, getUserConversationsHandler } from "../controllers/message.controller";

const messageRouter = Router();

// Return all messages for a specifc userID
messageRouter.get("/:userID", getUserConversationsHandler);

// Return all messages between two users
messageRouter.post("/:senderId/:receiverId", getAllMessagesBetweenTwoUsersHandler);

export default messageRouter;
