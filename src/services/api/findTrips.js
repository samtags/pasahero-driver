import axios from "axios";
import storage from "@/src/services/storage";

export default async function findTrips(location, service) {
  const driver_id = storage.getString("user.id");
  console.debug("Received find trip request.", {
    location,
    service,
    driver_id,
  });

  const response = await axios
    .get("https://driver-93954675246.asia-southeast1.run.app/find-trips", {
      params: {
        service,
        driver_id,
        longitude: location.longitude,
        latitude: location.latitude,
        heading: location.heading,
      },
    })
    .catch((err) => {
      console.debug("Unable to find trips.", {
        err,
        location,
        service,
        driver_id,
      });
    });

  if (response.status === 200) {
    console.debug("Find trip request sent.");
    return true;
  }

  console.debug("Unable to send find trip request.");
  return false;
}
