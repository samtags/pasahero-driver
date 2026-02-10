import axios from "axios";
import log from "../log";

export default async function rebook(id) {
  try {
    log.debug("Initiating find nearby drivers from rebook.", { id });

    const res = await axios.post(
      "https://passenger-93954675246.asia-southeast1.run.app/trip-rebook",
      {
        id,
      },
    );

    log.debug("Successfully rebook trip request.", { res });
    return res?.data;
  } catch (error) {
    log.debug("Unable to find nearby drivers from rebook", { error });
    return null;
  }
}
