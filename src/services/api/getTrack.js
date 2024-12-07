import axios from "axios";
import * as Polyline from "@mapbox/polyline";

export default async function getTrack(origin, destination) {
  const response = await axios.get(
    `https://passenger.pasahero.app/locations/route?origin=${origin}&destination=${destination}`
  );

  let coordinates = [];

  try {
    coordinates = Polyline.decode(response?.data?.encoded).map((coordinate) => [
      coordinate[1],
      coordinate[0],
    ]);
  } catch (error) {
    console.debug("Unable to decode polyline", error);
  }

  const data = response?.data || {};
  data.coordinates = coordinates;

  return data;
}
