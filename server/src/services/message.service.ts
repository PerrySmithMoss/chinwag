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
      receiver: {
        select: {
          createdAt: true,
          firstName: true,
          lastName: true,
          id: true,
          username: true,
          profile: {
            select: {
              avatar: true,
              avatarId: true,
            },
          },
        },
      },
      sender: {
        select: {
          createdAt: true,
          firstName: true,
          lastName: true,
          id: true,
          username: true,
          profile: {
            select: {
              avatar: true,
              avatarId: true,
            },
          },
        },
      },
    },
  });

  return newMessage;
}

// Returns a message thread between two users
export async function getMessagesBetweenTwoUsers(
  senderId: number,
  receiverId: number,
  cursor?: string
) {
  if (cursor) {
    const roomMessages = await prisma.message.findMany({
      take: 20,
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
        AND: [
          {
            createdAt: {
              lt: cursor,
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            createdAt: true,
            firstName: true,
            lastName: true,
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                avatarId: true,
              },
            },
          },
        },
        receiver: {
          select: {
            createdAt: true,
            firstName: true,
            lastName: true,
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                avatarId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return roomMessages;
  } else {
    const roomMessages = await prisma.message.findMany({
      take: 20,
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
        sender: {
          select: {
            createdAt: true,
            firstName: true,
            lastName: true,
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                avatarId: true,
              },
            },
          },
        },
        receiver: {
          select: {
            createdAt: true,
            firstName: true,
            lastName: true,
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                avatarId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return roomMessages;
  }
}

export async function getUsersMessages(userId: number) {
  // Return one message per conversation
  // Will only return one message for each conversation
  // Order by the last message sent
  const messages = prisma.$queryRaw`
  SELECT
  m.*,     
  s.firstName AS sender_firstName, 
  s.lastName AS sender_lastName,
  s.username AS sender_username,
  r.firstName AS receiver_firstName, 
  r.lastName AS receiver_lastName,
  r.username AS receiver_username,
  sp.avatar AS sender_avatar,
  rp.avatar AS receiver_avatar
  FROM Message m
  INNER JOIN User s ON s.id = m.senderId
  INNER JOIN User r ON r.id = m.receiverId
  INNER JOIN Profile sp ON sp.userId = m.senderId
  INNER JOIN Profile rp ON rp.userId = m.receiverId
  JOIN (SELECT CASE WHEN senderId = ${userId}
  THEN receiverId ELSE senderId END AS other, MAX(createdAt) AS latest
  FROM Message
  WHERE senderId = ${userId} OR receiverId = ${userId}
  GROUP BY other) m
  ON (m.senderId = ${userId} AND m.receiverId = m.other OR m.receiverId = ${userId}
  AND m.senderId = m.other) AND m.createdAt = m.latest
  ORDER BY createdAt DESC
  `;

  return messages;
}
