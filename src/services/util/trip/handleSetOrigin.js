import storage from "@/src/services/storage";
import log from "@/src/services/log";
import JSON from "@/src/services/json";

export function handleSetOrigin({
  latitude,
  longitude,
  shortAddress,
  longAddress,
}) {
  let draft = {};

  try {
    const _matchDraft = storage.getString("trip.draft");
    log.debug("Got trip.draft", { data: _matchDraft });
    draft = JSON.parse(_matchDraft);
  } catch {
    log.warn("Failed to parse trip.draft in set origin handler");
  }

  if (!draft.first) draft.first = {};

  draft.first = { latitude, longitude, shortAddress, longAddress };

  storage.set("trip.draft", JSON.stringify(draft));
  log.debug("Updated trip.draft in set origin handler", {draft, latitude, longitude, shortAddress, longAddress}) // prettier-ignore
}
