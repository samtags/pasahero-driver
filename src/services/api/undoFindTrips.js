import axios from "axios";
import storage from "@/src/services/storage";

export default async function undoFindTrips() {
  console.log("Received undo find trip request.");
  const driver_id = storage.getString("user.id");

  const response = await axios.delete(
    "https://driver.pasahero.app/find-trips",
    {
      params: {
        driver_id,
      },
    }
  );

  if (response.status === 200) {
    console.log("Undo find trip request success.");
    return true;
  }

  console.log("Unable to send undo find trip request.");
  return false;
}
