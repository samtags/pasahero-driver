import log from "@/src/services/log";
import supabase from "../supabase";

export default async function initializeWallet(id) {
  log.debug("Initiating upsert wallet.", { id });

  const { error } = await supabase
    .from("wallet")
    .upsert({ user_id: id })
    .select();

  if (error?.message?.includes("duplicate")) {
    log.debug("Wallet already exists.");
  } else {
    log.warn("Upsert wallet error.", { error });
  }
}
