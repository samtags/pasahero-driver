import storage from "@/src/services/storage";
import axios from "axios";

export default async function getOngoingTrips() {
  console.debug("Received request to get ongoing trips.");
  const id = storage.getString("user.id");

  const response = await axios.get(
    "https://driver.pasahero.app/ongoing-trips?driver_id=" + id
  );

  console.debug("Ongoing trip request response.", response);

  return response?.data || [];
}
