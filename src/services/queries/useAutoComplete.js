import { useQuery } from "@tanstack/react-query";
import autoComplete from "../api/autoComplete";

/**
 *
 * @param {string} input
 */
export default function useAutoComplete(input) {
  return useQuery({
    queryKey: ["autoComplete", input],
    queryFn: async () => {
      if (!input) return [];

      const res = await autoComplete(input);

      res.data?.forEach((item) => {
        let shortAddress = item?.Text?.split(",")?.[0];

        if (shortAddress.length < 3) {
          shortAddress = shortAddress + " " + item?.Text.split(",")?.[1];
        }

        item.Description = shortAddress;
      });

      return res.data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
