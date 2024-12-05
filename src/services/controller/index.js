import { useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import storage from "@/src/services/storage";
import { handleSignInViaGoogle } from "@/src/services/auth/useOAuth";
import getOngoingTrips from "@/src/services/api/getOngoingTrips";
import getWallet from "@/src/services/api/getWallet";
import * as Location from "expo-location";
import { Alert } from "react-native";

export default function useController() {
  const [status = "INACTIVE"] = useMMKVString("controller.status"); // ACTIVE | INACTIVE
  const [error, setError] = useState(""); // NO_BALANCE, ONGOING_TRIP, NO_VERIFIED_PROFILE, LOCATION_DENIED, BACKGROUND_LOCATION_DENIED, NO_USER

  const handlePress = async () => {
    console.log("Controller button pressed.");

    const userId = storage.getString("user.id");
    setError("");

    if (!userId) {
      console.log("No user found. Signing user via Google.");

      const isSignedIn = await handleSignInViaGoogle();
      if (!isSignedIn) {
        console.log("User not signed in.");
        setError("NO_USER");
        return;
      }
    }

    const isForegroundLocationGranted = storage.getBoolean("settings.location.foreground.granted"); // prettier-ignore

    if (Boolean(isForegroundLocationGranted) === false) {
      const agreeToAskPermission = await handleShowLocationPermissionPrompt();

      if (agreeToAskPermission === false) {
        setError("LOCATION_DENIED");
        return;
      }

      const foregroundPermissionStatus =
        await handleRequestForegroundLocationPermission();

      if (foregroundPermissionStatus === false) {
        // if not, show location denied prompt to the user
        setError("LOCATION_DENIED");
        return;
      }
    }

    const currentStatus = storage.getString("controller.status");

    if (currentStatus === "ACTIVE") {
      handleSetStatus("INACTIVE");
    } else {
      handleSetStatus("ACTIVE");

      getOngoingTrips().then((trips) => {
        if (trips.length > 0) {
          setError("ONGOING_TRIP");
          handleSetStatus("INACTIVE");
        }
      });

      getWallet().then((wallet) => {
        // todo: configure it in growthbook
        if (wallet.balance <= -50) {
          setError("NO_BALANCE");
          handleSetStatus("INACTIVE");
        }
      });
    }
  };

  return {
    error,
    status,
    handlePress,
    clearError: setError,
  };
}

export function handleSetStatus(status) {
  storage.set("controller.status", status);

  console.log("Status changed to", status);
}

async function handleShowLocationPermissionPrompt() {
  const agreeToAskPermission = await (() =>
    new Promise((resolve) => {
      Alert.alert(
        "Pahintulot sa pag access ng location",
        "Gagamitin ito sa pag hanap ng mga pasahero na malapit sa iyong location. I-click ang 'Allow' para mag patuloy.",
        [
          {
            text: "Close",
            style: "default",
            onPress: () => resolve(false),
          },
          {
            text: "Allow",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]
      );
    }))();

  return agreeToAskPermission;
}

export async function handleRequestForegroundLocationPermission() {
  const request = await Location.requestForegroundPermissionsAsync();

  storage.set("settings.location.foreground.expires", request.expires);
  storage.set("settings.location.foreground.canAskAgain", request.canAskAgain);
  storage.set("settings.location.foreground.granted", request.granted);
  storage.set("settings.location.foreground.status", request.status);

  return request.granted;
}
