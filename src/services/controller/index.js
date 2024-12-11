import { useEffect, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import storage from "@/src/services/storage";
import { handleSignInViaGoogle } from "@/src/services/auth/useOAuth";
import getOngoingTrips from "@/src/services/api/getOngoingTrips";
import getWallet from "@/src/services/api/getWallet";
import * as Location from "expo-location";
import { Alert } from "react-native";
import getProfiles from "@/src/services/api/getProfiles";
import * as supply from "@/src/services/background/supply";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";
import undoFindTrips from "@/src/services/api/undoFindTrips";
import useWillEffect from "@/src/services/hooks/useWillEffect";
import { transform } from "@/src/services/background/location";
import router from "@/src/services/router";

export default function useController() {
  const [status = "INACTIVE"] = useMMKVString("controller.status"); // ACTIVE | INACTIVE
  const [error, setError] = useState(""); // NO_BALANCE, ONGOING_TRIP, LOCATION_DENIED, BACKGROUND_LOCATION_DENIED, NO_USER, NO_PROFILE

  // trigger the supply interval & get location on app start and status is cached as ACTIVE
  useWillEffect(() => {
    const status = storage.getString("controller.status");
    if (status === "ACTIVE") {
      console.debug("Controller is Active");

      console.debug("Triggering supply interval.");
      clearInterval(createSupplyInterval);
      createSupplyInterval = setInterval(supply.create, 1000 * 7); // every 7 seconds

      // update user location
      console.debug("Updating user location.");
      handleSetUserLocation();
    }
  });

  const handlePressButton = async () => {
    console.debug("Controller button pressed.");

    const userId = storage.getString("user.id");
    setError("");

    if (!userId) {
      console.debug("No user found. Signing user via Google.");

      const isSignedIn = await handleSignInViaGoogle();
      if (!isSignedIn) {
        console.debug("User not signed in.");
        setError("NO_USER");
        return;
      }
    }

    const isForegroundLocationGranted = storage.getBoolean("settings.location.foreground.granted"); // prettier-ignore
    const isBackgroundLocationGranted = storage.getBoolean("settings.location.background.granted"); // prettier-ignore

    if (Boolean(isForegroundLocationGranted)) {
      // get location data
    } else {
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

    if (Boolean(isBackgroundLocationGranted) === false) {
      const agreeToAskPermission =
        await handleShowBackgroundLocationPermissionPrompt();

      if (agreeToAskPermission === false) {
        setError("BACKGROUND_LOCATION_DENIED");
        setIsLoading(false);
        return;
      }

      // ask for background location permission
      const backgroundPermissionStatus =
        await handleRequestBackgroundLocationPermission();

      if (backgroundPermissionStatus === false) {
        setError("BACKGROUND_LOCATION_DENIED");
        setIsLoading(false);
        return;
      }
    }

    const currentStatus = storage.getString("controller.status");

    if (currentStatus === "ACTIVE") {
      handleSetStatus("INACTIVE");
    } else {
      const tripRequest = storage.getString("__tmp_trip.request");
      console.debug("🚀 ~ handlePressButton ~ tripRequest:", tripRequest);

      if (tripRequest) {
        console.debug("User has trip request. Redirecting to trips instead.");
        return router.navigate({ pathname: "/(tabs)/trips" });
      }

      handleSetStatus("ACTIVE");
      clearInterval(createSupplyInterval);
      createSupplyInterval = setInterval(supply.create, 1000 * 7); // every 7 seconds

      getOngoingTrips().then((trips) => {
        if (trips.length > 0) {
          setError("ONGOING_TRIP");
          handleSetStatus("INACTIVE");

          const trip = trips[0];
          storage.set("__tmp_trip.active", JSON.stringify(trip));
        }
      });

      getWallet().then((wallet) => {
        // todo: configure it in growthbook
        if (wallet.balance <= -50) {
          setError("NO_BALANCE");
          handleSetStatus("INACTIVE");
        }
      });

      getProfiles().then((profiles) => {
        if (profiles.length === 0) {
          handleSetStatus("INACTIVE");
          setError("NO_PROFILE");
        }

        if (profiles.length === 1) {
          storage.set("user.service", profiles[0].service);
          storage.set("user.profile_id", profiles[0].id);
        }
      });

      getIncomingTrip().then((trip) => {
        storage.set("__tmp_trip.request", JSON.stringify(trip));
        handleSetStatus("INACTIVE");
      });

      handleSetUserLocation();
    }
  };

  useOnUpdate(() => {
    if (status === "INACTIVE") {
      clearInterval(createSupplyInterval);
      undoFindTrips();
    }
  }, [status]);

  // expose method
  handlePress = handlePressButton;

  return {
    error,
    status,
    handlePress: handlePressButton,
    clearError: setError,
  };
}

export var handlePress = () => {};
var createSupplyInterval = null;

export function handleSetStatus(status) {
  storage.set("controller.status", status);

  console.debug("Status changed to", status);
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

async function handleShowBackgroundLocationPermissionPrompt() {
  const agreeToAskPermission = await (() =>
    new Promise((resolve) => {
      Alert.alert(
        "I-set ang location permission",
        'Piliin ang "Allow all the time" para makita ng pasahero ang iyong lokasyon.',
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

  if (request.granted) handleSetUserLocation();

  return request.granted;
}

export async function handleRequestBackgroundLocationPermission() {
  const request = await Location.requestBackgroundPermissionsAsync();

  storage.set("settings.location.background.expires", request.expires);
  storage.set("settings.location.background.canAskAgain", request.canAskAgain);
  storage.set("settings.location.background.granted", request.granted);
  storage.set("settings.location.background.status", request.status);

  return request.granted;
}

function handleSetUserLocation() {
  console.debug("Setting user location.");

  // prettier-ignore
  Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation }) 
    .then((data) => {
      console.debug("Received location", transform(data));
      storage.set("user.location", JSON.stringify(transform(data)));
    })
    .catch(err => console.debug("Error getting location", err));
}
