import { useEffect, useRef, useState } from "react";
import log from "@/src/services/log";
import supabase from "../supabase";
import useOnUpdate from "./useOnUpdate";

/**
 *
 * @param {string} driver_id
 * @returns {Return}
 */
export default function useWatchDriverLocation(driver_id) {
  let prevTimestampRef = useRef();
  const channelRef = useRef(supabase.channel(`location.${driver_id}`));
  const [coordinates, setCoordinates] = useState();

  useEffect(() => handleStop, []);

  useOnUpdate(() => {
    handleStop();
    channelRef.current = supabase.channel(`location.${driver_id}`);
    handleStart();
  }, [driver_id]);

  function handleStart() {
    log.debug("Starting to watch for driver location", { driver_id });

    const channel = channelRef.current;

    channel
      ?.on("broadcast", { event: "location_update" }, (data) => {
        log.debug("Location update received.", { data, driver_id });

        if (!prevTimestampRef.current) {
          prevTimestampRef.current = data.payload.timestamp;
          setCoordinates(data.payload);
          log.debug("Initialize prevTimestamp reference", {
            data: data.payload,
            timestamp: prevTimestampRef.current,
          });
          return;
        }

        if (prevTimestampRef.current > data.payload.timestamp) {
          log.debug("Ignoring location update because of a stale timestamp", {
            location: data.payload,
            driver_id,
            previousTimestamp: prevTimestampRef.current,
            currentTimestamp: data?.payload?.timestamp,
          });
          return;
        }

        log.debug("Saving location update.", {
          location: data.payload,
          driver_id,
        });
        setCoordinates(data.payload);
      })
      .subscribe();

    log.debug("Subscribed to the location updates channel.", {
      driver_id,
      channel: `location.${driver_id}`,
    });
  }

  function handleStop() {
    log.debug("Stopping to watch for driver location", { driver_id });
    supabase.removeChannel(channelRef?.current);
  }

  return {
    handleStart,
    handleStop,
    coordinates,
  };
}

/**
 * @typedef {Object} Return
 * @property {Function} handleStart
 * @property {Function} handleStop
 * @property {Coordinates} [coordinates]
 *
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [heading]
 */
