import { Message, PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getMessagesForSpecificUser = async (
  req: Request,
  res: Response
) => {
  try {
    const userID = parseInt(req.params.userID);

    // Return one message per conversation
    // Will only return one message for each conversation 
    // Order by the last message sent
      const messages = await prisma.$queryRaw`SELECT
      m.*,     
      s.firstName AS sender_firstName, 
      s.lastName AS sender_lastName,
      s.username AS sender_username,
      r.firstName AS receiver_firstName, 
      r.lastName AS receiver_lastName,
      r.username AS receiver_username
      FROM Message m
      INNER JOIN User s ON s.id = m.senderId
      INNER JOIN User r ON r.id = m.receiverId
      JOIN (SELECT CASE WHEN senderId = ${userID}
      THEN receiverId ELSE senderId END AS other, MAX(createdAt) AS latest
      FROM Message
      WHERE senderId = ${userID} OR receiverId = ${userID}
      GROUP BY other) m
      ON (m.senderId = ${userID} AND m.receiverId = m.other OR m.receiverId = ${userID}
      AND m.senderId = m.other) AND m.createdAt = m.latest`;

    // const messages = await prisma.message.findMany({
    //   where: {
    //     OR: [
    //       {
    //         senderId: {
    //           equals: userID
    //         },
    //       },
    //       {
    //         receiverId: {
    //           equals: userID
    //         },
    //       },
    //     ],
    //   },
    //   include: {
    //     sender: true,
    //     receiver: true,
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    // const toIds = messages.map((m) => m.receiverId);
    // const fromIds = messages.map((m) => m.senderId);

    // const messageIds = toIds.concat(fromIds);

    // const filteredMessages = messages.filter(
    //   (message, index) => !toIds.includes(message.senderId, index + 1)
    // );

    // const filteredMessages = messages.filter(
    //   (message, index, self) => index === self.findIndex((t: Message) => (
    //      t.senderId === message.senderId
    //   ))
    // );

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getChatMessagesBetweenTwoUsers = async (
  req: Request,
  res: Response
) => {
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
        createdAt: "asc",
      },
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};
