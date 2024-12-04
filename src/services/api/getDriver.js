import supabase from "../supabase";
import log from "../log";

/**
 *
 * @param {string} driver_id
 */
export default async function getDriver(driver_id) {
  const { data, error } = await supabase
    .from("drivers")
    .select("active_services, display_name, plate_number, model, image_url")
    .eq("user_id", driver_id)
    .single();

  if (error) {
    log.warn("Unable to get driver details", { error, driver_id });
    return null;
  }

  return data;
}
