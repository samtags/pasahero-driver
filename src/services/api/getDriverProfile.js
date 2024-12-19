import axios from "axios";
import log from "../log";

/**
 *
 * @param {string} profile_id
 */
export default async function getDriverProfile(profile_id) {
  const response = await axios.get(
    `https://driver.pasahero.app/profiles/${profile_id}`
  );

  return response?.data;
}
