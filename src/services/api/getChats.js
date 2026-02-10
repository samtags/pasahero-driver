import axios from "axios";
import log from "../log";

export default async function getChats(trip_id) {
  log.debug("Retrieving chat messages for trip", { trip_id });

  const req = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/notifications/chat",
    {
      params: {
        trip_id,
      },
    },
  );

  log.debug("Chat messages retrieved.", req?.data);

  return req?.data || [];
}
