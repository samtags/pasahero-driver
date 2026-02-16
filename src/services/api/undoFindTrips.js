import axios from "@/src/services/axios";
import storage from "@/src/services/storage";

export default async function undoFindTrips() {
  console.debug("Received undo find trip request.");
  const driver_id = storage.getString("user.id");

  const response = await axios.delete(
    "https://driver-93954675246.asia-southeast1.run.app/find-trips",
    {
      params: {
        driver_id,
      },
    },
  );

  if (response.status === 200) {
    console.debug("Undo find trip request success.");
    return true;
  }

  console.debug("Unable to send undo find trip request.");
  return false;
}
