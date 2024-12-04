import log from "../log";
import supabase from "../supabase";

export default async function initializeUser(id, payload = {}) {
  log.debug("Initiating upsert user.", { id });

  const { error } = await supabase
    .from("passengers")
    .upsert({ ref: id, ...payload })
    .select();

  if (error?.message.includes("duplicate")) {
    log.debug("User already exists.");
  } else {
    log.warn("Upsert user error.", { error });
  }
}
