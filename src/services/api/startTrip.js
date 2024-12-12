import axios from "axios";

export default async function startTrip(id) {
  console.debug("Received start trip request for trip id:", id);
  try {
    const response = await axios.post(
      "https://driver.pasahero.app/trip-start",
      { id }
    );

    console.debug("Successfully received start trip request for trip id:", id, response); // prettier-ignore

    return response.data;
  } catch (err) {
    console.debug("Start trip error", err);
    return Promise.reject(err);
  }
}
