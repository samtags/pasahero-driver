import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import getQueryClient from ".";
import storage from "../storage";
import log from "../log";

/**
 *
 * @param {string} input
 */
export default function useMatches() {
  const user = useUser();

  return useQuery({
    queryKey: ["getMatches", user?.user?.id],
    queryFn: async () => {
      if (!user?.user?.id) return [];

      return [];
    },
  });
}

export function invalidateUseMatches() {
  const client = getQueryClient();
  const userId = storage.getString("user.id");

  log.debug("Invalidating matches query", { userId, client });

  if (client && userId) {
    client.invalidateQueries(["getMatches", userId]);
  }
}
