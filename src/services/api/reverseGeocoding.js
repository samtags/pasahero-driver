import axios from "axios";
import Const from "expo-constants";

const key = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

/** @param {string} latlng */
export default async function reverseGeocode(latlng) {
  return await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      key,
      latlng,
      result_type: "establishment|street_address",
    },
  });
}
