import { Server, Socket } from "socket.io";
import {
  createMessage,
  getMessagesBetweenTwoUsers,
} from "../../services/message.service";

export const handleConnection = (io: Server, socket: Socket) => {
  socket.on(
    "join-room",
    async (newRoom: string, receiverId: number, senderId: number) => {
      try {
        socket.join(newRoom);

        const roomMessages = await getMessagesBetweenTwoUsers(
          receiverId,
          senderId
        );

        socket.emit("room-messages", roomMessages);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    }
  );

  socket.on(
    "send-message",
    async (
      room: string,
      senderId: number,
      receiverId: number,
      message: string
    ) => {
      try {
        const newMessage = await createMessage(message, senderId, receiverId);

        // emit to all clients in the room, including the sender
        io.to(room).emit("receive-message", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );
};
