import { useQuery } from "@tanstack/react-query";
import getDriver from "../api/getDriver";

/**
 * @deprecated - use useGetDriverProfile instead
 * @param {string} driver_id
 */
export default function useGetDriver(driver_id) {
  return useQuery({
    queryKey: ["getDriver", driver_id],
    queryFn: async () => {
      if (!driver_id) return null;

      const driver = await getDriver(driver_id);
      return driver;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
