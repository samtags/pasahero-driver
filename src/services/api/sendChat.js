import axios from "axios";
import log from "@/src/services/log";

export default async function sendChat({
  message,
  message_id,
  sender_id,
  receiver_id,
  trip_id,
}) {
  const payload = {
    message,
    message_id,
    sender_id,
    receiver_id,
    trip_id,
  };

  console.debug("Send chat request received.", payload);

  const req = await axios.post(
    "https://passenger.pasahero.app/notifications/chat",
    payload
  );

  if (req.status === 200) {
    log.debug("Successfully sent chat.", { payload, response: req.data });
    return req.data;
  }

  log.warn("Unable to send chat.", { payload, response: req.data });
  return Promise.reject(req.data);
}
