import { Platform, ToastAndroid, Vibration } from "react-native";
// import { handleInvalidateGetProfiles } from "@/src/services/queries/useGetProfiles";
import localPushNotification from "@/src/services/notification/localPushNotification";

export default function handleApproved(data, notification) {
  if (!data) return;
  if (Object.keys(data).length === 0) return;

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
