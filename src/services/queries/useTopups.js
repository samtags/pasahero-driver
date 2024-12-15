import { useQuery } from "@tanstack/react-query";
import getTopups from "../api/getTopups";
import getQueryClient from ".";

export default function useTopups() {
  return useQuery({
    queryKey: ["getTopups"],
    queryFn: async () => {
      const topups = await getTopups();
      return topups;
    },
  });
}

export function resetTopups() {
  const client = getQueryClient();
  return client.invalidateQueries(["getTopups"]);
}
