import axios from "axios";
import storage from "@/src/services/storage";

export default async function getWallet() {
  console.debug("Received request to get wallet.");

  const id = storage.getString("user.id");

  const response = await axios.get(
    `https://driver-93954675246.asia-southeast1.run.app/wallet?driver_id=${id}`,
  );

  console.debug("Wallet request response.", response);

  return response.data || {};
}
