import { useQuery } from "@tanstack/react-query";
import getBalance from "../api/getWallet";

/**
 *
 * @param {string} input
 */
export default function useGetBalance(id) {
  return useQuery({
    queryKey: ["getBalance", id],
    queryFn: async () => {
      if (!id) return { balance: 0 };
      return await getBalance(id);
    },
    staleTime: 1000 * 60 * 30,
  });
}
