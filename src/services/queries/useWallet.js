import { useQuery } from "@tanstack/react-query";
import { useMMKVString } from "react-native-mmkv";
import getWallet from "@/src/services/api/getWallet";
import getQueryClient from ".";
import storage from "@/src/services/storage";

export default function useWallets() {
  const [userId] = useMMKVString("user.id");

  return useQuery({
    queryKey: ["getWallet", userId],
    queryFn: async () => {
      if (!userId) return null;

      const wallet = await getWallet(userId);
      return wallet || null;
    },
  });
}

export function resetWallet() {
  const client = getQueryClient();
  const userId = storage.getString("user.id");

  log.debug("Invalidating wallet query", { userId, client });

  if (client && userId) {
    client.invalidateQueries(["getWallet", userId]);
  }
}
