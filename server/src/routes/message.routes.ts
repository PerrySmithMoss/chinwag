import { Router } from "express";
import {
  getAllMessagesBetweenTwoUsersHandler,
  getUserConversationsHandler,
} from "../controllers/message.controller";

const messageRouter = Router();

// Return all messages for a specific user ID
messageRouter.get("/:userID", getUserConversationsHandler);

// Return all messages between two users
messageRouter.get(
  "/:senderId/:receiverId",
  getAllMessagesBetweenTwoUsersHandler
);

export default messageRouter;
