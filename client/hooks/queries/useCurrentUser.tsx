import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { User } from "../../interfaces/User";
import { fetcher } from "../../utils/fetcher";

export const currentUserQueryKey = ["me"] as const;

export const useCurrentUser = (
  options?: Omit<
    UseQueryOptions<User | null, Error, User | null, typeof currentUserQueryKey>,
    "queryKey"
  >
) => {
  return useQuery<User | null, Error, User | null, typeof currentUserQueryKey>({
    queryKey: currentUserQueryKey,
    queryFn: () => fetcher(`/users/me/v2`),
    ...options,
  });
};
