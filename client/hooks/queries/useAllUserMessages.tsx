import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAllUserMessages } from "../../api/message";
import { UniqueMessage } from "../../interfaces/Message";

const QUERY_KEY = ["allUserMessages"] as const;

export const useAllUserMessages = (
  userId?: number,
  options?: Omit<
    UseQueryOptions<
      UniqueMessage[] | null,
      Error,
      UniqueMessage[] | null,
      typeof QUERY_KEY
    >,
    "queryKey"
  >
) => {
  return useQuery<
    UniqueMessage[] | null,
    Error,
    UniqueMessage[] | null,
    typeof QUERY_KEY
  >({
    queryKey: QUERY_KEY,
    queryFn: () => {
      if (userId === undefined) {
        // Should never call if no userId
        return Promise.resolve(null);
      }
      return getAllUserMessages(userId);
    },
    enabled: Boolean(userId), // only fetch if userId is defined
    ...options,
  });
};
