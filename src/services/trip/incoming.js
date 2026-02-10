import { useStream } from "@aptly-sdk/brook/react";
import { useMMKVString } from "react-native-mmkv";
import router from "@/src/services/router";
import { handleSetStatus } from "@/src/services/controller";
import handlePlayIncomingTripSound from "@/src/services/notification/handlePlayIncomingTripSound";
import storage from "../storage";

export default function useSubscribeToIncomingTrip() {
  const [user] = useMMKVString("user.id");

  useStream(`trip_request.${user}`, (data, metadata) => {
    const status = storage.getString("controller.status");

    if (!user) return;
    if (status !== "ACTIVE") return;
    if (metadata?.replay) return;

    if (data.extras) {
      handlePlayIncomingTripSound();

      handleSetStatus("INACTIVE");

      storage.set("__tmp_trip.request", JSON.stringify(data.extras));

      console.log("Navigating to trip screen with data:", data);

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
