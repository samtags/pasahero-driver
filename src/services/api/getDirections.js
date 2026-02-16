import axios from "@/src/services/axios";
import log from "@/src/services/log";

/**
 * @param {string} origin "12.9722,77.5961"
 * @param {string} destination "12.9722,77.5961"
 */
export default async function getDirections(origin, destination) {
  log.debug("Getting directions", { origin, destination, type: "network" });

  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/directions/json",
    {
      params: {
        origin,
        destination,
        key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        avoid: "tolls",
        mode: "driving",
        units: "metric",
      },
    },
  );

  return response?.data;
}
