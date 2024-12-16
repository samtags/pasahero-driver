import axios from "axios";
import storage from "@/src/services/storage";

export default async function getTransactions() {
  const id = storage.getString("user.id");

  console.debug("Received get transactions request");

  const response = await axios.get(
    `https://driver.pasahero.app/wallet/transactions?driver_id=${id}`
  );

  return response.data || [];
}
