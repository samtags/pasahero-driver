import axios from "axios";
import storage from "@/src/services/storage";

export default async function takeTripRequest(id) {
  console.debug("Received take trip request", { id });
  const service = storage.getString("user.service");
  const profile_id = storage.getString("user.profile_id");

  try {
    await axios.post("https://driver.pasahero.app/trips-request", {
      id,
      service,
      profile_id,
    });

    console.debug("Taken trip request success!", { id });
    return true;
  } catch (err) {
    console.warn("Unable to take trip request", err);
    return false;
  }
}
