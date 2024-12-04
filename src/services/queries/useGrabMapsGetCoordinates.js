import { useQuery } from "@tanstack/react-query";
import getCoordinatesByPlaceId from "@/src/services/api/getCoordinatesByPlaceId";

/**
 *
 * @param {string} input
 */
export default function useGetCoordinatesByPlaceId(id, lat = 0, lng = 0) {
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

      return {
        latitude: res?.Place?.Geometry?.Point[1],
        longitude: res?.Place?.Geometry?.Point[0],
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
