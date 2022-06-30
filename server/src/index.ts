import express, { Request, Response, Application } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import authRouter from "../routes/authRoutes";
import userRouter from "../routes/userRoutes";
import messageRouter from "../routes/messageRoutes";
import { allUsers } from "../controllers/userController";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();
  app.use(express.json());
  app.use(cors());

  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Returns a message thread between two users
  async function getLastMessagesFromUser(
    userId: number,
    currentUserId: number
  ) {
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

  function sortRoomMessagesByDate(messages: any) {
    return messages.sort(function (a: any, b: any) {
      let date1 = a._id.split("/");
      let date2 = b._id.split("/");

      date1 = date1[2] + date1[0] + date1[1];
      date2 = date2[2] + date2[0] + date2[1];

      return date1 < date2 ? -1 : 1;
    });
  }

  //   app.use(
  //     cors({
  //       origin: process.env.CORS_ORIGIN as string,
  //       credentials: true,
  //     })
  //   );
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

  io.on("connection", (socket: Socket) => {
    // socket.on("new-user", async () => {
    //   const members = await prisma.user.findMany();
    //   io.emit("new-user", members);
    // });

    socket.on("join-room", async (newRoom, previousRoom, currentUserId) => {
      socket.join(newRoom);
      socket.leave(previousRoom);

      let roomMessages = await getLastMessagesFromUser(
        previousRoom,
        currentUserId
      );
      // roomMessages = sortRoomMessagesByDate(roomMessages);

      socket.emit("room-messages", roomMessages);
    });

    socket.on("message-room", async (room, message, senderId, receiverId) => {
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

      let roomMessages = await getLastMessagesFromUser(receiverId, senderId);
      // roomMessages = sortRoomMessagesByDate(roomMessages);

      // sending message to room
      io.to(room).emit("room-messages", roomMessages);

      // socket.broadcast.emit("notifications", receiverId);
    });

    // app.delete('/logout', async(req, res)=> {
    //   try {
    //     const {_id, newMessages} = req.body;
    //     const user = await User.findById(_id);
    //     user.status = "offline";
    //     user.newMessages = newMessages;
    //     await user.save();
    //     const members = await User.find();
    //     socket.broadcast.emit('new-user', members);
    //     res.status(200).send();
    //   } catch (e) {
    //     console.log(e);
    //     res.status(400).send()
    //   }
    // })
  });

  /*/ Routes /*/
  app.use("/api/auth", authRouter);

  app.use("/api/users", userRouter);

  app.use("/api/messages", messageRouter);

  app.get("/", async (req, res) => {
    // const recentUsers = await prisma.user.findMany({
    //   include: {
    //     posts: true,
    //     profile: true,
    //   },
    // });
    // res.send(recentUsers);
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
