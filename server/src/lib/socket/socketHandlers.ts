import { Server, Socket } from "socket.io";
import { createMessage, getMessagesBetweenTwoUsers } from "../../services/message.service";
import { isUserId } from "../../utils/userId";

const userRoom = (userId: number) => `user:${userId}`;

export const handleConnection = (io: Server, socket: Socket, userId: number) => {
  socket.join(userRoom(userId));

  socket.on("join-room", async (_room: unknown, receiverId: unknown, senderId: unknown) => {
    if (senderId !== userId || !isUserId(receiverId)) {
      socket.emit("error", { message: "Invalid conversation" });
      return;
    }

    try {
      socket.emit("room-messages", await getMessagesBetweenTwoUsers(userId, receiverId));
    } catch (error) {
      console.error("Error loading conversation:", error);
      socket.emit("error", { message: "Failed to load conversation" });
    }
  });

  socket.on("send-message", async (
    _room: unknown, senderId: unknown, receiverId: unknown, message: unknown
  ) => {
    if (senderId !== userId || !isUserId(receiverId)
        || typeof message !== "string" || !message.trim() || message.length > 4_000) {
      socket.emit("error", { message: "Invalid message" });
      return;
    }

    try {
      const newMessage = await createMessage(message, userId, receiverId);
      io.to([userRoom(userId), userRoom(receiverId)]).emit("receive-message", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
};
