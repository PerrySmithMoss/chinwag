import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { User } from "../../interfaces/User";
import { fetcher } from "../../utils/fetcher";

const QUERY_KEY = ["me"] as const;

export const useCurrentUser = (
  options?: Omit<
    UseQueryOptions<User | null, Error, User | null, typeof QUERY_KEY>,
    "queryKey"
  >
) => {
  return useQuery<User | null, Error, User | null, typeof QUERY_KEY>({
    queryKey: QUERY_KEY,
    queryFn: () => fetcher(`/users/me/v2`),
    ...options,
  });
};
