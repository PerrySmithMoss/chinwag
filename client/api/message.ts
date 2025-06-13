import { Message, UniqueMessage } from "../interfaces/Message";
import { fetcher } from "../utils/fetcher";

export const fetchAllMessagesWithUser = async (
  senderId: number,
  receiverId: number,
  cursor?: string
): Promise<Message[]> => {
  // TODO: add error handling here and anywhere which uses this fetch req
  const endpoint = cursor
    ? `/messages/${senderId}/${receiverId}?cursor=${cursor}`
    : `/messages/${senderId}/${receiverId}`;

  const res = await fetcher<Message[]>(endpoint);

  return res;
};

export const getAllUserMessages = async (
  userID: number
): Promise<UniqueMessage[]> => {
  // TODO: add error handling here and anywhere which uses this fetch req
  const res = await fetcher<UniqueMessage[]>(`/messages/${userID}`);

  return res;
};
