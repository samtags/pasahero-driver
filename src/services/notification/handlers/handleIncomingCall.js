// import RNCallKeep from "react-native-callkeep";
import log from "../../log";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import storage from "../../storage";

/**
 *
 * @param {import("./handler").Payload} payload
 * @param {import("./handler").Ctx} ctx
 */
export async function handleIncomingCall(payload, ctx) {
  log.debug("Handle incoming call using fcm.", { payload, ctx });

  // Shows the incoming widget in the background
  if (payload.sessionId && payload.displayName && payload.displayNumber) {
    log.debug("Opened incoming call widget.", { payload, ctx });
    // RNCallKeep.displayIncomingCall(
    //   payload.sessionId,
    //   payload.displayName,
    //   payload.displayNumber,
    //   "generic",
    //   true
    // );
  } else {
    log.debug("Incoming call payload is incomplete.", { payload, ctx });
    return;
  }

  function removePushNotification() {
    log.debug("Removing push notification.", { payload, ctx });

    // get all the push notifications displayed
    Notifications.getPresentedNotificationsAsync().then((notifications) => {
      const notificationIds = [];

      // find the notification that matches the incoming call
      log.debug("Presented notifications.", { notifications });
      notifications.forEach((n) => {
        if (n.request.content.title === ctx.title)
          notificationIds.push(n.request.identifier);
      });

      // only dismiss the notifications that match the incoming call
      notificationIds.forEach((id) =>
        Notifications.dismissNotificationAsync(id)
      );
    });
  }

  log.debug("Adding answer call event listener.");
  // RNCallKeep.addEventListener("answerCall", (callId) => {
  //   log.debug("Answer call event fired.", { callId });
  //   removePushNotification();
  //   RNCallKeep.backToForeground();
  //   RNCallKeep.endCall(callId.callUUID);

  //   setTimeout(() => {
  //     const sessionIds = storage.getString("__tmp.handledCallSessionIds"); // prettier-ignore

  //     if (sessionIds?.includes(payload.sessionId)) {
  //       log.debug("Skipping call handling from incoming call widget because the call is already handled.", { sessionId: payload.sessionId }); // prettier-ignore
  //       return;
  //     }

  //     router.navigate({
  //       pathname: "/call/answer",
  //       params: {
  //         roomId: payload.roomId,
  //         alreadyAccepted: true,
  //       },
  //     });

  //     const handledCallSessionIds = storage.getString("__tmp.handledCallSessionIds"); // prettier-ignore
  //     const ids = handledCallSessionIds?.split(",") ?? [];
  //     ids.push(payload.sessionId);
  //     storage.set("__tmp.handledCallSessionIds", ids.join(","));

  //     log.debug("Removing answer call event listener.");
  //   });
  // });

  // RNCallKeep.addEventListener("endCall", (callId) => {
  //   removePushNotification();
  // });
}
