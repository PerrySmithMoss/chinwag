import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { User } from "../../interfaces/User";
import { fetchUserDetails } from "../../api/user";

const QUERY_KEY = ["userDetails"] as const;

export const useUserDetails = (
  userId?: number,
  options?: Omit<
    UseQueryOptions<User | null, Error, User | null, typeof QUERY_KEY>,
    "queryKey"
  >
) => {
  return useQuery<User | null, Error, User | null, typeof QUERY_KEY>({
    queryKey: QUERY_KEY,
    queryFn: () => {
      if (userId === undefined) {
        // Should never call if no userId
        return Promise.resolve(null);
      }
      return fetchUserDetails(userId);
    },
    enabled: Boolean(userId), // only fetch if userId is defined
    ...options,
  });
};
