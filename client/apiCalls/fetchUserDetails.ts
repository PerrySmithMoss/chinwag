import { User } from "../interfaces/User";

export const fetchUserDetails = async (selectedUserId: number): Promise<User> => {
  const res = await fetch(`http://localhost:5000/api/users/${selectedUserId}`);
  const json: User = await res.json();

  return json;
};
