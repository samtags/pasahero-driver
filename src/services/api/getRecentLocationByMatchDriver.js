import log from "@/src/services/log";
import supabase from "../supabase";

/**
 * @typedef Payload
 * @property {string} match_id
 * @property {string} driver_id
 *
 *
 * @param {Payload} payload
 */
export default async function getRecentLocationByMatchDriver(payload) {
  log.debug("Initializing get recent location by match driver.", payload);

  const { error, data } = await supabase
    .from("match_history")
    .select("location")
    .eq("match_id", payload.match_id)
    .eq("user_id", payload.driver_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    log.warn("Unable to get driver location", { error, payload });
    return undefined;
  }

  if (!data) {
    log.warn("No recent location found in match history", payload);
    return undefined;
  }

  log.debug("Recent driver location found.", {
    location: data?.location,
    payload,
  });

  return data?.location;
}
