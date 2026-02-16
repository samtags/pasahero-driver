import axios from "@/src/services/axios";
import storage from "@/src/services/storage";

export default async function sendLocation(location) {
  console.debug("Received send location request.", location);

  location.id = storage.getString("user.id");
  location.service = storage.getString("user.service");
  location.controller = storage.getString("controller.status");

  const response = await axios.post(
    "https://driver-93954675246.asia-southeast1.run.app/location",
    location,
  );

  if (response.status === 200) {
    console.debug("Send location request sent.");
    return true;
  }

  console.debug("Unable to send location request.");
  return false;
}
