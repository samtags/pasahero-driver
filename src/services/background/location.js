import { useEffect } from "react";
import * as TaskManager from "expo-task-manager";
import { useMMKVBoolean } from "react-native-mmkv";
import sendLocation from "@/src/services/api/sendLocation";
import * as Location from "expo-location";
import storage from "@/src/services/storage";

TaskManager.defineTask("background-location-task", background);

export default function useLocation() {
  const [foregroundPermission] = useMMKVBoolean("settings.location.foreground.granted"); // prettier-ignore
  const [backgroundPermission] = useMMKVBoolean("settings.location.background.granted"); // prettier-ignore

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;

    if (foregroundPermission === true && backgroundPermission === true) {
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
      }).catch((error) => {
        console.debug("Failed to start background location task.", { error });
      });
    }

    if (foregroundPermission === true) {
      (async () => {
        try {
          unsubscribe = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000, // Minimum time interval between updates (ms)
              distanceInterval: 10, // Minimum distance between updates (meters)
            },
            (data) => {
              if (cancelled) return;
              console.debug("Received location update from watch position.", data); // prettier-ignore
              save(transform(data));
            }
          );
        } catch (error) {
          console.debug("Failed to start foreground watch position.", { error });
        }
      })();
    }

    return () => {
      cancelled = true;
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
