import axios from "@/src/services/axios";
import log from "@/src/services/log";

/**
 *
 * @param {Payload} param0
 * @returns
 */
export default async function createTrip(payload) {
  const {
    passenger_id,
    first_point,
    last_point,
    services,
    estimated_preview,
    fare,
    notes,
    payment_method,
    will_add_tip,
  } = payload;

  try {
    log.debug("Initiating find nearby drivers.", payload);

    const res = await axios.post(
      "https://passenger-93954675246.asia-southeast1.run.app/trip-request",
      {
        passenger_id, // changed
        first_point,
        last_point,
        services,
        estimated_preview, // changed
        fare,
        notes,
        payment_method,
        will_add_tip,
      },
    );

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
