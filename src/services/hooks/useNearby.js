import { useState } from "react";
import moment from "moment";
import getNearbyTrips from "@/src/services/api/getNearbyTrips";

let timeout;
let tmp = [];
let ids = [];
export default function useNearby() {
  const [trips, setTrips] = useState([]);

  function removeFromNearby(id) {
    tmp = tmp.filter((trip) => trip.id !== id);

    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  }

  removeTrip = removeFromNearby;

  return {
    trips,
    onCameraChanged(camera) {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const latitude = camera.properties.center[1];
        const longitude = camera.properties.center[0];

        const nearby = await getNearbyTrips(latitude, longitude);

        nearby.forEach((trip) => {
          if (ids.includes(trip.id)) return;

          ids.push(trip.id);
          tmp.push(trip);
        });

        // remove all that already possibly timeout
        const now = moment();
        console.log({ tmp });
        tmp = tmp.filter((trip) => {
          const expiration = moment(trip.created_at).add(2, "minutes");

          // expired if expiration is less than now
          const isExpired = now.isAfter(expiration);

          if (isExpired) return false;
          return true;
        });

        setTrips(tmp);
      }, 250);
    },
  };
}

export var removeTrip = () => {};
