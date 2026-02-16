import { useQuery } from "@tanstack/react-query";
import getQueryClient from ".";
import storage from "../storage";
import log from "@/src/services/log";
import { useMMKVString } from "react-native-mmkv";
import getTrips from "../api/getTrips";

export default function useTrips() {
  const [userId] = useMMKVString("user.id");

  return useQuery({
    queryKey: ["getTrips", userId],
    queryFn: async () => {
      if (!userId) return [];

      const trips = await getTrips(userId);
      return trips;
    },
  });
}

export function resetTrips() {
  const client = getQueryClient();
  const userId = storage.getString("user.id");

  log.debug("Resetting use trips query", { userId, client });

  if (client && userId) {
    client.invalidateQueries(["getTrips", userId]);
  }
}
