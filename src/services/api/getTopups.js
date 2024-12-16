import axios from "axios";
import storage from "../storage";

export default async function getTopup() {
  const id = storage.getString("user.id");

  console.debug("Received get topup request", id);

  if (!id) {
    console.debug("No user id found. Not proceeding with the request.");
    return [];
  }

  const response = await axios.get(
    `https://driver.pasahero.app/wallet/top-up?driver_id=${id}`
  );

  return response.data || [];
}
