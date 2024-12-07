import { useEffect, useState } from "react";
import useOnAppFocus from "../hooks/useFocus";
import getTrip from "../api/getTrip";
import subscribe from "../realtime";

export default function useTrip(id, defaultValue) {
  const [trip, setTrip] = useState(defaultValue || {});

  function handleUpdateTrip(tripData) {
    console.debug("Updating trip state.");
    setTrip((prev) => ({
      ...(prev || {}),
      ...tripData,
    }));
  }

  async function handleGetTrip() {
    console.debug("Getting trip details");
    const response = await getTrip(id);

    if (response?.id) {
      console.debug("Trip details successfully retrieved.");
      return handleUpdateTrip(response);
    }

    console.debug("Unable to get trip details", response);
  }

  useOnAppFocus(() => {
    console.debug("Trip refocused.");
    handleGetTrip();
  });

  useEffect(() => {
    handleGetTrip();

    console.debug(`Subscribing to to trip.${id}`);

    const unsubscribe = subscribe(`trips.${id}`, (incomingData) => {
      console.debug("Received trip update", incomingData);
      handleUpdateTrip(incomingData);
    });

    return () => {
      console.debug("Unsubscribing trip");
      unsubscribe();
    };
  }, []);

  return trip;
}
