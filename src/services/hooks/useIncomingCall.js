import db from "@/src/services/firebase/db";
import { useEffect } from "react";
import storage from "@/src/services/storage";
import log from "@/src/services/log";
import { useMMKVString } from "react-native-mmkv";
import router from "@/src/services/router";

export default function useIncomingCall() {
  const [userId] = useMMKVString("user.id");

  useEffect(() => {
    const ref = db.collection("rooms").doc(userId);

    const unsubscribe = ref.onSnapshot(async (e) => {
      if (!e.metadata?.fromCache) {
        if (e.exists) {
          const doc = e.data();
          if (doc.status === "CONNECTING" && doc.offer) {
            const sessionId = doc.sessionId;

            setTimeout(async () => {
              log.debug("Received incoming call event from snapshot.");
              const handledCallSessionIds = storage.getString("__tmp.handledCallSessionIds"); // prettier-ignore

              if (handledCallSessionIds?.includes(sessionId)) {
                log.debug("Skipping call handling because the call is already handled in the incoming call widget.", { sessionId }); // prettier-ignore
                return;
              }

              await ref.update({ status: "RINGING" });
              router.navigate({
                pathname: "/ring",
                params: {
                  roomId: userId,
                  sessionId,
                },
              });

              // flag the sessionId as handled
              const sessionIds = handledCallSessionIds?.split(",") || [];
              sessionIds.push(sessionId);
              storage.set("__tmp.handledCallSessionIds", sessionIds.join(","));
            }, 3000);
          }
        }
      }
    });

    return () => unsubscribe?.();
  }, [userId]);
}
