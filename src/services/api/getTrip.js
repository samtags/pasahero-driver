import axios from "axios";

export default async function getTrip(id) {
  console.debug("Received get trip request");
  const response = await axios.get(
    `https://driver.pasahero.app/trips?id=${id}`
  );

  return response.data || {};
}
