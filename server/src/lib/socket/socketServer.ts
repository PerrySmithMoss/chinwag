import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { config } from "../../config/config";
import { verifySocketTicket } from "../../services/auth.service";
import { handleConnection } from "./socketHandlers";

export const createSocketServer = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: { origin: config.clientURL },
    allowRequest: (req, callback) => {
      const { origin } = req.headers;
      callback(null, !origin || origin === config.clientURL);
    },
  });

  io.use((socket, next) => {
    const userId = verifySocketTicket(socket.handshake.auth?.ticket);
    if (userId === null) {
      next(new Error("Authentication required"));
      return;
    }
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => handleConnection(io, socket, socket.data.userId));
  return io;
};
