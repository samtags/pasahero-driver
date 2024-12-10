import axios from "axios";
import storage from "@/src/services/storage";

export default async function rejectTripRequest(id) {
  const driver_id = storage.getString("user.id");
  console.debug("Received reject trip request", { id });

  const config = {
    method: "delete",
    url: "https://driver.pasahero.app/take-trip",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ id, driver_id }),
  };

  await axios(config);
  console.debug("Rejected trip request success!", { id });
}
