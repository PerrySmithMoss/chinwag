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
