import axios from "@/src/services/axios";
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
    "https://passenger-93954675246.asia-southeast1.run.app/notifications/chat",
    payload,
  );

  if (req.status === 200) {
    log.debug("Successfully sent chat.", { payload, response: req.data });
    return req.data;
  }

  log.warn("Unable to send chat.", { payload, response: req.data });
  return Promise.reject(req.data);
}
