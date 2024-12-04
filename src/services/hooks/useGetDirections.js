import { useQuery } from "@tanstack/react-query";
import getDirections from "../api/getDirections";

export default function useGetDirections(origin, destination) {
  return useQuery({
    queryKey: ["getDirections", origin, destination],
    queryFn: async () => {
      if (!origin || !destination) return null;

      const directions = await getDirections(origin, destination);
      return directions;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
