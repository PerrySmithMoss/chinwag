import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { config } from "../../config/config";
import { handleConnection } from "./socketHandlers";

export const createSocketServer = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: config.clientURL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", handleConnection);

  return io;
};
