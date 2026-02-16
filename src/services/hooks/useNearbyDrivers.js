import { useEffect, useRef, useState } from "react";
import getNearbyDrivers from "../api/getNearbyDrivers";
import supabase from "../supabase";
import log from "@/src/services/log";
import storage from "../storage";

/**
 *
 * @param {Props} props
 * @returns {{nearbyDriverIds: string[], handleStop: () => void, handleStart: () => void}}
 */
export default function useNearbyDrivers({ startOnMount = true, payload }) {
  const idsRef = useRef([]);
  const timerRef = useRef(null);
  const nearbyDriverLocationMapRef = useRef(new Map());
  const [nearbyDriverIds, setNearbyDriverIds] = useState([]);

  async function handleGetNearbyDriversAndSubscribe() {
    log.debug("Getting nearby drivers...", { payload });

    // get nearby drivers
    const nearbyDrivers = await getNearbyDrivers(payload.latitude, payload.longitude); // prettier-ignore

    const nearbyDriverIds = nearbyDrivers?.map(driver => driver?.user_id) || []; // prettier-ignore
    const nearbyDriverLocationMap = nearbyDriverLocationMapRef.current;

    nearbyDrivers?.forEach((driver) => {
      nearbyDriverLocationMap.set(driver?.user_id, driver);
    });

    log.debug("Nearby drivers found.", { nearbyDrivers, nearbyDriverIds, payload }); // prettier-ignore

    // unsubscribe from the previous subscriptions
    const ids = idsRef.current;
    // handleUnsubscribe(ids);

    // subscribe to the new driver location updates
    handleSubscribe(nearbyDriverIds);

    // update the ref and state
    idsRef.current = nearbyDriverIds;
    setNearbyDriverIds(nearbyDriverIds);

    log.debug("Nearby drivers updated.", {
      prevIds: ids,
      newState: nearbyDriverIds,
      newIds: idsRef.current,
    });
  }

  function handleStart() {
    handleGetNearbyDriversAndSubscribe();

    timerRef.current = setInterval(() => {
      handleGetNearbyDriversAndSubscribe();
    }, 1000 * 20); // every minute

    log.debug("Started the nearby drivers service.");
  }

  function handleStop() {
    const ids = idsRef.current;
    handleUnsubscribe(ids);

    idsRef.current = [];
    setNearbyDriverIds([]);

    log.debug("Stopped the nearby drivers service.", { ids });

    clearNearbyDrivers();
  }

  useEffect(() => {
    log.debug("Initializing the nearby drivers service...");

    if (startOnMount) {
      handleStart();
    }

    return () => {
      handleStop();
      clearInterval(timerRef.current);
    };
  }, []);

  return {
    nearbyDriverIds,
    handleStop,
    handleStart,
    nearbyDriverLocationMap: nearbyDriverLocationMapRef.current,
  };
}

/**
 *
 * @param {string[]} ids
 */
function handleUnsubscribe(ids = []) {
  ids.forEach((user_id) => {
    supabase.removeChannel(`location.${user_id}`);
  });

  log.debug("Unsubscribed from the location updates channels.", { ids });
}

/**
 *
 * @param {string[]} ids
 */
function handleSubscribe(ids = []) {
  ids.forEach((user_id) => {
    const channel = supabase.channel(`location.${user_id}`);
    log.debug(`Subscribing to the location updates channel for driver ${user_id}.`); // prettier-ignore

    channel
      .on("broadcast", { event: "location_update" }, (data) => {
        log.debug("Received a location update.", { user_id, data });
        storage.set(`location.${user_id}`, JSON.stringify(data));
      })
      .subscribe();
  });

  log.debug("Subscribed to the location updates channels.", { ids });
}

function clearNearbyDrivers() {
  const deletedKeys = [];

  storage.getAllKeys().forEach((key) => {
    if (key === "location.current") return; // skip the current location

    if (key.includes("location.")) {
      storage.delete(key);
      deletedKeys.push(key);
    }
  });

  log.debug("Cleared the nearby drivers cache.", { deletedKeys });
}

/**
 *
 * @typedef {Object} Payload
 * @property {number} latitude
 * @property {number} longitude
 *
 * @typedef {Object} Props
 * @property {Payload} payload
 * @property {boolean} [startOnMount]
 */
