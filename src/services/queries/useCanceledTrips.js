import { useQuery } from "@tanstack/react-query";
import getCanceledTrips from "../api/getCanceledTrips";
import { useMMKVString } from "react-native-mmkv";

export default function useCanceledTrips() {
  const [userId] = useMMKVString("user.id");
  return useQuery({
    queryKey: ["getCanceledTrips", userId],
    queryFn: async () => {
      if (!userId) return [];

      const matches = await getCanceledTrips(userId);
      return matches;
    },
    staleTime: 1000 * 60 * 15, // 15 mins
  });
}
