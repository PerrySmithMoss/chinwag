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
  const messages = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      m.*,
      s."firstName" AS "senderFirstName",
      s."lastName" AS "senderLastName",
      s.username AS "senderUsername",
      r."firstName" AS "receiverFirstName",
      r."lastName" AS "receiverLastName",
      r.username AS "receiverUsername",
      sp.avatar AS "senderAvatar",
      rp.avatar AS "receiverAvatar"
    FROM "Message" m
    INNER JOIN "User" s ON s.id = m."senderId"
    INNER JOIN "User" r ON r.id = m."receiverId"
    INNER JOIN "Profile" sp ON sp."userId" = m."senderId"
    INNER JOIN "Profile" rp ON rp."userId" = m."receiverId"
    JOIN (
      SELECT 
        CASE 
          WHEN "senderId" = ${userId} THEN "receiverId"
          ELSE "senderId" 
        END AS other, 
        MAX("createdAt") AS latest
      FROM "Message"
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      GROUP BY other
    ) sub ON (
      (m."senderId" = ${userId} AND m."receiverId" = sub.other) OR 
      (m."receiverId" = ${userId} AND m."senderId" = sub.other)
    ) AND m."createdAt" = sub.latest
    ORDER BY m."createdAt" DESC
  `);

  // transform flat fields into nested objects
  return messages.map((msg) => ({
    id: msg.id,
    message: msg.message,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    sender: {
      id: msg.senderId,
      firstName: msg.senderFirstName,
      lastName: msg.senderLastName,
      username: msg.senderUsername,
      avatar: msg.senderAvatar,
    },
    receiver: {
      id: msg.receiverId,
      firstName: msg.receiverFirstName,
      lastName: msg.receiverLastName,
      username: msg.receiverUsername,
      avatar: msg.receiverAvatar,
    },
  }));
}
