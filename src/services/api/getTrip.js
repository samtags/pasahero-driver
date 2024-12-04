import axios from "axios";

export default async function getTrip(id) {
  const response = await axios.get(
    `https://passenger.pasahero.app/trips/${id}`
  );

  return response.data || {};
}
