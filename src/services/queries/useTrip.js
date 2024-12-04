import { useEffect, useState } from "react";
import useOnAppFocus from "../hooks/useFocus";
import getTrip from "../api/getTrip";
import subscribe from "../realtime";

export default function useTrip(id, defaultValue) {
  const [trip, setTrip] = useState(defaultValue || {});

  function handleUpdateTrip(tripData) {
    console.log("Updating trip state.");
    setTrip((prev) => ({
      ...(prev || {}),
      ...tripData,
    }));
  }

  async function handleGetTrip() {
    console.log("Getting trip details");
    const response = await getTrip(id);

    if (response?.id) {
      console.log("Trip details successfully retrieved.");
      return handleUpdateTrip(response);
    }

    console.log("Unable to get trip details", response);
  }

  useOnAppFocus(() => {
    console.log("Trip refocused.");
    handleGetTrip();
  });

  useEffect(() => {
    handleGetTrip();

    console.log(`Subscribing to to trip.${id}`);

    const unsubscribe = subscribe(`trips.${id}`, (incomingData) => {
      console.log("Received trip update", incomingData);
      handleUpdateTrip(incomingData);
    });

    return () => {
      console.log("Unsubscribing trip");
      unsubscribe();
    };
  }, []);

  return trip;
}
