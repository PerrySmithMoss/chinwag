import { Message, ThreadMessage } from "../interfaces/Message";
import { fetcher } from "../utils/fetcher";

export const fetchAllMessagesWithUser = async (
  senderId: number,
  receiverId: number,
  cursor?: string
): Promise<Message[]> => {
  // TODO: add error handling here and anywhere which uses this fetch req
  const endpoint = cursor
    ? `/messages/${senderId}/${receiverId}?cursor=${encodeURIComponent(cursor)}`
    : `/messages/${senderId}/${receiverId}`;

  const res = await fetcher<Message[]>(endpoint);

  return res;
};

export const getAllUserMessages = async (
  userID: number
): Promise<ThreadMessage[]> => {
  // TODO: add error handling here and anywhere which uses this fetch req
  const res = await fetcher<ThreadMessage[]>(`/messages/${userID}`);

  return res;
};
