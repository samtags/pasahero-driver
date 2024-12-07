import axios from "axios";
import storage from "@/src/services/storage";

export default async function findTrips(location, service) {
  console.log("Received find trip request.");
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
    console.log("Find trip request sent.");
    return true;
  }

  console.log("Unable to send find trip request.");
  return false;
}
