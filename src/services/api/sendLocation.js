import axios from "axios";
import storage from "@/src/services/storage";

export default async function sendLocation(location) {
  console.info("Received send location request.", location);

  location.id = storage.getString("user.id");
  location.service = storage.getString("user.service");
  location.controller = storage.getString("controller.status");

  const response = await axios.post(
    "https://driver.pasahero.app/location",
    location
  );

  if (response.status === 200) {
    console.debug("Send location request sent.");
    return true;
  }

  console.debug("Unable to send location request.");
  return false;
}
