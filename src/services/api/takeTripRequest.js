import axios from "axios";
import storage from "@/src/services/storage";

export default async function takeTripRequest(id) {
  const driver_id = storage.getString("user.id");
  const profile_id = storage.getString("user.profile_id");
  console.debug("Received take trip request", { id, driver_id, profile_id });

  try {
    await axios.post(
      "https://driver-93954675246.asia-southeast1.run.app/take-trip",
      {
        id,
        driver_id,
        profile_id,
      },
    );

    console.debug("Taken trip request success!", { id });
  } catch (error) {
    console.warn("Unable to take trip request", error.response);
    return Promise.reject(error.response);
  }
}
