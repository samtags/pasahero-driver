import storage from "@/src/services/storage";
import log from "@/src/services/log";
import JSON from "@/src/services/json";

export default function handleSetDestination({
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
    log.warn("Failed to parse trip.draft in last transit search.");
  }

  if (!draft.last) draft.last = {};

  if (latitude) draft.last.latitude = latitude;
  if (longitude) draft.last.longitude = longitude;
  if (shortAddress) draft.last.shortAddress = shortAddress;
  if (longAddress) draft.last.longAddress = longAddress;

  storage.set("trip.draft", JSON.stringify(draft));
  log.debug("Updated trip.draft", {draft, latitude, longitude, shortAddress, longAddress}) // prettier-ignore
}
