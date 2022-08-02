import { Message, UniqueMessage } from "../interfaces/Message";

export const fetchAllMessagesWithUser = async (
  senderId: number,
  receiverId: number,
  cursor?: string
): Promise<Message[]> => {
  const cursorFormatted = {
    cursor: cursor
  }

  if(cursor) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/${senderId}/${receiverId}?cursor=${cursor}`,
      // {
      //   method: "POST",
      //   body: JSON.stringify(cursorFormatted),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // }
    );
    const json: Message[] = await res.json();
  
    return json;
  } else {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/${senderId}/${receiverId}`,
      // {
      //   method: "POST",
      //   body: JSON.stringify(cursorFormatted),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // }
    );
    const json: Message[] = await res.json();
  
    return json;
  }
};

export const getAllUserMessages = async (
  userID: number
): Promise<UniqueMessage[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/${userID}`);
  const json: UniqueMessage[] = await res.json();

  return json;
};
