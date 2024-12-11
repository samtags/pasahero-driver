import axios from "axios";
import storage from "@/src/services/storage";

export default async function getNearbyTrips(latitude, longitude) {
  const service = storage.getString("user.service") || "angkas";
  const url = `https://driver.pasahero.app/trip-nearby?latitude=${latitude}&longitude=${longitude}&service=${service}`;

  console.debug("Received request to get nearby trips", {url, service, longitude, latitude}); // prettier-ignore

  const response = await axios.get(url);

  console.debug("Get nearby trips response:", response.data);

  return response.data || [];
}
