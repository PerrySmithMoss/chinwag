import { User } from "../interfaces/User";
import { fetcher } from "../utils/fetcher";

export const fetchUserDetails = async (
  selectedUserId: number
): Promise<User> => {
  return await fetcher(`/users/${selectedUserId}`);
};

export const fetchAllFriends = async (userId: number): Promise<User[]> => {
  return await fetcher(`/users/friends/${userId}`);
};

export const fetchUsersByUsername = async (
  username: string
): Promise<User[]> => {
  return await fetcher(`/users/search/username/${username}`);
};

export const fetchUsersByEmail = async (email: string): Promise<User> => {
  return await fetcher(`/users/search/email/${email}`);
};
