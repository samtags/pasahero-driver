import axios from "axios";
import storage from "@/src/services/storage";

export default async function getWallet() {
  console.log("Received request to get wallet.");

  const id = storage.getString("user.id");

  const response = await axios.get(
    `https://driver.pasahero.app/wallet?driver_id=${id}`
  );

  console.log("Wallet request response.", response);

  return response.data || {};
}
