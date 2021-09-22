import { User } from "../interfaces/User";

export const fetchAllFriends = async (userId: number): Promise<User[]> => {
  const res = await fetch(`http://localhost:5000/api/users/friends/${userId}`);
  const json: User[] = await res.json();

  return json;
};
