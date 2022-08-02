import { Request, Response } from "express";
import {
  getMessagesBetweenTwoUsers,
  getUsersMessages,
} from "../services/message.service";

// Returns all conversations for a specifc user
export const getUserConversationsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userID = parseInt(req.params.userID);

    const messages = await getUsersMessages(userID);

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Returns all messages between two specifc users
export const getAllMessagesBetweenTwoUsersHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const senderId = parseInt(req.params.senderId);
    const receiverId = parseInt(req.params.receiverId);
    
    // const { cursor } = req.body;
    const { cursor } = req.query;

    const messages = await getMessagesBetweenTwoUsers(
      senderId,
      receiverId,
      cursor as string
    );

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};
