import { useQuery } from "@tanstack/react-query";
import getCompletedTrips from "../api/getCompletedTrips";
import { useMMKVString } from "react-native-mmkv";

export default function useCompletedTrips() {
  const [userId] = useMMKVString("user.id");
  return useQuery({
    queryKey: ["getCompletedTrips", userId],
    queryFn: async () => {
      if (!userId) return [];

      const matches = await getCompletedTrips(userId);
      return matches;
    },
    staleTime: 1000 * 60 * 15, // 15 mins
  });
}
