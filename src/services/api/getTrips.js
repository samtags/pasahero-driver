import axios from "axios";

export default async function getTrips(passenger_id) {
  const response = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/trips-ongoing",
    {
      params: {
        passenger_id,
      },
    },
  );

  return response.data || [];
}
