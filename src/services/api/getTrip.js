import axios from "axios";

export default async function getTrip(id) {
  console.debug("Received get trip request");
  const response = await axios.get(
    `https://driver-93954675246.asia-southeast1.run.app/trips?id=${id}`,
  );

  return response.data || {};
}
