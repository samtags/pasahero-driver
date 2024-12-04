import supabase from "../supabase";

export default async function getMatches(id) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id, passenger_id, created_at, status, first_point, last_point, estimatePreview, platform, profile_id"
    )
    .eq("passenger_id", id)
    .neq("status", "PASSENGER_CANCELED")
    .neq("status", "DRIVER_CANCELED")
    .neq("status", "REQUEST_TIMEOUT")
    .neq("status", "DONE");

  if (error) return [];

  return matches || [];
}
