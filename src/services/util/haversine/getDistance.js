import log from "@/src/services/log";

const GLOBE_RADIUS = 6371;

export default function getDistance(
  latitude0,
  longitude0,
  latitude1,
  longitude1,
) {
  let isValid = Boolean(Array.from(arguments).every((arg) => Boolean(arg)));

  if (isValid === false) {
    log.debug(
      "Unable to get distance between coordinates. Due to invalid coordinates.",
      { latitude0, longitude0, latitude1, longitude1 },
    );
    return 0;
  }

  const degreeToRadius = (deg) => deg * (Math.PI / 180);

  const latitudeDifference = degreeToRadius(latitude1 - latitude0);
  const longitudeDifference = degreeToRadius(longitude1 - longitude0);

  // haversine formula
  const distance =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(degreeToRadius(latitude0)) *
      Math.cos(degreeToRadius(latitude1)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const centralAngle =
    2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));

  const distanceInKm = GLOBE_RADIUS * centralAngle;
  return Number(distanceInKm.toFixed(2));
}
