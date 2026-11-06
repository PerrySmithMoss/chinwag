import { Request, Response } from "express";
import { iso } from "zod";
import { getMessagesBetweenTwoUsers, getUsersMessages } from "../services/message.service";
import { parseUserId } from "../utils/userId";

export async function getUserConversationsHandler(req: Request, res: Response) {
  const userId = parseUserId(req.params.userID);
  if (userId === null) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  if (userId !== res.locals.user.id) {
    res.sendStatus(403);
    return;
  }

  res.json(await getUsersMessages(userId));
}

export async function getAllMessagesBetweenTwoUsersHandler(req: Request, res: Response) {
  const senderId = parseUserId(req.params.senderId);
  const receiverId = parseUserId(req.params.receiverId);
  const { cursor } = req.query;
  const page = iso.datetime({ offset: true }).optional().safeParse(cursor);
  if (senderId === null || receiverId === null || !page.success) {
    res.status(400).json({ message: "Invalid conversation or cursor." });
    return;
  }

  const userId = res.locals.user.id;
  if (userId !== senderId && userId !== receiverId) {
    res.sendStatus(403);
    return;
  }

  res.json(await getMessagesBetweenTwoUsers(senderId, receiverId, page.data));
}
