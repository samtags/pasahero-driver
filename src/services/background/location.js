import { useEffect } from "react";
import * as TaskManager from "expo-task-manager";
import { useMMKVBoolean } from "react-native-mmkv";
import sendLocation from "@/src/services/api/sendLocation";
import * as Location from "expo-location";

TaskManager.defineTask("background-location-task", background);

export default function useLocation() {
  const foregroundPermission = useMMKVBoolean("settings.location.foreground.granted"); // prettier-ignore
  const backgroundPermission = useMMKVBoolean("settings.location.background.granted"); // prettier-ignore

  useEffect(() => {
    let unsubscribe;

    if (foregroundPermission && backgroundPermission) {
      console.debug("Starting background location task.");

      Location.startLocationUpdatesAsync("background-location-task", {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000 * 5,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false,
        foregroundService: {
          notificationTitle: "Location in use",
          notificationBody: "Showing real-time location to the passenger.",
        },
      });
    }

    if (foregroundPermission) {
      (async () => {
        unsubscribe = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000, // Minimum time interval between updates (ms)
            distanceInterval: 10, // Minimum distance between updates (meters)
          },
          (data) => {
            console.debug("Received location update from watch position.", data); // prettier-ignore
            save(transform(data));
          }
        );
      })();
    }

    return () => {
      unsubscribe?.remove?.();
    };
  }, [foregroundPermission, backgroundPermission]);
}

function background({ data, error }) {
  console.debug("Background location task initiated.");

  if (error) {
    console.error("Background location task error", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const recentLocation = locations?.[0];

    if (recentLocation) {
      save(transform(recentLocation));
    }
  }
}

export function transform(location) {
  return {
    ...location.coords,
    mocked: location.mocked,
    timestamp: location.timestamp,
  };
}

let lastTimestamp;
function save(location) {
  console.debug("Saving location", location);

  if (!lastTimestamp) lastTimestamp = location.timestamp;

  if (lastTimestamp > location.timestamp) {
    console.debug("Ignoring location update because of a stale timestamp", { lastTimestamp, location }); // prettier-ignore
    return;
  }

  // save the location
  storage.set("user.location", JSON.stringify(location));
  // send the location
  sendLocation(location);
}
