import axios from "axios";

export default async function cancelTrip(id) {
  console.debug("Received cancel trip request for trip:", id);
  try {
    const response = await axios.post(
      "https://driver.pasahero.app/trip-cancel",
      { id }
    );

    console.debug("Successfully received cancel trip request for trip:", id, response); // prettier-ignore

    return response.data;
  } catch (err) {
    console.debug("Cancel trip error", err);
    return Promise.reject(err);
  }
}
