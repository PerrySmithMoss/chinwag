import { User } from "./User";

export interface Message {
  id: number;
  createdAt: string;
  updatedAt: string;
  message: string;
  sender: User;
  receiver: User;
  senderId: number;
  receiverId: number;
}

interface ThreadMessageUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
}

export interface ThreadMessage {
  id: number;
  createdAt: string;
  updatedAt: string;
  message: string;
  sender: ThreadMessageUser;
  receiver: ThreadMessageUser;
  senderId: number;
  receiverId: number;
}
