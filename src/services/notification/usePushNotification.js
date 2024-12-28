import { useEffect } from "react";
import { useMMKVString } from "react-native-mmkv";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as handler from "./handlers";
import JSON from "@/src/services/json";
import router from "@/src/services/router";

export default function usePushNotification() {
  const [userId] = useMMKVString("user.id");

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.debug("User tap on push notification.", response);

        const interaction =
          response?.notification?.request?.content?.data?.interaction;

        if (interaction === "handler") {
          const method =
            response?.notification?.request?.content?.data?.handler;
          handler?.[method]?.(JSON.parse(response?.notification?.request?.content?.data?.extras, {}), response); // prettier-ignore
        }

        const notificationRoute =
          response?.notification?.request?.content?.data?.route;

        if (notificationRoute) {
          const params =
            response.notification.request.content.data.params || {};

          router.navigate({
            pathname: notificationRoute,
            params,
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      messaging()
        .subscribeToTopic(userId)
        .then(() =>
          console.debug("Subscribed to firebase cloud messaging via topic.", {
            userId,
            topic: userId,
          })
        )
        .catch(
          (err) => console.warn("Unable to subscribe to topic.", { userId, topic: userId, error: err }) // prettier-ignore
        );

      return () => {
        messaging()
          .unsubscribeFromTopic(userId)
          .finally(() =>
            console.debug("Unsubscribed from topic.", { userId, topic: userId })
          );
      };
    }
  }, [userId]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const onForegroundMessageSubscription = messaging().onMessage(
      async (remoteMessage) => {
        console.debug("Incoming push notification", remoteMessage);

        const payload = remoteMessage?.data;
        console.debug("Push notification payload", payload);

        const interaction = payload?.interaction;

        if (interaction === "handler") {
          const method = payload?.handler;

          const notification = {
            body: remoteMessage.notification.body,
            title: remoteMessage.notification.title,
            messageId: remoteMessage.messageId,
            topic: remoteMessage.from,
            sentTime: remoteMessage.sentTime,
            ttl: remoteMessage.ttl,
          };

          handler?.[method]?.(JSON.parse(payload?.extras), notification);
        }
      }
    );

    const onBackgroundMessageSubscription =
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.debug(
          "Incoming push notification from background",
          remoteMessage
        );

        if (!remoteMessage) return;

        const payload = JSON.parse(remoteMessage?.data?.body, {});
        console.debug("Push notification payload", payload);

        if (payload?.evaluation === "onReceive") {
          const interaction = payload?.interaction;

          if (interaction === "handler") {
            const method = payload?.extras?.handler;
            const notification = {
              body: remoteMessage.notification.body,
              title: remoteMessage.notification.title,
              messageId: remoteMessage.messageId,
              topic: remoteMessage.from,
              sentTime: remoteMessage.sentTime,
              ttl: remoteMessage.ttl,
            };

            handler?.[method]?.(payload?.extras, notification);
          }
        }
      });

    return () => {
      console.debug("Unsubscribing to foreground message subscription.");
      onForegroundMessageSubscription?.();
      onBackgroundMessageSubscription?.();
    };
  }, []);
}

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync(); // prettier-ignore
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("User opted out of notifications.");
    }
  } else {
    console.warn("Must use physical device for Push Notifications");
  }
}

Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
