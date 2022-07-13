import express, { Application } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import router from "./routes";
import {
  createMessage,
  getLastMessagesFromUser,
} from "./services/message.service";
import { config } from "../config/config";

const app: Application = express();
const server = createServer(app);

const prisma = new PrismaClient();

const io = new Server(server, {
  cors: {
    origin: config.clientURL,
    methods: ["GET", "POST"],
  },
});

const main = async () => {
  app.use(express.json());
  app.use(cors());
  app.use(router);

  // app.use(express.static("public"));

  io.on("connection", (socket: Socket) => {
    socket.on("disconnect", () => {
      socket.disconnect();
    });

    socket.on("join-room", async (newRoom, receiverId, senderId) => {
      socket.join(newRoom);

      const roomMessages = await getLastMessagesFromUser(receiverId, senderId);

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
