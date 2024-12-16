import { useQuery } from "@tanstack/react-query";
import getTransactions from "@/src/services/api/getTransactions";

export default function useTransactions() {
  return useQuery({
    queryKey: ["getTransactions"],
    queryFn: async () => {
      return await getTransactions();
    },
  });
}
