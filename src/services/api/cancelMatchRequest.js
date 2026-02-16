import axios from "@/src/services/axios";
import log from "@/src/services/log";

export default async function cancelMatchRequest({ id }) {
  log.debug("Initiating cancel match request.", { id });
  try {
    const res = await axios.post(
      "https://passenger-93954675246.asia-southeast1.run.app/trip-cancel",
      {
        id,
      },
    );

    log.debug("Successfully canceled match request.", { id });

    return res?.data;
  } catch (error) {
    return null;
  }
}
