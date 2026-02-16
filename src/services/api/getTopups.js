import axios from "@/src/services/axios";
import storage from "../storage";

export default async function getTopup() {
  const id = storage.getString("user.id");

  console.debug("Received get topup request", id);

  if (!id) {
    console.debug("No user id found. Not proceeding with the request.");
    return [];
  }

  const response = await axios.get(
    `https://driver-93954675246.asia-southeast1.run.app/wallet/top-up?driver_id=${id}`,
  );

  return response.data || [];
}
