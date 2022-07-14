import prisma from "../lib/prisma";

// Saves a message between 2 users in database
export async function createMessage(
  message: string,
  senderId: number,
  receiverId: number
) {
  const newMessage = await prisma.message.create({
    data: {
      message,
      senderId,
      receiverId,
    },
    include: {
      receiver: true,
      sender: true,
    },
  });

  return newMessage;
}

// Returns a message thread between two users
export async function getMessagesBetweenTwoUsers(
  senderId: number,
  receiverId: number
) {
  const roomMessages = await prisma.message.findMany({
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

  return roomMessages;
}

export async function getUsersMessages(userId: number) {
  // Return one message per conversation
  // Will only return one message for each conversation
  // Order by the last message sent
  const messages = prisma.$queryRaw`SELECT
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
  JOIN (SELECT CASE WHEN senderId = ${userId}
  THEN receiverId ELSE senderId END AS other, MAX(createdAt) AS latest
  FROM Message
  WHERE senderId = ${userId} OR receiverId = ${userId}
  GROUP BY other) m
  ON (m.senderId = ${userId} AND m.receiverId = m.other OR m.receiverId = ${userId}
  AND m.senderId = m.other) AND m.createdAt = m.latest`;

  return messages;
}
