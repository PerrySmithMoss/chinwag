import { Message } from "../interfaces/Message";

export const fetchAllMessagesWithUser = async (
  senderId: number,
  receiverId: number
): Promise<Message[]> => {
  const res = await fetch(
    `http://localhost:5000/api/messages/${senderId}/${receiverId}`
  );
  const json: Message[] = await res.json();

  return json;
};
