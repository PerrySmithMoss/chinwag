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
  avatar: string;
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

export interface UniqueMessage {
  id: number;
  createdAt: string;
  updatedAt: string;
  message: string;
  sender: User;
  receiver: User;
  senderId: number;
  receiverId: number;
  receiverFirstName: string;
  receiverLastName: string;
  receiverUsername: string;
  senderFirstName: string;
  senderLastName: string;
  senderUsername: string;
  senderAvatar: string;
  receiverAvatar: string;
}
