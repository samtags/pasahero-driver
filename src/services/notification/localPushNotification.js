import * as Notifications from "expo-notifications";
import log from "@/src/services/log";

// this is immediate an immediate notification
export default function localPushNotification({ title, body, data = {} }) {
  log.debug("Triggering local push notification", { title, body, data });

  // local notification example
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null,
  })
    .then((notification) => {
      log.debug("Local push notification sent.", { notification });
    })
    .catch((err) => {
      log.debug("Unable to send local push notification", { error: err });
    });
}
