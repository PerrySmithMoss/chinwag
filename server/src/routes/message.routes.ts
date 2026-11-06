import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import {
  getAllMessagesBetweenTwoUsersHandler,
  getUserConversationsHandler,
} from "../controllers/message.controller";

const messageRouter = Router();
messageRouter.use(requireUser);

// Return all messages for a specific user ID
messageRouter.get("/:userID", getUserConversationsHandler);

// Return all messages between two users
messageRouter.get(
  "/:senderId/:receiverId",
  getAllMessagesBetweenTwoUsersHandler
);

export default messageRouter;
