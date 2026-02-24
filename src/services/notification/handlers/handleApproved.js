import { Platform, ToastAndroid, Vibration } from "react-native";
// import { handleInvalidateGetProfiles } from "@/src/services/queries/useGetProfiles";
import localPushNotification from "@/src/services/notification/localPushNotification";
import log from "@/src/services/log";

export default function handleApproved(data, notification) {
  if (!data) return;
  if (Object.keys(data).length === 0) return;

  if (!data?.notification?.title) {
    log.warn(
      "No notification title found in approved notification. Ignoring push notification",
      data,
    );
    return;
  }

  if (!data?.notification?.body) {
    log.warn(
      "No notification body found in approved notification. Ignoring push notification",
      data,
    );
    return;
  }

  // show notification
  localPushNotification({
    title: data.notification.title,
    body: data.notification.body,
  });

  if (Platform.OS === "android") {
    setTimeout(() => {
      ToastAndroid.show("Start accepting trips now!", ToastAndroid.LONG);
      Vibration.vibrate(150);
    }, 5000);
  }

  // invalidate getProfiles query
  // handleInvalidateGetProfiles();
}
