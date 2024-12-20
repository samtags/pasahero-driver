import { useQuery } from "@tanstack/react-query";
import getTransactions from "@/src/services/api/getTransactions";
import getQueryClient from ".";

export default function useTransactions() {
  return useQuery({
    queryKey: ["getTransactions"],
    queryFn: async () => {
      return await getTransactions();
    },
  });
}

export function resetTransactions() {
  const client = getQueryClient();
  client?.invalidateQueries(["getTransactions"]);
}
