import axios from "axios";
import log from "../log";

export default async function completeMatch({ id }) {
  log.debug("Initiating cancel match request.", { id });
  try {
    const res = await axios.get(
      `https://matches-2h6pkmfalq-et.a.run.app/passenger/complete/${id}`
    );

    log.debug("Successfully canceled match request.", { id });

    return res?.data;
  } catch (error) {
    return null;
  }
}
