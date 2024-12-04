import supabase from "../supabase";
import log from "../log";

/**
 *
 * @param {string} profile_id
 */
export default async function getDriverProfile(profile_id) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, platform, image_url, vehicle_plate_number, vehicle_model, vehicle_make"
    )
    .eq("id", profile_id)
    .single();

  if (error) {
    log.warn("Unable to get profile details", { error, profile_id });
    return null;
  }

  return data;
}
