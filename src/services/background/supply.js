import * as BackgroundFetch from "expo-background-fetch";
import storage from "@/src/services/storage";
import JSON from "@/src/services/json";
import findTrips from "@/src/services/api/findTrips";

export async function create() {
  console.log("Create supply task initiated.");
  const id = storage.getString("user.id");

  // check if theres a user
  if (!id) {
    console.log("No user found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const status = storage.getString("controller.status");
  const locationString = storage.getString("user.location");

  // check if the controller status is active
  if (status !== "ACTIVE") {
    console.log("Controller status is not active.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const service = storage.getString("user.service");

  if (!service) {
    console.log("No service found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const location = JSON.parse(locationString, {});
  if (!location.latitude || !location.longitude) {
    console.log("No location found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  await findTrips(location, service);

  return BackgroundFetch.BackgroundFetchResult.NewData;
}

export function register() {
  console.log("Registering background supply task.");
  return BackgroundFetch.registerTaskAsync("background-supply", {
    minimumInterval: 8, // 8 seconds
    stopOnTerminate: true, // android only,
    startOnBoot: false, // android only
  });
}

export function unregister() {
  console.log("Unregistering background supply task.");
  return BackgroundFetch.unregisterTaskAsync("background-supply");
}
