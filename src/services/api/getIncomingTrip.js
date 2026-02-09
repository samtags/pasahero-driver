import axios from "axios";
import storage from "@/src/services/storage";

export default async function getIncomingTrip() {
  console.debug("Received get incoming trip request");
  const id = storage.getString("user.id");

  const response = await axios
    .get(
      `https://driver-93954675246.asia-southeast1.run.app/trip-incoming?id=${id}`,
    )
    .catch(() => {
      return { data: undefined };
    });

  console.debug("Received get incoming trip response", response);
  return response.data;
}
