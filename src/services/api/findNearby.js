import axios from "@/src/services/axios";
import log from "@/src/services/log";

/**
 *
 * @param {Payload} param0
 * @returns
 */
export default async function findNearby(payload) {
  const {
    user_id,
    first_point,
    last_point,
    services,
    estimatePreview,
    fare,
    notes,
    payment_method,
    will_add_tip,
  } = payload;

  try {
    log.debug("Initiating find nearby drivers.", payload);

    const res = await axios.post("https://demand-2h6pkmfalq-et.a.run.app", {
      user_id,
      latitude: first_point.latitude,
      longitude: first_point.longitude,
      first_point,
      last_point,
      services,
      estimatePreview,
      fare,
      notes,
      payment_method,
      will_add_tip,
    });

    log.debug("Successfully created trip request.", { res });
    return res?.data;
  } catch (error) {
    log.debug("Unable to find nearby drivers", { error });
    return null;
  }
}

/**
 *
 * @typedef Transit
 * @property {latitude} number
 * @property {longitude} number
 * @property {short_address} string
 * @property {long_address} string
 *
 * @typedef Payload
 * @property {string} user_id
 * @property {Transit} first_point
 * @property {Transit} last_point
 */
