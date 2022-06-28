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
  receiver_firstName: string;
  receiver_lastName: string;
  receiver_username: string;
  sender_firstName: string;
  sender_lastName: string;
  sender_username: string;
}
