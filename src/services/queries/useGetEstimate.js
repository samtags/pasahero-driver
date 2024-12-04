import { useQuery } from "@tanstack/react-query";
import getEstimate from "../api/getEstimate";
import { decimal } from "../util/amount";

export default function useGetEstimate(service, origin, destination) {
  return useQuery({
    queryKey: ["getEstimate", { service, origin, destination }],
    queryFn: async () => {
      if (!service || !origin || !destination) return null;

      if (origin.includes("undefined") || destination.includes("undefined"))
        return null;

      const estimate = await getEstimate({ service, origin, destination });

      if (estimate?.fare?.minFare && estimate?.fare?.maxFare) {
        let estimatePreview;
        let formattedMinFare = decimal.format(estimate?.fare?.minFare);
        let formattedMaxFare = decimal.format(estimate?.fare?.maxFare);

        estimatePreview = `${formattedMinFare} - ${formattedMaxFare}`;

        if (estimate?.fare) {
          estimate.fare.estimatePreview = estimatePreview;
        }
      }

      return estimate;
    },
    enabled: !!service && !!origin && !!destination,
    staleTime: 1000 * 60 * 15,
  });
}
