import supabase from "../supabase";

export default async function getCompletedTrips(id) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id, passenger_id, created_at, status, first_point, last_point, services, fare"
    )
    .eq("passenger_id", id)
    .eq("status", "PASSENGER_CANCELED")
    .order("created_at", { ascending: false });

  if (error) return [];

  return matches || [];
}
