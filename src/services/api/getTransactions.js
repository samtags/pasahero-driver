import axios from "@/src/services/axios";
import storage from "@/src/services/storage";

export default async function getTransactions() {
  const id = storage.getString("user.id");

  console.debug("Received get transactions request");

  try {
    const response = await axios.get(
      `https://driver-93954675246.asia-southeast1.run.app/wallet/transactions?driver_id=${id}`,
    );

    return response.data || [];
  } catch (error) {
    console.error("Error fetching transactions", error);
    return [];
  }
}
