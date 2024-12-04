import { useQuery } from "@tanstack/react-query";
import getCoordinatesByPlaceId from "../api/getCoordinatesByPlaceId";

/**
 *
 * @param {string} input
 */
export default function useGetCoordinates(id, lat = 0, lng = 0) {
  return useQuery({
    queryKey: ["getCoordinatesByPlaceId", id],
    queryFn: async () => {
      if (!id)
        return {
          latitude: 0,
          longitude: 0,
        };

      if (lat && lng) {
        return {
          latitude: Number(lat),
          longitude: Number(lng),
        };
      }

      const res = await getCoordinatesByPlaceId(id);

      const latitude = res?.Geometry?.Point[1];
      const longitude = res?.Geometry?.Point[0];

      if (!latitude || !longitude) {
        return {
          latitude: 0,
          longitude: 0,
        };
      }

      return { latitude, longitude };
    },
    staleTime: 1000 * 60 * 30,
  });
}
