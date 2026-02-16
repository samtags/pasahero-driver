import axios from "@/src/services/axios";
import log from "@/src/services/log";

/**
 *
 * @param {Payload} payload
 * @returns
 */
export default async function sendIncomingCallSignal({
  displayName,
  displayNumber,
  sessionId,
  roomId,
}) {
  log.debug('Sending incoming call signal.', { displayName, displayNumber, sessionId, roomId }); // prettier-ignore

  return await axios.post(
    "https://comms-93954675246.asia-southeast2.run.app/push-notification",
    {
      topic: roomId,
      title: "Missed call",
      message: "Your passenger tried to call you.",
      payload: JSON.stringify({
        interaction: "handler",
        evaluation: "onReceive",
        extras: {
          handler: "handleIncomingCall",
          displayName,
          displayNumber,
          sessionId,
          roomId,
        },
      }),
    },
  );
}

/**
 * @typedef Payload
 * @property {string} match_id
 * @property {string} displayName
 * @property {string} displayNumber
 */
