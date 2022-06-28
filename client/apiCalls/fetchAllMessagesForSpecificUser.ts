import { Message, UniqueMessage } from "../interfaces/Message";

export const getAllUserMessages = async (
  userID: number,
): Promise<UniqueMessage[]> => {
  const res = await fetch(
    `http://localhost:5000/api/messages/${userID}`
  );
  const json: UniqueMessage[] = await res.json();

  return json;
};
