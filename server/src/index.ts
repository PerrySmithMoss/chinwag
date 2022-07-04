import express, { Application } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import router from "./routes";

dotenv.config();

const PORT = process.env.PORT;

const prisma = new PrismaClient();

const app: Application = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Returns a message thread between two users
async function getLastMessagesFromUser(userId: number, currentUserId: number) {
  let roomMessages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: currentUserId,
          receiverId: userId,
        },
        {
          senderId: userId,
          receiverId: currentUserId,
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

const main = async () => {
  app.use(express.json());
  app.use(cors());
  app.use(router);

  //   app.use(express.static("public"));

  //   app.use(
  //     session({
  //       name: process.env.COOKIE_NAME as string,
  //       store: new RedisStore({ client: redisClient, disableTouch: true }),
  //       cookie: {
  //         maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
  //         // maxAge: 7000, // 1 day
  //         httpOnly: true,
  //         sameSite: "lax",
  //         secure: __prod__, // cookie only works in https
  //         domain: __prod__ ? ".example.com" : undefined
  //       },
  //       saveUninitialized: false,
  //       secret: process.env.SESSION_SECRET as string,
  //       resave: false,
  //     })
  //   );

  // io.on("connection", (socket: Socket) => {

  //   socket.on("join-room", async (newRoom, receiverId, senderId) => {

  //     console.log(`Room ${newRoom}`);
  //     console.log(`User ${senderId} wants to chat with - ${receiverId}`);

  //     socket.join(newRoom);
  //     socket.leave(receiverId);

  //     const roomMessages = await getLastMessagesFromUser(receiverId, senderId);

  //     socket.emit("room-messages", roomMessages);
  //   });

  //   socket.on("message-room", async (room, message, senderId, receiverId) => {

  //     console.log(`New message in ${room}`);
  //     console.log(`User ${senderId} sent a message to - ${receiverId}`);

  //     await prisma.message.create({
  //       data: {
  //         message,
  //         senderId,
  //         receiverId,
  //       },
  //       include: {
  //         receiver: true,
  //         sender: true,
  //       },
  //     });

  //     const roomMessages = await getLastMessagesFromUser(receiverId, senderId);

  //     // sending message to room
  //     io.to(room).emit("room-messages", roomMessages);
  //     // socket.broadcast.to(room).emit("room-messages", roomMessages);

  //     // socket.broadcast.emit("notifications", receiverId);
  //   });
  // });

  io.on("connection", (socket) => {
    const id = socket.handshake.query.id;
    if (id) {
      socket.join(id);
    }

    socket.on("send-message", ({ senderId, receiverId, message }) => {
      recipients.forEach((recipient: any) => {
        const newRecipients = recipients.filter((r: any) => r !== recipient);
        newRecipients.push(id);
        socket.broadcast.to(recipient).emit("receive-message", {
          recipients: newRecipients,
          message,
          sender: id
        });
      });
    });
  });

  server.listen(PORT, () =>
    console.log(`🚀  Server running on http://localhost:${PORT}`)
  );
};

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
