import { useQuery } from "@tanstack/react-query";
import getDriverProfile from "../api/getDriverProfile";

/**
 *
 * @param {string} profile_id
 */
export default function useGetDriverProfile(profile_id) {
  return useQuery({
    queryKey: ["getDriverProfile", profile_id],
    queryFn: async () => {
      if (!profile_id) return null;

      const driver = await getDriverProfile(profile_id);
      return driver;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
