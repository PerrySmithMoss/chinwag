import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const senderId = parseInt(req.params.senderId);
    const receiverId = parseInt(req.params.receiverId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: senderId,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};
