import log from "../log";
import supabase from "../supabase";

/**
 *
 * @param {string} id
 */
export default async function getMatchById(id) {
  log.debug("Initiating get match details by id", { id });

  const { error, data } = await supabase
    .from("matches")
    .select("id, first_point, last_point, driver_id, driver_location")
    .eq("id", id)
    .single();

  if (error) {
    log.error("Unable to get match details", { error, id });
    return undefined;
  }

  log.debug("Match details by id retrieved.", { data, id });
  return data;
}
