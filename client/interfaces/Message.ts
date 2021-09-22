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
