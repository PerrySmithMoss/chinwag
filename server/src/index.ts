import express, { Application } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import router from "./routes";
import {
  createMessage,
  getMessagesBetweenTwoUsers,
} from "./services/message.service";
import { config } from "../config/config";
import prisma from "./lib/prisma";
import { isAuthenticated } from "./middleware/isAuthenticated";
import cookieParser from "cookie-parser";

const app: Application = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientURL,
    methods: ["GET", "POST"],
  },
});

const main = async () => {
  app.use(
    cors({
      origin: config.clientURL,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(isAuthenticated);
  app.use(router);

  // app.use(express.static("public"));

  io.on("connection", (socket: Socket) => {
    socket.on("disconnect", () => {
      socket.disconnect();
    });

    socket.on("join-room", async (newRoom, receiverId, senderId) => {
      socket.join(newRoom);

      const roomMessages = await getMessagesBetweenTwoUsers(
        receiverId,
        senderId
      );

      socket.emit("room-messages", roomMessages);
    });

    socket.on("send-message", async (room, senderId, receiverId, message) => {
      const newMessage = await createMessage(message, senderId, receiverId);

      io.to(room).emit("receive-message", newMessage);
    });
  });

  server.listen(config.serverPort, () =>
    console.log(
      `🚀  Server running on ${config.serverURL}:${config.serverPort}`
    )
  );
};

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
