import { useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import storage from "@/src/services/storage";
import { handleSignInViaGoogle } from "@/src/services/auth/useOAuth";

export default function useController() {
  const [status = "INACTIVE", setStatus] = useMMKVString("controller.status"); // ACTIVE | INACTIVE
  const [error, setError] = useState(""); // NO_BALANCE, ONGOING_TRIP, NO_VERIFIED_PROFILE, LOCATION_DENIED, BACKGROUND_LOCATION_DENIED, NO_USER

  const handlePress = async () => {
    console.log("Controller button pressed.");

    const userId = storage.getString("user.id");
    if (!userId) {
      console.log("No user found. Signing user via Google.");

      const isSignedIn = await handleSignInViaGoogle();
      if (!isSignedIn) {
        console.log("User not signed in.");
        setError("NO_USER");
        return;
      }
    }

    const currentStatus = storage.getString("controller.status");

    if (currentStatus === "ACTIVE") {
      handleSetStatus("INACTIVE");
    } else {
      handleSetStatus("ACTIVE");
    }
  };

  return {
    error,
    status,
    handlePress,
  };
}

export function handleSetStatus(status) {
  storage.set("controller.status", status);

  console.log("Status changed to", status);
}
