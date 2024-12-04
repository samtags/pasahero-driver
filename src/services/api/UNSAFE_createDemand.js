import supabase from "../supabase";

export default async function UNSAFE_createDemand(passenger_id) {
  // create match entry
  const { data: match } = await supabase
    .from("matches")
    .insert({
      passenger_id,
    })
    .select("id")
    .single();

  // create demand entry
  if (match) {
    const { data: demand } = await supabase
      .from("demands")
      .insert({
        match_id: match.id,
        cell_index: "85283473fffffff",
      })
      .select("id")
      .single();

    await supabase.rpc("transfer", {
      sender_id: passenger_id,
      receiver_id: "PasaHero Driver",
      amount: 5,
    });

    return {
      match_id: match.id,
      demand_id: demand.id,
    };
  }
}
