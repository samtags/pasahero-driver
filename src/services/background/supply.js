import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useEffect } from "react";
import storage from "@/src/services/storage";
import JSON from "@/src/services/json";
import findTrips from "@/src/services/api/findTrips";

TaskManager.defineTask("background-supply", background);

export default function useSupply() {
  useEffect(() => {
    register();
    return unregister;
  }, []);
}

export async function create() {
  console.debug("Create supply task initiated.");
  const id = storage.getString("user.id");

  // check if theres a user
  if (!id) {
    console.debug("No user found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const status = storage.getString("controller.status");
  const locationString = storage.getString("user.location");

  // check if the controller status is active
  if (status !== "ACTIVE") {
    console.debug("Controller status is not active.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const service = storage.getString("user.service");

  if (!service) {
    console.debug("No service found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  const location = JSON.parse(locationString, {});

  if (!location.latitude || !location.longitude) {
    console.debug("No location found.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }

  await findTrips(location, service);

  return BackgroundFetch.BackgroundFetchResult.NewData;
}

export async function background() {
  console.debug("Initiated from background.");
  await create();
}

export function register() {
  console.debug("Registering background supply task.");
  return BackgroundFetch.registerTaskAsync("background-supply", {
    minimumInterval: 8, // 8 seconds
    stopOnTerminate: true, // android only,
    startOnBoot: false, // android only
  });
}

export function unregister() {
  console.debug("Unregistering background supply task.");
  return BackgroundFetch.unregisterTaskAsync("background-supply");
}
