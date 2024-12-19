import axios from "axios";
import storage from "@/src/services/storage";

/**
 *
 * @param {string} profile_id
 */
export default async function getDriverProfile(profile_id) {
  console.debug("Received get driver profile request", { profile_id });
  const response = await axios.get(
    `https://driver.pasahero.app/profiles/${profile_id}`
  );

  if (response?.data) {
    storage.set(`__tmp_profile.${profile_id}`, JSON.stringify(response.data));
  }

  console.debug("Received get driver profile response", response?.data);

  return response?.data;
}
