import axios from "axios";

/**
 *s
 * @param {string} place_id
 */
export default async function getCoordinatesByPlaceId(place_id) {
  const result = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/locations/search",
    {
      params: {
        id: place_id,
      },
    },
  );

  return result.data;
}

/* @deprecated */
export function extractCoordinates(data) {
  return data?.map((item) => ({
    placeId: item.place_id,
    shortAddress: item.structured_formatting?.main_text,
    longAddress: item.description,
  }));
}
