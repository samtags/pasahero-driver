import { useMMKVString } from "react-native-mmkv";
import { useEffect } from "react";
import subscribe from "@/src/services/realtime";
import router from "@/src/services/router";
import { handleSetStatus } from "@/src/services/controller";
import handlePlayIncomingTripSound from "@/src/services/notification/handlePlayIncomingTripSound";

export default function useSubscribeToIncomingTrip() {
  const [user] = useMMKVString("user.id");
  const [status] = useMMKVString("controller.status");

  useEffect(() => {
    let unsubscribe;
    if (user && status === "ACTIVE") {
      console.debug(`Subscribing to trip_request.${user}`);

      unsubscribe = subscribe(`trip_request.${user}`, (data) => {
        console.debug("Incoming trip request received!", data);
        if (data.extras) {
          handlePlayIncomingTripSound();

          handleSetStatus("INACTIVE");

          router.navigate({
            pathname: "/(tabs)/trips",
            params: {
              screen: "MAIN",
              ...data,
            },
          });
        }
      });
    }

    return () => {
      console.debug("Unsubscribing from trip_request");
      unsubscribe?.();
    };
  }, [user, status]);
}
