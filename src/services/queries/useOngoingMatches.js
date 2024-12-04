import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import getOngoingMatches from "../api/getOngoingMatches";

/**
 *
 * @param {string} input
 */
export default function useOngoingMatches() {
  const user = useUser();
  return useQuery({
    queryKey: ["getOngoingMatches", user?.user?.id],
    queryFn: async () => {
      if (!user?.user?.id) return [];

      const matches = await getOngoingMatches(user?.user?.id);
      return matches;
    },
  });
}
