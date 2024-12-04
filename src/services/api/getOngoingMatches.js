import supabase from "../supabase";

export default async function getOngoingMatches(id) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, passenger_id, created_at, status")
    .eq("passenger_id", id)
    .neq("status", "PASSENGER_CANCELLED")

    .or(
      "status.neq.DONE",
      "status.neq.PASSENGER_CANCELED",
      "status.neq.DRIVER_CANCELED"
    );

  if (error) return [];

  return matches || [];
}
