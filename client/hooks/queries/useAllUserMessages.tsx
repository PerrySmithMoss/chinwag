import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAllUserMessages } from "../../api/message";
import { ThreadMessage } from "../../interfaces/Message";

const queryKey = (userId?: number) => ["allUserMessages", userId] as const;

export const useAllUserMessages = (
  userId?: number,
  options?: Omit<
    UseQueryOptions<
      ThreadMessage[] | null,
      Error,
      ThreadMessage[] | null,
      ReturnType<typeof queryKey>
    >,
    "queryKey"
  >
) => {
  return useQuery<
    ThreadMessage[] | null,
    Error,
    ThreadMessage[] | null,
    ReturnType<typeof queryKey>
  >({
    queryKey: queryKey(userId),
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
