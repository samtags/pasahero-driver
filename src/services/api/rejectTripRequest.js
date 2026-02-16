import axios from "@/src/services/axios";
import storage from "@/src/services/storage";

export default async function rejectTripRequest(id) {
  const driver_id = storage.getString("user.id");
  console.debug("Received reject trip request", { id });

  const config = {
    method: "delete",
    url: "https://driver-93954675246.asia-southeast1.run.app/take-trip",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ id, driver_id }),
  };

  await axios(config);
  console.debug("Rejected trip request success!", { id });
}
