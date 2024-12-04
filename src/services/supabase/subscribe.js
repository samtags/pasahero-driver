import supabase from ".";
import log from "../log";

export default function subscribe(table, id, callback) {
  const channel = supabase
    .channel(`${table}.${id}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table,
        filter: `id=eq.${id}`,
      },
      (payload) => {
        log.debug("Record update detected", { data: payload.new, table, id });
        callback(payload.new);
      }
    )
    .subscribe();

  log.debug(`Subscribe to ${table} changes`, { id });

  return () => {
    channel.unsubscribe();
    log.debug(`Unsubscribed from ${table} changes`, { id });
  };
}
