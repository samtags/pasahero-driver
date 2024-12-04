import { useQuery } from "@tanstack/react-query";
import { useMMKVString } from "react-native-mmkv";
import getWallet from "../api/getWallet";

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
