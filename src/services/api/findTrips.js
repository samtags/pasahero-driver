import axios from "axios";
import storage from "@/src/services/storage";

export default async function findTrips(location, service) {
  console.debug("Received find trip request.", { location, service });
  const driver_id = storage.getString("user.id");

  const response = await axios.get("https://driver.pasahero.app/find-trips", {
    params: {
      service,
      driver_id,
      longitude: location.longitude,
      latitude: location.latitude,
      heading: location.heading,
    },
  });

  if (response.status === 200) {
    console.debug("Find trip request sent.");
    return true;
  }

  console.debug("Unable to send find trip request.");
  return false;
}
