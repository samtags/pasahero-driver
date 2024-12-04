import axios from "axios";

export default async function getTrips(passenger_id) {
  const response = await axios.get(
    "https://passenger.pasahero.app/trips-ongoing",
    {
      params: {
        passenger_id,
      },
    }
  );

  return response.data || [];
}
