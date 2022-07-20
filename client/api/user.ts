import { User } from "../interfaces/User";

export const fetchUserDetails = async (
  selectedUserId: number
): Promise<User> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${selectedUserId}`
  );
  const json: User = await res.json();

  return json;
};

export const fetchAllFriends = async (userId: number): Promise<User[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/friends/${userId}`
  );
  const json: User[] = await res.json();

  return json;
};

export const fetchUsersByUsername = async (
  username: string
): Promise<User[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/search/username/${username}`
  );
  const json: User[] = await res.json();

  return json;
};

export const fetchUsersByEmail = async (email: string): Promise<User> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/search/email/${email}`
  );
  const json: User = await res.json();

  return json;
};
