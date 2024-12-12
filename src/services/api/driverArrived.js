import axios from "axios";

export default async function driverArrived(id) {
  console.debug("Received driver arrived request for trip id:", id);
  try {
    const response = await axios.post(
      "https://driver.pasahero.app/trip-driver-arrived",
      { id }
    );

    console.debug("Successfully received driver arrived request for trip id:", id, response); // prettier-ignore

    return response.data;
  } catch (err) {
    console.debug("Driver arrived error", err);
    return Promise.reject(err);
  }
}
