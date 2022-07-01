import { Message, UniqueMessage } from "../interfaces/Message";

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

export const getAllUserMessages = async (
  userID: number
): Promise<UniqueMessage[]> => {
  const res = await fetch(`http://localhost:5000/api/messages/${userID}`);
  const json: UniqueMessage[] = await res.json();

  return json;
};
