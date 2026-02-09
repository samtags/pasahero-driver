import storage from "@/src/services/storage";
import axios from "axios";

export default async function createProfile(service) {
  const driver_id = storage.getString("user.id");
  console.debug("Received create profile request", { driver_id, service });

  const response = await axios.post(
    "https://driver-93954675246.asia-southeast1.run.app/profiles",
    {
      driver_id,
      service,
    },
  );

  return response?.data;
}
