import { useQuery } from "@tanstack/react-query";
import reverseGeocode from "../api/reverseGeocoding";

export default function useReverseGeocoding(lat = 0, lng = 0) {
  return useQuery({
    queryKey: ["reverseGeocoding", lat, lng],
    queryFn: async () => {
      if (!lat && !lng) {
        return [];
      }

      const res = await reverseGeocode(`${lat},${lng}`);
      if (res.data.status === "OK") return res.data.results;

      return [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
