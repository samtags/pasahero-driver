import { useQuery } from "@tanstack/react-query";
import getFare from "@/src/services/api/getFare";

export default function useGetFare(service, origin, destination) {
  return useQuery({
    queryKey: ["getFare", { service, origin, destination }],
    queryFn: async () => {
      if (!service || !origin || !destination) return null;

      if (origin.includes("undefined") || destination.includes("undefined"))
        return null;

      const estimate = await getFare({ service, origin, destination });

      return estimate;
    },
    enabled: !!service && !!origin && !!destination,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
