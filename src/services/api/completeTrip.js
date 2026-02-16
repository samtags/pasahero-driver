import axios from "@/src/services/axios";
import log from "@/src/services/log";

export default async function completeTrip(id) {
  log.debug("Initiating complete trip.", { id });
  try {
    const res = await axios.post(
      `https://passenger-93954675246.asia-southeast1.run.app/trip-complete`,
      { id },
    );
    log.debug("Trip completed.", { id });
    return res?.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
